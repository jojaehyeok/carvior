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

// 그림 위 핀 위치(운전석 이미지 기준 %). 조수석은 x를 100에서 뺀다.
// ⚠ 실제 이미지에 맞춰 눈으로 보고 조정해야 하는 값이다.
const SLOT_POS: Record<string, { x: number; y: number }> = {
  frontPanel:  { x: 12, y: 62 },
  hood:        { x: 27, y: 46 },
  frontFender: { x: 40, y: 62 },
  aPillar:     { x: 44, y: 30 },
  frontDoor:   { x: 55, y: 55 },
  sideSill:    { x: 58, y: 75 },
  bPillar:     { x: 62, y: 33 },
  rearDoor:    { x: 70, y: 55 },
  cPillar:     { x: 79, y: 32 },
  quarter:     { x: 84, y: 56 },
  roof:        { x: 57, y: 22 },
  trunk:       { x: 88, y: 24 },
  rearPanel:   { x: 94, y: 45 },
};

// 부위 인덱스 → 그림 슬롯. 여기 없는 인덱스는 차체 골격이라 그림에 안 찍는다.
const PART_SLOT: Record<number, string> = {
  0: 'frontFender', 1: 'frontDoor', 2: 'aPillar', 3: 'sideSill',
  4: 'bPillar', 5: 'rearDoor', 6: 'cPillar', 7: 'quarter',
  8: 'hood', 9: 'roof', 10: 'trunk',
  11: 'frontFender', 12: 'aPillar', 13: 'frontDoor', 14: 'sideSill',
  15: 'bPillar', 16: 'rearDoor', 17: 'cPillar', 18: 'quarter',
  20: 'frontPanel', 36: 'rearPanel',
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
  imageDriver?: string;
  imagePassenger?: string;
  reportHref?: string;
}

export default function VehicleDamageMap({
  damages,
  accident,
  imageDriver = '/vehicle-sedan-driver.png',
  imagePassenger = '/vehicle-sedan-passenger.png',
  reportHref,
}: Props) {
  const [side, setSide] = useState<Side>('driver');
  const [selected, setSelected] = useState<number | null>(null);

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

  // 그림에 표시할 수 없는 부위(차체 내부·골격)
  const unpinned = damaged.filter(p => !PART_SLOT[p.index]);

  const selectedPart = selected != null ? damaged.find(p => p.index === selected) : null;
  const imageSrc = side === 'driver' ? imageDriver : imagePassenger;

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
              onClick={() => { setSide(s); setSelected(null); }}
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
                onClick={() => setSelected(prev => (prev === p.index ? null : p.index))}
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

          {pins.length === 0 && damaged.length > 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
              이 면에 표기된 손상은 없습니다
            </div>
          )}
        </div>

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
