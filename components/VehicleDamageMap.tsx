'use client';

// 매물 상세 "차량 상태" — 차량 일러스트 위에 손상난 외판을 색으로 칠해서 보여준다.
//
// CARVIOR_vehicle_assets 팩의 base-car.png 위에 패널별 오버레이(*-replace.png)를 겹친다.
// 오버레이는 해당 패널 모양만 들어있는 투명 PNG라 여러 장을 동시에 올려도 서로 안 덮는다.
// 원본 오버레이가 주황색이라, 교환(X)은 CSS 필터로 빨강으로 돌려서 구분한다.
//
// 그림은 한쪽 면만 보이므로 조수석은 전체를 좌우 반전해서 쓴다.

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

const ASSETS = '/CARVIOR_vehicle_assets';
const BASE_CAR = `${ASSETS}/base-car.png`;

// 그림에 칠할 수 있는 외판 — 부위 인덱스 → 오버레이 파일.
// 운전석/조수석 같은 부위는 같은 파일을 쓰고, 조수석일 때 전체를 좌우 반전한다.
//
// ⚠ 오버레이 파일 조건: base-car.png와 같은 1448×1086이고, 그 패널이 차에서 실제로
//   있는 자리에 그려져 있고 나머지는 전부 투명이어야 한다(그래서 파일 하나가 캔버스의
//   4~8%만 차지한다). 부위를 캔버스 가운데 크게 그린 "부품 그림"은 여기 쓸 수 없다.
//
// 쿼터패널은 받은 파일이 조각만 들어있어서(캔버스의 0.2%) 제외했다.
// 조건에 맞는 파일이 오면 아래에 한 줄만 추가하면 된다.
const PANEL_OVERLAY: { parts: number[]; src: string; label: string }[] = [
  { parts: [8],      src: `${ASSETS}/hood-replace.png`,          label: '후드' },
  { parts: [0, 11],  src: `${ASSETS}/front-fender-replace.png`,  label: '앞휀더' },
  { parts: [1, 13],  src: `${ASSETS}/front-door-replace.png`,    label: '앞도어' },
  { parts: [5, 16],  src: `${ASSETS}/rear-door-replace.png`,     label: '뒷도어' },
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

  // 앱 입력은 B(판금)와 W(용접)를 나누지만 딜러가 구분하기 어려워해서 표시에서만 합친다
  // (리포트 페이지와 같은 처리).
  const damaged = (damages ?? [])
    .map((syms, i) => ({
      index: i,
      name: PART_NAMES[i] ?? `부위 ${i + 1}`,
      symbols: (syms ?? []).map(s => (s === 'B' ? 'W' : s)),
    }))
    .filter(p => p.symbols.length > 0);

  // 이번 면에 해당하는 손상만
  const onThisSide = damaged.filter(p => {
    const owner = partSide(p.index);
    return !owner || owner === side;
  });

  // 칠할 오버레이 — 교환(X)이 섞여 있으면 빨강, 아니면 원본 주황 그대로.
  const overlays = PANEL_OVERLAY
    .map(o => {
      const hit = onThisSide.find(p => o.parts.includes(p.index));
      if (!hit) return null;
      return { ...o, replace: hit.symbols.includes('X'), part: hit };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);

  // 오버레이가 없는 외판·골격은 목록으로만 보여준다.
  const overlayParts = new Set(PANEL_OVERLAY.flatMap(o => o.parts));
  const listed = damaged.filter(p => !overlayParts.has(p.index));

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
              onClick={() => setSide(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-colors ${
                side === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 차량 그림 + 패널 색칠 */}
        <div
          className="relative w-full aspect-[4/3]"
          style={{ transform: side === 'passenger' ? 'scaleX(-1)' : undefined }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BASE_CAR} alt="차량 도면" className="w-full h-full object-contain" draggable={false} />
          {overlays.map(o => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={o.src}
              src={o.src}
              alt=""
              title={`${o.part.name}: ${o.part.symbols.map(s => SYMBOL_LABEL[s] ?? s).join(', ')}`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              // 원본 오버레이가 주황색이라, 교환은 색상을 빨강 쪽으로 돌려서 구분한다.
              style={o.replace ? { filter: 'hue-rotate(-22deg) saturate(1.45)' } : undefined}
              draggable={false}
            />
          ))}
        </div>

        {/* 범례 */}
        {overlays.length > 0 && (
          <div className="flex items-center gap-4 justify-center -mt-1 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#e8502f' }} /> 교환
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#f59b4b' }} /> 판금·도장 등
            </span>
          </div>
        )}

        {/* 색칠된 패널 요약 */}
        {overlays.length > 0 && (
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 mb-3">
            {overlays.map(o => (
              <div key={o.src} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-sm font-bold text-gray-800">{o.part.name}</span>
                <span className={`text-sm font-black ${o.replace ? 'text-red-600' : 'text-amber-600'}`}>
                  {o.part.symbols.map(s => SYMBOL_LABEL[s] ?? s).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 그림에 없는 나머지 부위 — 필러·사이드실·루프·트렁크와 차체 골격 */}
        {listed.length > 0 && (
          <div>
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
