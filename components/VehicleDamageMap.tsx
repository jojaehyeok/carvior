'use client';

// 매물 상세 "차량 상태" — 차량 일러스트 위에 손상 부위 핀을 얹어 보여준다.
//
// 그림은 한쪽 옆면만 보이므로 운전석/조수석 두 장(좌우 대칭)을 쓰고, 핀 좌표는 한 벌만
// 관리한다(조수석은 x를 100에서 뺀 값 = 좌우 반전).
//
// ⚠ 진단 부위 37개 중 그림에 찍을 수 있는 건 외판 19개뿐이다. 나머지 18개(사이드멤버,
// 휠하우스, 크로스멤버, 대쉬패널, 플로어 등)는 차체 안쪽 골격이라 그림에 자리가 없어서
// 아래 목록으로 따로 보여준다 — 딜러에게 가장 중요한 정보라 절대 빠뜨리면 안 된다.

import { useState } from 'react';

// 진단 부위 인덱스는 리포트(PART_NAMES)와 같은 순서를 쓴다.
export const PART_NAMES = [
  '운전석 앞휀더', '운전석 앞도어', '운전석 A필러', '운전석 사이드실 패널',
  '운전석 B필러', '운전석 뒷도어', '운전석 C필러', '운전석 쿼터패널',
  '후드', '루프패널', '트렁크 리드',
  '조수석 앞휀더', '조수석 A필러', '조수석 앞도어', '조수석 사이드실 패널',
  '조수석 B필러', '조수석 뒷도어', '조수석 C필러', '조수석 쿼터패널',
  '라디에이터 서포트', '프런트 패널',
  '운전석 인사이드 패널', '운전석 프런트 사이드멤버', '조수석 프런트 사이드멤버',
  '조수석 인사이드 패널', '운전석 프런트 휠하우스', '조수석 프런트 휠하우스',
  '크로스 멤버', '대쉬 패널', '플로어 패널', '패키지 트레이',
  '운전석 리어 휠하우스', '운전석 리어 사이드멤버', '트렁크 플로어 패널',
  '조수석 리어 사이드멤버', '조수석 리어 휠하우스', '리어 패널',
];

const SYMBOL_STYLE: Record<string, { label: string; bg: string }> = {
  X: { label: '교환',      bg: '#ef4444' },
  W: { label: '판금/용접', bg: '#3b82f6' },
  B: { label: '판금/용접', bg: '#3b82f6' },
  M: { label: '탈부착',    bg: '#eab308' },
  A: { label: '흠집',      bg: '#3b82f6' },
  U: { label: '요철',      bg: '#a855f7' },
  T: { label: '깨짐',      bg: '#6b7280' },
  C: { label: '부식',      bg: '#22c55e' },
  P: { label: '도장필요',  bg: '#ec4899' },
};

// 그림 위 핀 위치(운전석 이미지 open-left.png 기준 %). 조수석은 x를 100에서 뺀다.
// 이미지가 3:2(1536×1024)이고 컨테이너도 aspect-[3/2] + object-contain이라 %가 그대로 맞는다.
// 그림을 바꾸면 이 값들도 같이 다시 잡아야 한다.
const SLOT_POS: Record<string, { x: number; y: number }> = {
  frontPanel:  { x: 7,  y: 63 },  // 프런트 패널(그릴 주변)
  hood:        { x: 24, y: 33 },  // 열려 있는 후드
  frontFender: { x: 33, y: 57 },  // 앞휀더(앞바퀴 위)
  aPillar:     { x: 45, y: 30 },  // A필러(앞유리 옆)
  frontDoor:   { x: 60, y: 62 },  // 열려 있는 앞도어
  sideSill:    { x: 70, y: 80 },  // 사이드실(문 아래 문턱)
  bPillar:     { x: 73, y: 40 },  // B필러
  rearDoor:    { x: 81, y: 55 },  // 열려 있는 뒷도어
  cPillar:     { x: 88, y: 32 },  // C필러
  quarter:     { x: 91, y: 52 },  // 쿼터패널(뒷바퀴 위)
  roof:        { x: 63, y: 18 },  // 루프
  trunk:       { x: 86, y: 14 },  // 열려 있는 트렁크 리드
  rearPanel:   { x: 96, y: 41 },  // 리어 패널
};

