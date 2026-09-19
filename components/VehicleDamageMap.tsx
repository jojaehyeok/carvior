'use client';

// 매물 상세 "차량 상태" — 손상난 부위를 차 그림 위에 칠해서 보여준다.
//
// 외판(겉면)과 골격(내판)을 탭으로 나눈다. 외판은 도색·판금으로 해결되지만 골격은
// 사고 이력 판단이 달라지기 때문에 딜러가 보는 관점이 다르다.
//
// 에셋(CARVIOR_vehicle_assets, 부위명은 README.txt 기준):
//   skin-base.png  : 바탕 차 그림(1448×1086). 모든 오버레이가 이 그림 기준으로 위치가 잡혀 있다.
//   skin-*.png     : 외판 오버레이(주황)
//   나머지 부위명.png : 골격 오버레이 — L=운전석, R=조수석 (한국은 좌핸들이라 좌측이 운전석)
//
// 오버레이는 각 부위가 차에서 실제로 있는 자리에만 그려진 투명 PNG라, 손상난 부위를
// 동시에 여러 장 겹쳐서 표시할 수 있다.
//
// ⚠ 좌우가 파일로 나뉘어 있으므로 조수석이라고 그림을 반전하지 않는다. 반전하면 R 그림이
//   엉뚱한 자리로 간다.

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
const BASE_CAR = `${A}/skin-base.png`;
// 부위명이 적힌 골격 안내도 — 그림에 못 칠하는 부위를 이름으로 찾을 수 있게 같이 보여준다.
const FRAME_GUIDE: Record<'driver' | 'passenger', string> = {
  driver: `${A}/base-frame-left.png`,
  passenger: `${A}/base-frame-right.png`,
};

type Layer = { parts: number[]; src: string };

// 외판 — 좌우 구분 없이 한 장씩이라 운전석/조수석 부위를 같이 묶는다.
const SKIN_LAYERS: Layer[] = [
  { parts: [8],     src: `${A}/skin-hood.png` },
  { parts: [0, 11], src: `${A}/skin-front-fender.png` },
  { parts: [1, 13], src: `${A}/skin-front-door.png` },
  { parts: [5, 16], src: `${A}/skin-rear-door.png` },
];

// 골격 — README.txt의 부위명 그대로. L=운전석, R=조수석.
const FRAME_LAYERS: Layer[] = [
  { parts: [19], src: `${A}/radiator-support.png` },      // 라디에이터 서포트
  { parts: [22], src: `${A}/front-side-member-L.png` },   // 운전석 프런트 사이드멤버
  { parts: [23], src: `${A}/front-side-member-R.png` },   // 조수석 프런트 사이드멤버
  { parts: [25], src: `${A}/front-wheelhouse-L.png` },    // 운전석 프런트 휠하우스
  { parts: [26], src: `${A}/front-wheelhouse-R.png` },    // 조수석 프런트 휠하우스
  { parts: [21], src: `${A}/apron-panel-L.png` },         // 운전석 인사이드(에이프런) 패널
  { parts: [24], src: `${A}/apron-panel-R.png` },         // 조수석 인사이드(에이프런) 패널
  { parts: [28], src: `${A}/dash-panel.png` },            // 대쉬 패널
  { parts: [3],  src: `${A}/rocker-panel-L.png` },        // 운전석 사이드실
  { parts: [14], src: `${A}/rocker-panel-R.png` },        // 조수석 사이드실
];

// 그림은 있지만 캔버스 규격(1254×1254)이 달라 차 위에 못 얹는 부위 —
// 목록에서 부품 그림으로만 보여준다. 같은 규격으로 다시 뽑으면 위 FRAME_LAYERS로 옮기면 된다.
const PART_THUMB: { parts: number[]; src: string }[] = [
  { parts: [31], src: `${A}/rear-wheelhouse-L.png` },
  { parts: [35], src: `${A}/rear-wheelhouse-R.png` },
  { parts: [32], src: `${A}/rear-side-member-L.png` },
  { parts: [34], src: `${A}/rear-side-member-R.png` },
  { parts: [33], src: `${A}/trunk-floor.png` },
  { parts: [36], src: `${A}/rear-panel.png` },
  { parts: [29], src: `${A}/center-floor.png` },
  { parts: [9],  src: `${A}/roof-rail.png` },
];

