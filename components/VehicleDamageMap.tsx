'use client';

// 매물 상세 "차량 상태" — 손상난 부위를 차 그림으로 보여준다.
//
// CARVIOR_vehicle_assets의 01~12 세트만 쓴다(차가 오른쪽을 보는 구도로 서로 정렬됨).
//  - 11_base-car-closed        : 아무 데도 손상 없을 때의 기본 그림
//  - 01/02                     : 그 패널을 떼어내 골격이 드러난 그림(교환급 손상 표현)
//  - 03/04/10                  : 그 문/후드를 떼거나 연 그림
//  - 05~09                     : 부위별 부품 그림(목록 썸네일용 — 차 위에 얹는 용도가 아님)
//
// ⚠ 01~04, 10은 "차 전체" 그림이라 겹칠 수 없다(겹치면 서로 덮음).
//   그래서 한 번에 한 부위만 보여주고, 목록에서 눌러 부위를 바꾸는 방식으로 만든다.

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

const SYMBOL_LABEL: Record<string, string> = {
  X: '교환', W: '판금/용접', B: '판금/용접', M: '탈부착',
  A: '흠집', U: '요철', T: '깨짐', C: '부식', P: '도장필요',
};

const A = '/CARVIOR_vehicle_assets';
const BASE_CAR = `${A}/11_base-car-closed.png`;

// 부위별로 보여줄 차 그림 + 부품 썸네일
const PART_VIEW: { parts: number[]; label: string; car: string; thumb: string }[] = [
  { parts: [8],     label: '후드',      car: `${A}/10_hood-open.png`,                      thumb: `${A}/08_hood-replace-overlay.png` },
  { parts: [0, 11], label: '앞휀더',    car: `${A}/01_front-fender-structure-exposed.png`, thumb: `${A}/09_front-fender-replace-overlay.png` },
  { parts: [1, 13], label: '앞도어',    car: `${A}/04_front-door-removed.png`,             thumb: `${A}/07_front-door-replace-overlay.png` },
  { parts: [5, 16], label: '뒷도어',    car: `${A}/03_rear-door-removed.png`,              thumb: `${A}/06_rear-door-replace-overlay.png` },
  { parts: [7, 18], label: '쿼터패널',  car: `${A}/02_quarter-panel-structure-exposed.png`, thumb: `${A}/05_quarter-panel-replace-overlay.png` },
];

type Side = 'driver' | 'passenger';

// 부위가 어느 면에 속하는지 — 후드처럼 양쪽 공통인 것은 null.
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

export default function VehicleDamageMap({ damages, accident, reportHref }: Props) {
  const [side, setSide] = useState<Side>('driver');
  const [picked, setPicked] = useState<string | null>(null);

  // 앱 입력은 B(판금)와 W(용접)를 나누지만 딜러가 구분하기 어려워해서 표시에서만 합친다.
  const damaged = (damages ?? [])
    .map((syms, i) => ({
      index: i,
      name: PART_NAMES[i] ?? `부위 ${i + 1}`,
      symbols: (syms ?? []).map(s => (s === 'B' ? 'W' : s)),
    }))
    .filter(p => p.symbols.length > 0);

  const onThisSide = damaged.filter(p => {
    const owner = partSide(p.index);
    return !owner || owner === side;
  });

  // 그림으로 보여줄 수 있는 손상 부위
  const views = PART_VIEW
    .map(v => {
      const hit = onThisSide.find(p => v.parts.includes(p.index));
      return hit ? { ...v, part: hit } : null;
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  // 고른 게 이번 면에 없으면 첫 번째로 되돌린다(면 전환 시 빈 화면 방지).
  const active = views.find(v => v.label === picked) ?? views[0] ?? null;

  // 그림으로 못 보여주는 나머지 부위
  const viewParts = new Set(PART_VIEW.flatMap(v => v.parts));
  const listed = damaged.filter(p => !viewParts.has(p.index));

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
              onClick={() => { setSide(s); setPicked(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-colors ${
                side === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 차 그림 — 고른 부위를 떼어낸 상태로 보여준다 */}
        <div className="relative w-full aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active?.car ?? BASE_CAR}
            alt={active ? `${active.part.name} 손상 표시` : '차량 도면'}
            className="w-full h-full object-contain"
            style={{ transform: side === 'passenger' ? 'scaleX(-1)' : undefined }}
            draggable={false}
          />
          {active && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {active.part.name} · {active.part.symbols.map(s => SYMBOL_LABEL[s] ?? s).join(', ')}
            </div>
          )}
        </div>

        {/* 부위 선택 — 그림이 한 번에 한 부위만 보여줘서, 눌러서 바꾼다 */}
        {views.length > 0 && (
          <div className="mt-2">
            {views.length > 1 && (
              <p className="text-xs text-gray-400 mb-2">부위를 누르면 그 부위를 떼어낸 그림으로 바뀝니다</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {views.map(v => (
                <button
                  key={v.label}
                  onClick={() => setPicked(v.label)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    active?.label === v.label
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumb} alt="" className="w-12 h-12 object-contain shrink-0" draggable={false} />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-gray-900 truncate">{v.part.name}</span>
                    <span className={`block text-xs font-bold ${v.part.symbols.includes('X') ? 'text-red-600' : 'text-amber-600'}`}>
                      {v.part.symbols.map(s => SYMBOL_LABEL[s] ?? s).join(', ')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 그림에 없는 나머지 부위 — 필러·사이드실·루프·트렁크와 차체 골격 */}
        {listed.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-black text-gray-400 mb-2">그림에 표시되지 않는 부위</p>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {listed.map(p => (
                <div key={p.index} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <span className={`text-sm font-bold ${p.symbols.includes('X') ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.symbols.map(s => SYMBOL_LABEL[s] ?? s).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {damaged.length === 0 && (
          <p className="mt-2 py-5 text-sm font-medium text-center text-green-600 border border-green-100 bg-green-50 rounded-xl">
            표기된 손상이 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