// 부위 인덱스 → 그림 슬롯(외판). 여기 없는 인덱스는 차체 골격이다.
const PART_SLOT: Record<number, string> = {
  0: 'frontFender', 1: 'frontDoor', 2: 'aPillar', 3: 'sideSill',
  4: 'bPillar', 5: 'rearDoor', 6: 'cPillar', 7: 'quarter',
  8: 'hood', 9: 'roof', 10: 'trunk',
  11: 'frontFender', 12: 'aPillar', 13: 'frontDoor', 14: 'sideSill',
  15: 'bPillar', 16: 'rearDoor', 17: 'cPillar', 18: 'quarter',
  20: 'frontPanel', 36: 'rearPanel',
};

// 골격 부위는 겉에서 안 보이지만 어느 쪽 문제인지는 알려줘야 한다 —
// 문이 열린 그림에서는 엔진룸·실내·트렁크 안쪽이 드러나므로 그 영역을 가리킨다.
// 정확한 부품 위치가 아니라 "이 구역" 표시라서, 클릭하면 부위명을 그대로 보여준다.
type Zone = 'front' | 'center' | 'rear';

const FRAME_ZONE: Record<number, Zone> = {
  19: 'front',  // 라디에이터 서포트
  21: 'front',  // 운전석 인사이드 패널
  22: 'front',  // 운전석 프런트 사이드멤버
  23: 'front',  // 조수석 프런트 사이드멤버
  24: 'front',  // 조수석 인사이드 패널
  25: 'front',  // 운전석 프런트 휠하우스
  26: 'front',  // 조수석 프런트 휠하우스
  27: 'front',  // 크로스 멤버
  28: 'center', // 대쉬 패널
  29: 'center', // 플로어 패널
  30: 'rear',   // 패키지 트레이
  31: 'rear',   // 운전석 리어 휠하우스
  32: 'rear',   // 운전석 리어 사이드멤버
  33: 'rear',   // 트렁크 플로어 패널
  34: 'rear',   // 조수석 리어 사이드멤버
  35: 'rear',   // 조수석 리어 휠하우스
};

// 열린 그림 기준 — 엔진룸 / 실내 바닥 / 트렁크 안쪽
const ZONE_POS: Record<Zone, { x: number; y: number }> = {
  front:  { x: 26, y: 46 },
  center: { x: 66, y: 70 },
  rear:   { x: 90, y: 26 },
};

const ZONE_LABEL: Record<Zone, string> = {
  front: '엔진룸 쪽 골격',
  center: '실내 바닥 쪽 골격',
  rear: '트렁크 쪽 골격',
};

type Side = 'driver' | 'passenger';

// 부위가 어느 면에 속하는지 — 이름으로 판별한다(후드·루프처럼 양쪽 공통인 것은 null).
function partSide(index: number): Side | null {
  const name = PART_NAMES[index] ?? '';
  if (name.startsWith('운전석')) return 'driver';
  if (name.startsWith('조수석')) return 'passenger';
  return null;
}

interface Props {
  damages?: string[][] | null;
  accident: boolean;
  reportHref?: string;
}

// 손상이 있으면 문·후드·트렁크가 열린 그림을 쓴다 — 골격 손상을 가리키려면 엔진룸과
// 트렁크 안쪽이 보여야 하고, 외판 손상도 문이 열려 있어야 면이 드러난다.
// 손상이 하나도 없으면 닫힌 그림.
//
// ⚠ "손상난 패널만 열고 나머지는 닫기"는 이 그림으로는 못 한다. 그러려면 닫힌 차를 배경으로
// 후드/앞문/뒷문/트렁크 각각의 "열린 상태" 투명 PNG 4장을 겹쳐야 한다(조합이 16가지라
// 통이미지로는 불가능). 레이어 4장이 준비되면 여기서 겹치도록 바꾸면 된다.
const IMAGES = {
  driver:    { open: '/open-left.png',  closed: '/close-left.png' },
  passenger: { open: '/open-right.png', closed: '/close-right.png' },
};

