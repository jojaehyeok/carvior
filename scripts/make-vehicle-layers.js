// close-all.png(닫힘)과 각 "열림" 이미지의 차이 픽셀만 뽑아 투명 PNG 레이어를 만든다.
// 네 이미지가 같은 구도/같은 크기라, 다른 픽셀 = 열린 문짝 + 그 뒤로 드러난 부분이다.
// 이렇게 만든 레이어는 겹쳐도 서로 안 덮으므로 여러 문을 동시에 열 수 있다.
//
// 외부 라이브러리 없이 zlib(내장)만 써서 PNG를 직접 읽고 쓴다.

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const PUB = process.argv[2];

// ── CRC32 (PNG 청크용) ──────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG 디코드 (8bit RGBA, 비인터레이스만) ───────────────────────────
function decode(file) {
  const buf = fs.readFileSync(file);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  if (buf[24] !== 8 || buf[25] !== 6 || buf[28] !== 0) throw new Error('지원하지 않는 PNG 형식: ' + file);

  const idat = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + len));
    if (type === 'IEND') break;
    off += 12 + len;
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4, stride = w * bpp;
  const out = Buffer.alloc(h * stride);

  // 스캔라인 필터 해제 (PNG spec 9.2)
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      switch (filter) {
        case 0: break;
        case 1: v = v + a; break;
        case 2: v = v + b; break;
        case 3: v = v + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error('알 수 없는 필터 ' + filter);
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, data: out };
}

// ── PNG 인코드 ──────────────────────────────────────────────────────
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encode({ w, h, data }, file) {
  const stride = w * 4;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]));
}

// ── 차이 레이어 만들기 ───────────────────────────────────────────────
// THRESHOLD: 압축 노이즈로 생기는 미세한 차이는 무시한다.
const THRESHOLD = 150;
// 마스크를 조금 부풀려서 경계에 배경색 테두리가 남지 않게 한다.
const DILATE = 2;

function makeLayer(baseImg, openImg, outFile) {
  const { w, h } = baseImg;
  const n = w * h;
  const mask = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const d =
      Math.abs(baseImg.data[o] - openImg.data[o]) +
      Math.abs(baseImg.data[o + 1] - openImg.data[o + 1]) +
      Math.abs(baseImg.data[o + 2] - openImg.data[o + 2]) +
      Math.abs(baseImg.data[o + 3] - openImg.data[o + 3]);
    if (d > THRESHOLD) mask[i] = 1;
  }

  // 팽창 — 가로/세로로 각각 훑어서 사각 커널 효과를 낸다
  let cur = mask;
  for (let pass = 0; pass < DILATE; pass++) {
    const next = new Uint8Array(n);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (cur[i]) { next[i] = 1; continue; }
        if (x > 0 && cur[i - 1]) { next[i] = 1; continue; }
        if (x < w - 1 && cur[i + 1]) { next[i] = 1; continue; }
        if (y > 0 && cur[i - w]) { next[i] = 1; continue; }
        if (y < h - 1 && cur[i + w]) { next[i] = 1; continue; }
      }
    }
    cur = next;
  }

  const out = Buffer.alloc(n * 4); // 전부 투명으로 시작
  let kept = 0;
  for (let i = 0; i < n; i++) {
    if (!cur[i]) continue;
    const o = i * 4;
    out[o] = openImg.data[o];
    out[o + 1] = openImg.data[o + 1];
    out[o + 2] = openImg.data[o + 2];
    out[o + 3] = openImg.data[o + 3];
    kept++;
  }

  encode({ w, h, data: out }, outFile);
  const box = bbox(cur, w, h);
  console.log(
    path.basename(outFile).padEnd(28),
    (kept / n * 100).toFixed(1) + '% 픽셀',
    'bbox x', (box.x0 / w * 100).toFixed(0) + '~' + (box.x1 / w * 100).toFixed(0) + '%',
    'y', (box.y0 / h * 100).toFixed(0) + '~' + (box.y1 / h * 100).toFixed(0) + '%',
    (fs.statSync(outFile).size / 1024).toFixed(0) + 'KB',
  );
}

function bbox(mask, w, h) {
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!mask[y * w + x]) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1 };
}

const base = decode(path.join(PUB, 'close-all.png'));
const jobs = [
  ['open-frontdoor.png',  'layer-frontdoor.png'],
  ['open-backdoor1.png',  'layer-reardoor.png'],
  ['open-backdoor.png',   'layer-trunk.png'],
];
for (const [src, out] of jobs) {
  makeLayer(base, decode(path.join(PUB, src)), path.join(PUB, out));
}
