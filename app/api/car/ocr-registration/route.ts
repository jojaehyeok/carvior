import { NextRequest, NextResponse } from 'next/server';

const CLOVA_URL    = process.env.CLOVA_OCR_API_URL ?? '';
const CLOVA_SECRET = process.env.CLOVA_OCR_SECRET  ?? '';

type ClovaField = { inferText: string };
type ClovaImage = { inferResult: string; fields: ClovaField[] };

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();
    const format = (mediaType || 'image/jpeg').split('/')[1] || 'jpg';

    const res = await fetch(CLOVA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': CLOVA_SECRET,
      },
      body: JSON.stringify({
        version: 'V2',
        requestId: crypto.randomUUID(),
        timestamp: Date.now(),
        lang: 'ko',
        images: [{ format, name: 'reg', data: imageBase64 }],
        enableTableDetect: false,
      }),
    });

    if (!res.ok) throw new Error(`Clova ${res.status}`);

    const json = await res.json();
    const img  = json.images?.[0] as ClovaImage | undefined;
    if (img?.inferResult !== 'SUCCESS') throw new Error('OCR 실패');

    const texts = (img.fields ?? []).map((f: ClovaField) => f.inferText);
    return NextResponse.json(parseRegistration(texts));
  } catch (err) {
    console.error('[ocr-registration]', err);
    return NextResponse.json({ error: '인식 실패' }, { status: 500 });
  }
}

// ── 자동차등록증 파싱 ───────────────────────────────────
function findAfter(texts: string[], keywords: string[]): string | null {
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i].replace(/\s/g, '');
    for (const kw of keywords) {
      const k = kw.replace(/\s/g, '');
      if (!t.startsWith(k)) continue;

      // 같은 블록 안에 값이 포함된 경우 (예: "차명스포티지")
      const colonIdx = t.indexOf(':');
      const rest = colonIdx >= 0 ? t.slice(colonIdx + 1) : t.slice(k.length);
      if (rest.trim()) return rest.trim();

      // 다음 블록들에서 값 찾기 (키워드가 아닌 첫 번째 블록)
      for (let j = i + 1; j <= Math.min(i + 3, texts.length - 1); j++) {
        const next = texts[j].trim();
        if (!next) continue;
        // 다른 레이블이면 스킵
        if (/^(성명|차명|차대번호|배기량|연료|연식|승차|색상|주소|최초|형식|제작)/.test(next.replace(/\s/g, ''))) continue;
        return next;
      }
    }
  }
  return null;
}

const FUEL_MAP: Record<string, string> = {
  '휘발유': '가솔린', '가솔린': '가솔린',
  '경유': '디젤', '디젤': '디젤',
  '하이브리드': '하이브리드',
  'LPG': 'LPG', '액화석유': 'LPG',
  '전기': '전기',
};

function parseRegistration(texts: string[]) {
  const blob = texts.join(' ');

  // 차량번호 (예: 12가3456 / 서울12가3456)
  const plate = /([가-힣]{0,2}\s*\d{2,3}\s*[가-힣]\s*\d{4})/.exec(blob)?.[1]?.replace(/\s/g, '') ?? null;

  // 연식 — "연식" 또는 "형식" 뒤 4자리 연도
  const year = /(?:연식|형식)[^0-9]*(\d{4})/.exec(blob)?.[1] ?? null;

  // 배기량 숫자만
  const dispNum = /배기량[^0-9]*(\d{3,5})/.exec(blob)?.[1];
  const displacement = dispNum ? `${dispNum}cc` : null;

  // 승차정원
  const seats = /승차정원[^0-9]*(\d{1,2})/.exec(blob)?.[1] ?? null;

  // 최초등록일
  const dr = /최초등록일[^0-9]*(\d{4})[.년\-](\d{1,2})[.월\-](\d{1,2})/.exec(blob);
  const registrationDate = dr
    ? `${dr[1]}-${dr[2].padStart(2, '0')}-${dr[3].padStart(2, '0')}`
    : null;

  // 연료
  const fuelRaw = findAfter(texts, ['연료의종류', '연료의 종류', '연료종류', '연료']) ?? blob;
  const fuelKey = Object.keys(FUEL_MAP).find(k => fuelRaw.includes(k));

  return {
    plateNumber:      plate,
    ownerName:        findAfter(texts, ['성명', '성 명']),
    vin:              findAfter(texts, ['차대번호']),
    carName:          findAfter(texts, ['차명', '차 명']),
    carBrand:         findAfter(texts, ['제작자', '제조사', '제작회사']),
    modelYear:        year,
    displacement,
    fuelType:         fuelKey ? FUEL_MAP[fuelKey] : null,
    transmission:     null,
    seats,
    color:            findAfter(texts, ['색상', '차체색상', '색 상']),
    registrationDate,
    ownerAddress:     findAfter(texts, ['주소', '주 소']),
  };
}
