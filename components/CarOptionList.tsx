// 매물 상세의 "옵션정보" — 선택된 옵션을 분류별로 묶어서 보여준다.
//
// 평면으로 쭉 나열하면 20개만 넘어가도 눈으로 못 훑는다. 사는 쪽은 보통
// "선루프 있나", "통풍시트 있나"처럼 특정 항목을 찾으러 오기 때문에,
// 자주 찾는 것(주요 옵션)을 위에 한 번 더 보여주고 그 아래에 분류별 전체를 둔다.

import { KEY_CAR_OPTIONS, groupSelectedOptions } from '@/lib/carOptions';

function Check() {
  return (
    <svg width="11" height="11" fill="none" stroke="#16a34a" strokeWidth={2.5} viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
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

  const groups = groupSelectedOptions(list);
  const key = KEY_CAR_OPTIONS.filter(o => list.includes(o));

  return (
    <div className="space-y-7">
      {key.length > 0 && (
        <div>
          <p className="text-xs font-black text-gray-400 mb-2.5">주요 옵션</p>
          <div className="flex flex-wrap gap-2">
            {key.map(opt => (
              <span
                key={opt}
                className="flex items-center gap-1.5 text-sm font-bold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-2 rounded-xl"
              >
                <Check />
                {opt}
              </span>
            ))}
          </div>
        </div>
      )}

      {groups.map(g => (
        <div key={g.key}>
          <p className="text-xs font-black text-gray-400 mb-2.5">
            {g.label} <span className="text-gray-300">{g.options.length}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {g.options.map(opt => (
              <span
                key={opt}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl"
              >
                <Check />
                {opt}
              </span>
            ))}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-gray-400">
        판매자가 직접 선택한 옵션입니다. 계약 전에 실제 작동 여부를 확인해주세요.
      </p>
    </div>
  );
}