export default function VehicleDamageMap({ damages, accident, reportHref }: Props) {
  const [side, setSide] = useState<Side>('driver');
  const [selected, setSelected] = useState<number | null>(null);
  const [zoneOpen, setZoneOpen] = useState<Zone | null>(null);

  // 앱 입력은 B(판금)와 W(용접)를 나누지만 딜러가 구분하기 어려워해서 표시에서만 합친다
  // (리포트 페이지와 같은 처리).
  const damaged = (damages ?? [])
    .map((syms, i) => ({
      index: i,
      name: PART_NAMES[i] ?? `부위 ${i + 1}`,
      symbols: (syms ?? []).map(s => (s === 'B' ? 'W' : s)),
    }))
    .filter(p => p.symbols.length > 0);

  // 이번 면에 그릴 수 있는 핀
  const pins = damaged
    .map(p => {
      const slot = PART_SLOT[p.index];
      if (!slot) return null;
      const owner = partSide(p.index);
      if (owner && owner !== side) return null;
      const pos = SLOT_POS[slot];
      if (!pos) return null;
      return { ...p, x: side === 'passenger' ? 100 - pos.x : pos.x, y: pos.y };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // 골격 손상을 구역별로 묶는다 — 한 구역에 여러 부위가 몰리면 핀이 겹치므로 개수로 표시.
  const zoneGroups = (['front', 'center', 'rear'] as Zone[])
    .map(zone => {
      const parts = damaged.filter(p => {
        if (FRAME_ZONE[p.index] !== zone) return false;
        const owner = partSide(p.index);
        return !owner || owner === side;
      });
      return { zone, parts, pos: ZONE_POS[zone] };
    })
    .filter(g => g.parts.length > 0);

  // 그림에 표시할 수 없는 부위 = 외판 슬롯도 없고 골격 구역도 없는 것
  const unpinned = damaged.filter(p => !PART_SLOT[p.index] && FRAME_ZONE[p.index] === undefined);

  const selectedPart = selected != null ? damaged.find(p => p.index === selected) : null;
  const openedGroup = zoneOpen ? zoneGroups.find(g => g.zone === zoneOpen) : null;
  // 손상이 있으면 열린 그림(엔진룸·트렁크가 보여야 골격을 가리킬 수 있다), 없으면 닫힌 그림
  const imageSrc = IMAGES[side][damaged.length > 0 ? 'open' : 'closed'];

  return (
    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-black text-gray-900">차량 상태</p>
        {reportHref && (
          <a
            href={reportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-gray-600 border border-gray-300 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            진단 자세히 보기
          </a>
        )}
      </div>

      <div className="p-5 bg-white">
        {/* 요약 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">프레임 진단</span>
            <span className={`text-sm font-black ${accident ? 'text-amber-600' : 'text-green-600'}`}>
              {accident ? '수리 이력' : '정상'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">외부패널 진단</span>
            <span className={`text-sm font-black ${damaged.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {damaged.length > 0 ? `${damaged.length}곳 표기` : '이상 없음'}
            </span>
          </div>
        </div>

        {/* 운전석/조수석 전환 */}
        <div className="flex gap-1 mb-2">
          {([['driver', '운전석'], ['passenger', '조수석']] as const).map(([s, label]) => (
            <button
              key={s}
              onClick={() => { setSide(s); setSelected(null); setZoneOpen(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-colors ${
                side === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 차량 그림 + 핀 */}
        <div className="relative w-full aspect-[3/2] bg-white rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="차량 도면" className="w-full h-full object-contain" draggable={false} />

          {pins.map(p => {
            const sym = p.symbols[0];
            const style = SYMBOL_STYLE[sym] ?? SYMBOL_STYLE.X;
            const isSel = selected === p.index;
            return (
              <button
                key={p.index}
                type="button"
                onClick={() => { setSelected(prev => (prev === p.index ? null : p.index)); setZoneOpen(null); }}
                title={`${p.name}: ${p.symbols.map(s => SYMBOL_STYLE[s]?.label ?? s).join(', ')}`}
                className="absolute w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  backgroundColor: style.bg,
                  border: isSel ? '2.5px solid #111827' : '1.5px solid rgba(255,255,255,0.9)',
                  boxShadow: isSel ? '0 0 0 3px rgba(17,24,39,0.15)' : '0 1px 3px rgba(0,0,0,0.35)',
                  zIndex: isSel ? 2 : 1,
                }}
              >
                {sym}
              </button>
            );
          })}

          {/* 골격 구역 마커 — 외판 핀과 구분되게 점선 테두리 + 흰 배경 */}
          {zoneGroups.map(g => {
            const isSel = zoneOpen === g.zone;
            return (
              <button
                key={g.zone}
                type="button"
                onClick={() => { setZoneOpen(prev => (prev === g.zone ? null : g.zone)); setSelected(null); }}
                title={`${ZONE_LABEL[g.zone]} ${g.parts.length}곳`}
                className="absolute px-2 h-6 rounded-full flex items-center gap-1 text-[11px] font-black -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 bg-white"
                style={{
                  left: `${side === 'passenger' ? 100 - g.pos.x : g.pos.x}%`,
                  top: `${g.pos.y}%`,
                  color: '#b45309',
                  border: isSel ? '2.5px solid #111827' : '2px dashed #b45309',
                  boxShadow: isSel ? '0 0 0 3px rgba(17,24,39,0.15)' : '0 1px 3px rgba(0,0,0,0.25)',
                  zIndex: isSel ? 2 : 1,
                }}
              >
                골격 {g.parts.length}
              </button>
            );
          })}

          {pins.length === 0 && zoneGroups.length === 0 && damaged.length > 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
              이 면에 표기된 손상은 없습니다
            </div>
          )}
        </div>

        {/* 선택한 골격 구역 상세 — 구역 안에 있는 부위를 그대로 나열한다 */}
        {openedGroup && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-sm font-bold text-amber-900">{ZONE_LABEL[openedGroup.zone]}</p>
            <p className="text-[11px] text-amber-700/70 mb-2">
              겉에서 보이지 않는 부위라 정확한 위치가 아니라 해당 구역을 가리킵니다
            </p>
            <div className="space-y-1.5">
              {openedGroup.parts.map(p => (
                <div key={p.index} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-800">{p.name}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {p.symbols.map(sym => (
                      <span
                        key={sym}
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: SYMBOL_STYLE[sym]?.bg ?? '#6b7280' }}
                      >
                        {SYMBOL_STYLE[sym]?.label ?? sym}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 선택한 핀 상세 */}
        {selectedPart && (
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-sm font-bold text-gray-900">{selectedPart.name}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedPart.symbols.map(sym => (
                <span
                  key={sym}
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: SYMBOL_STYLE[sym]?.bg ?? '#6b7280' }}
                >
                  {SYMBOL_STYLE[sym]?.label ?? sym}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 그림에 못 찍는 부위 — 골격 손상이라 오히려 더 중요하다 */}
        {unpinned.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-black text-gray-400 mb-2">차체 내부·골격 (그림에 표시되지 않음)</p>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {unpinned.map(p => (
                <div key={p.index} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {p.symbols.map(sym => (
                      <span
                        key={sym}
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: SYMBOL_STYLE[sym]?.bg ?? '#6b7280' }}
                      >
                        {SYMBOL_STYLE[sym]?.label ?? sym}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {damaged.length === 0 && (
          <p className="mt-4 py-5 text-sm font-medium text-center text-green-600 border border-green-100 bg-green-50 rounded-xl">
            표기된 손상이 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
