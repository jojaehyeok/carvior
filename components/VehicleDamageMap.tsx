'use client';

// 매물 상세 "차량 상태" — 손상난 부위를 차 그림 위에 색으로 칠해서 보여준다.
//
// 외판(겉면)과 골격(내판)을 탭으로 나눈다. 딜러가 보는 관점이 다르기 때문 —
// 외판은 도색·판금으로 해결되지만 골격은 사고 이력 판단이 달라진다.
//
// 에셋은 전부 1448×1086, 각 부위가 차에서 실제로 있는 자리에만 그려진 투명 PNG라
// 여러 장을 동시에 겹쳐도 서로 안 덮는다(= 손상난 부위를 한꺼번에 표시할 수 있다).
//   skin-*  : 외판 오버레이(주황)
//   frame-* : 골격 오버레이(파랑)

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

type Layer = { parts: number[]; src: string; label: string };

// 외판 — 겉에서 보이는 패널
const SKIN_LAYERS: Layer[] = [
  { parts: [8],     src: `${A}/skin-hood.png`,         label: '후드' },
  { parts: [0, 11], src: `${A}/skin-front-fender.png`, label: '앞휀더' },
  { parts: [1, 13], src: `${A}/skin-front-door.png`,   label: '앞도어' },
  { parts: [5, 16], src: `${A}/skin-rear-door.png`,    label: '뒷도어' },
];

// 골격(내판) — 겉에서 안 보이는 차체 구조.
// 한 그림이 여러 진단 부위를 아우르는 경우가 있어서(예: 프런트 엔드 구조 = 라디에이터
// 서포트 + 사이드멤버 + 크로스멤버) parts에 묶어서 넣는다.
const FRAME_LAYERS: Layer[] = [
  { parts: [19, 22, 23, 27], src: `${A}/frame-front-member.png`,     label: '프런트 사이드멤버·라디에이터 서포트' },
  { parts: [21, 24, 25, 26], src: `${A}/frame-front-wheelhouse.png`, label: '프런트 휠하우스·인사이드 패널' },
  { parts: [28],             src: `${A}/frame-dash.png`,             label: '대쉬 패널' },
  { parts: [2, 12],          src: `${A}/frame-a-pillar.png`,         label: 'A필러' },
  { parts: [4, 15],          src: `${A}/frame-b-pillar.png`,         label: 'B필러' },
  { parts: [6, 17],          src: `${A}/frame-c-pillar.png`,         label: 'C필러' },
  { parts: [9],              src: `${A}/frame-roof-rail.png`,        label: '루프' },
  { parts: [31, 32, 34, 35], src: `${A}/frame-rear-wheelhouse.png`,  label: '리어 휠하우스·리어 사이드멤버' },
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

  // 이번 탭·면에서 칠할 오버레이. 한 그림이 여러 부위를 덮으므로 해당 부위를 모아둔다.
  const layerDefs = tab === 'skin' ? SKIN_LAYERS : FRAME_LAYERS;
  const active = layerDefs
    .map(l => {
      const hits = onThisSide.filter(p => l.parts.includes(p.index));
      if (hits.length === 0) return null;
      // 하나라도 교환이면 빨강으로 강조한다.
      return { ...l, hits, replace: hits.some(p => p.symbols.includes('X')) };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  // 그림이 없는 부위는 목록으로만 — 빠뜨리면 정보가 사라지므로 반드시 보여준다.
  const drawable = new Set([...SKIN_LAYERS, ...FRAME_LAYERS].flatMap(l => l.parts));
  const listed = damaged.filter(p => !drawable.has(p.index));

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

        {/* 차 그림 + 손상 부위 색칠 */}
        <div
          className="relative w-full aspect-[4/3]"
          style={{ transform: side === 'passenger' ? 'scaleX(-1)' : undefined }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BASE_CAR} alt="차량 도면" className="w-full h-full object-contain" draggable={false} />
          {active.map(l => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={l.src}
              src={l.src}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              // 교환은 빨강 쪽으로 색을 돌려 강조한다(외판은 주황, 골격은 파랑이 원본색).
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
        {active.length > 0 && (
          <div className="mt-2 border border-gray-100 rounded-xl divide-y divide-gray-100">
            {active.flatMap(l => l.hits).map(p => (
              <div key={p.index} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-sm font-bold text-gray-800">{p.name}</span>
                <span className={`text-sm font-black ${p.symbols.includes('X') ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.symbols.map(s => SYMBOL_LABEL[s] ?? s).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 그림에 없는 부위 — 사이드실·쿼터패널·플로어·트렁크 등 */}
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