type Side = 'driver' | 'passenger';
type Tab = 'skin' | 'frame';

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
  const [tab, setTab] = useState<Tab>('skin');
  const [guideOpen, setGuideOpen] = useState(false);

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

  const layerDefs = tab === 'skin' ? SKIN_LAYERS : FRAME_LAYERS;
  const active = layerDefs
    .map(l => {
      const hits = onThisSide.filter(p => l.parts.includes(p.index));
      if (hits.length === 0) return null;
      return { ...l, hits, replace: hits.some(p => p.symbols.includes('X')) };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  // 이번 탭·면에서 그림 위에 칠해진 부위(설명용, 중복 제거)
  const shown = active
    .flatMap(l => l.hits)
    .filter((p, i, arr) => arr.findIndex(q => q.index === p.index) === i);

  // 그림에 못 칠한 부위 — 부품 그림이 있으면 썸네일을 같이 보여준다.
  const drawable = new Set([...SKIN_LAYERS, ...FRAME_LAYERS].flatMap(l => l.parts));
  const listed = damaged
    .filter(p => !drawable.has(p.index))
    .map(p => ({ ...p, thumb: PART_THUMB.find(t => t.parts.includes(p.index))?.src }));

  const skinCount = damaged.filter(p => SKIN_LAYERS.some(l => l.parts.includes(p.index))).length;
  const frameCount = damaged.filter(p => FRAME_LAYERS.some(l => l.parts.includes(p.index))).length;

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

        {/* 외판 / 골격 */}
        <div className="flex border-b border-gray-200 mb-3">
          {([['skin', '외판', skinCount], ['frame', '골격(내판)', frameCount]] as const).map(([t, label, cnt]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-black border-b-2 -mb-px transition-colors ${
                tab === t ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {label}
              {cnt > 0 && <span className="ml-1 text-xs text-amber-600">{cnt}</span>}
            </button>
          ))}
        </div>

        {/* 운전석/조수석 — 한국은 좌핸들이라 좌측이 운전석 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex gap-1">
            {([['driver', '운전석(좌)'], ['passenger', '조수석(우)']] as const).map(([s, label]) => (
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
          {tab === 'frame' && (
            <button
              onClick={() => setGuideOpen(v => !v)}
              className="text-xs font-bold text-gray-500 underline underline-offset-2 hover:text-gray-800"
            >
              {guideOpen ? '안내도 닫기' : '골격 부위 안내도'}
            </button>
          )}
        </div>

        {/* 부위명이 적힌 골격 안내도 — 그림에 못 칠하는 부위를 이름으로 찾을 때 */}
        {tab === 'frame' && guideOpen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={FRAME_GUIDE[side]}
            alt="골격 부위 안내도"
            className="w-full rounded-xl border border-gray-100 mb-2"
            draggable={false}
          />
        )}

        {/* 차 그림 + 손상 부위 색칠 */}
        <div className="relative w-full aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BASE_CAR} alt="차량 도면" className="w-full h-full object-contain" draggable={false} />
          {active.map(l => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={l.src}
              src={l.src}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              // 교환은 빨강 쪽으로 색을 돌려 강조한다.
              style={l.replace ? { filter: 'hue-rotate(-25deg) saturate(1.5)' } : undefined}
              draggable={false}
            />
          ))}
          {active.length === 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
              이 면에 표기된 {tab === 'skin' ? '외판' : '골격'} 손상 없음
            </div>
          )}
        </div>

        {/* 칠해진 부위 설명 */}
        {shown.length > 0 && (
          <div className="mt-2 border border-gray-100 rounded-xl divide-y divide-gray-100">
            {shown.map(p => (
              <div key={p.index} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-sm font-bold text-gray-800">{p.name}</span>
                <span className={`text-sm font-black ${p.symbols.includes('X') ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.symbols.map(s => SYMBOL_LABEL[s] ?? s).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 그림에 못 칠하는 부위 — 부품 그림이 있으면 같이 보여준다 */}
        {listed.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-black text-gray-400 mb-2">그림에 표시되지 않는 부위</p>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {listed.map(p => (
                <div key={p.index} className="flex items-center gap-3 px-3 py-2">
                  {p.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumb} alt="" className="w-10 h-10 object-contain shrink-0" draggable={false} />
                  ) : (
                    <span className="w-10 shrink-0" />
                  )}
                  <span className="flex-1 text-sm text-gray-700">{p.name}</span>
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
