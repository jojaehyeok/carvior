// 매물 상세의 "옵션정보" — 경매 시트처럼 전체 목록을 깔고 있는 것/없는 것을 구분한다.
//
// 있는 것만 칩으로 보여주면 "없는 건지, 판매자가 안 고른 건지"를 사는 쪽이 구분 못 한다.
// 경매장 출품표가 전 항목을 깔아두고 해당 칸에만 표시하는 것도 같은 이유다.
// 목록 전체를 보여주면 "통풍시트 없음"이 눈으로 확인된다.
//
// ⚠ 목록에 없는 이름(예전 데이터·대시보드에서 직접 넣은 값)은 버리지 않고 "기타"로 따로 묶는다.

import { CAR_OPTION_GROUPS, ALL_CAR_OPTIONS, KEY_CAR_OPTIONS } from '@/lib/carOptions';

function Check() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
         strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Dash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
         strokeLinecap="round" className="shrink-0">
      <path d="M6 12h12" />
    </svg>
  );
}

export default function CarOptionList({ options }: { options?: string[] | null }) {
  const list = options ?? [];

  if (list.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-sm">등록된 옵션 정보가 없습니다.</p>
      </div>
    );
  }

  const has = new Set(list);
  const known = new Set(ALL_CAR_OPTIONS);
  const etc = list.filter(o => !known.has(o));
  const keyOptions = KEY_CAR_OPTIONS.filter(o => has.has(o));
  const total = ALL_CAR_OPTIONS.length;
  const count = ALL_CAR_OPTIONS.filter(o => has.has(o)).length;

  return (
    <div>
      {/* 머리 — 몇 개짜리 차인지 한눈에 */}
      <div className="flex items-end justify-between pb-3 mb-4 border-b-2 border-gray-900">
        <p className="text-sm font-black text-gray-900">옵션</p>
        <p className="text-xs font-bold text-gray-400">
          <span className="text-base font-black text-violet-600">{count}</span>
          <span className="mx-0.5">/</span>
          {total}
        </p>
      </div>

      {/* 주요 옵션 — 사는 쪽이 제일 먼저 찾는 것들만 위로 한 번 더 */}
      {keyOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {keyOptions.map(opt => (
            <span key={opt}
              className="flex items-center gap-1 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1.5 rounded-lg">
              <Check />
              {opt}
            </span>
          ))}
        </div>
      )}

      {/* 분류별 전 항목 */}
      <div className="divide-y divide-gray-100">
        {CAR_OPTION_GROUPS.map(g => {
          const on = g.options.filter(o => has.has(o)).length;
          return (
            <div key={g.key} className="py-4 first:pt-0">
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-xs font-black text-gray-900">{g.label}</p>
                <span className="text-[11px] font-bold text-gray-300">{on}/{g.options.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
                {g.options.map(opt => {
                  const yes = has.has(opt);
                  return (
                    <div key={opt}
                      className={`flex items-center gap-1.5 text-[13px] leading-tight py-0.5 ${
                        yes ? 'font-bold text-gray-800' : 'text-gray-300'
                      }`}>
                      <span className={yes ? 'text-green-600' : 'text-gray-200'}>
                        {yes ? <Check /> : <Dash />}
                      </span>
                      <span className="truncate" title={opt}>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 목록에 없는 이름 — 버리지 않고 그대로 보여준다 */}
        {etc.length > 0 && (
          <div className="py-4">
            <p className="text-xs font-black text-gray-900 mb-2.5">기타</p>
            <div className="flex flex-wrap gap-1.5">
              {etc.map(opt => (
                <span key={opt}
                  className="flex items-center gap-1 text-[13px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                  <span className="text-green-600"><Check /></span>
                  {opt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
        판매자가 직접 선택한 옵션입니다. 계약 전에 실제 작동 여부를 확인해주세요.
      </p>
    </div>
  );
}
