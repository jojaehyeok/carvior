import Link from 'next/link';

// 평가사 부르기 — 개인 거래에서 "이 차 상태 좀 봐달라"는 요청을 받는 입구.
//
// 홈에 있던 검차 안내 띠를 걷어내고 이 페이지로 모았다. 파는 쪽도 사는 쪽도 쓸 수 있다.
// 실제 접수·결제는 기존 /inspection 흐름을 그대로 쓴다(여기는 설명과 진입만 담당).
export const metadata = {
  title: '평가사 부르기 | 카비어',
  description: '개인 간 중고차 거래, 계약 전에 진단평가사를 불러 차량 상태를 확인하세요.',
};

const WHO = [
  {
    icon: '🛒',
    title: '사는 분이 부를 때',
    desc: '마음에 드는 매물을 찾았는데 상태가 걱정될 때. 계약 전에 확인하면 나중에 다툴 일이 줄어듭니다.',
  },
  {
    icon: '🔑',
    title: '파는 분이 부를 때',
    desc: '내 차가 괜찮다는 걸 보여주고 싶을 때. 리포트가 붙은 매물은 사는 쪽이 믿고 연락합니다.',
  },
];

const STEPS = [
  { no: '01', title: '신청', desc: '차량번호와 차가 있는 위치, 원하는 시간을 남겨주세요.' },
  { no: '02', title: '배정', desc: '가까운 진단평가사가 배정되고 방문 시간을 확정합니다.' },
  { no: '03', title: '현장 진단', desc: '외관·엔진룸·하부·도막·옵션 작동까지 항목별로 확인합니다.' },
  { no: '04', title: '리포트', desc: '사진 30장 이상과 항목별 기록이 담긴 리포트를 링크로 받습니다.' },
];

const FAQ = [
  { q: '내 차가 아니어도 부를 수 있나요?', a: '네. 사려는 차에 대해서도 신청할 수 있습니다. 다만 차를 볼 수 있도록 판매자와 시간·장소를 먼저 맞춰주세요.' },
  { q: '얼마인가요?', a: '국산 99,000원, 수입 132,000원입니다. 출장비가 따로 붙지 않습니다.' },
  { q: '얼마나 걸리나요?', a: '현장 진단은 보통 40분~1시간이고, 리포트는 진단이 끝나면 바로 받아보실 수 있습니다.' },
  { q: '평가사는 어떤 분들인가요?', a: '카비어와 계약된 진단평가사가 방문합니다. 차량을 판매하지 않기 때문에 판매를 위해 결과를 바꿀 이유가 없습니다.' },
];

export default function CallEvaluatorPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 머리말 */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-slate-50 border-b border-violet-100">
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-20">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">CALL AN EVALUATOR</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-[1.25] mb-4">
            이 차, 괜찮은 걸까요?<br />
            평가사가 대신 봐드립니다.
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">
            개인끼리 거래할 때 가장 불안한 건 차량 상태입니다.<br className="hidden sm:block" />
            진단평가사가 차가 있는 곳으로 직접 가서 확인하고, 기록으로 남겨드립니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/inspection"
              className="bg-violet-600 hover:bg-violet-700 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              평가사 부르기 →
            </Link>
            <Link
              href="/market"
              className="bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              매물 둘러보기
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-5">국산 99,000원 · 수입 132,000원 · 출장비 없음</p>
        </div>
      </section>

      {/* 누가 부르나 */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-xl font-black text-slate-900 mb-6">이럴 때 부르세요</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WHO.map((w) => (
            <div key={w.title} className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <span className="text-3xl">{w.icon}</span>
              <h3 className="font-black text-slate-900 mt-3 mb-1.5">{w.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 절차 */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-xl font-black text-slate-900 mb-6">진행 순서</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.no} className="bg-white border border-violet-100 rounded-2xl p-5">
                <p className="text-[11px] font-black text-violet-400 mb-2">{s.no}</p>
                <h3 className="font-black text-slate-900 text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-xl font-black text-slate-900 mb-6">자주 묻는 질문</h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {FAQ.map((f) => (
            <div key={f.q} className="px-6 py-5">
              <p className="text-sm font-black text-slate-900 mb-1.5">{f.q}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 마무리 */}
      <section className="bg-gradient-to-br from-violet-50 to-slate-50 border-t border-violet-100">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-3">계약 전에 한 번만 확인하세요</h2>
          <p className="text-sm text-slate-500 mb-7">잘못 산 차는 되돌리기 어렵습니다.</p>
          <Link
            href="/inspection"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-black px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            평가사 부르기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
