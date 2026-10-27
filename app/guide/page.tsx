import Link from 'next/link';

// 이용가이드 — "카비어는 뭘 해주는 곳인가"를 한 장으로 설명한다.
// 개인 직거래(무료)와 딜러 경매(스마트옥션)가 뭐가 다른지, 검차는 어디에 끼는지를
// 나눠서 보여주는 게 핵심이다. 처음 온 사람이 제일 많이 헷갈리는 지점이다.
export const metadata = {
  title: '이용가이드 | 카비어',
  description: '카비어 서비스를 시작하기 전 한눈에 쉽게 알아보기 — 개인 직거래, 딜러 경매, 검차의 차이.',
};

const TRADE_TYPES = [
  {
    tag: '개인 직거래',
    icon: '🤝',
    headline: '내가 정한 가격으로, 개인에게 직접',
    desc: '판매자가 가격을 정해 올리고, 사려는 사람이 직접 문의합니다. 카비어는 연결만 하고 수수료를 받지 않습니다.',
    points: ['등록비·중개 수수료 없음', '가격은 판매자가 정한 정찰가', '문의·가격 조정은 채팅으로'],
    cta: { label: '매물 둘러보기', href: '/market' },
    accent: 'violet',
  },
  {
    tag: '딜러 경매',
    icon: '🔨',
    headline: '여러 딜러가 경쟁해서 값을 올립니다',
    desc: '승인된 딜러들이 입찰하고, 판매자가 최종 선택합니다. 빨리 팔고 싶을 때 적합합니다.',
    points: ['전국 딜러가 입찰', '최고가·순위를 직접 확인', '낙찰 후 탁송까지 연결'],
    cta: { label: '스마트옥션 보기', href: '/auction' },
    accent: 'slate',
  },
];

const SELL_STEPS = [
  { no: '01', title: '차량 등록', desc: '차량번호와 사진을 올리고 판매 가격을 적습니다. 무료입니다.' },
  { no: '02', title: '카비어 검토', desc: '올려주신 내용을 카비어가 확인한 뒤 매물로 공개합니다.' },
  { no: '03', title: '문의 받기', desc: '관심 있는 사람이 채팅으로 문의합니다. 가격 조정도 여기서 합니다.' },
  { no: '04', title: '거래', desc: '직접 만나 차량을 확인하고 거래합니다. 명의이전은 당사자끼리 진행합니다.' },
];

const BUY_STEPS = [
  { no: '01', title: '매물 찾기', desc: '차종·가격·주행거리로 걸러서 봅니다. 진단 리포트가 있는 차는 배지가 붙습니다.' },
  { no: '02', title: '문의하기', desc: '판매자에게 채팅으로 묻습니다. 연락처를 공개하지 않아도 됩니다.' },
  { no: '03', title: '평가사 부르기', desc: '상태가 걱정되면 계약 전에 진단평가사를 부릅니다. 유료 서비스입니다.' },
  { no: '04', title: '거래', desc: '리포트를 보고 판단한 뒤 거래합니다.' },
];

function StepList({ steps }: { steps: { no: string; title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((s) => (
        <div key={s.no} className="bg-white border border-violet-100 rounded-2xl p-5">
          <p className="text-[11px] font-black text-violet-400 mb-2">{s.no}</p>
          <h3 className="font-black text-slate-900 text-sm mb-1.5">{s.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 머리말 */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-slate-50 border-b border-violet-100">
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-20">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">GUIDE</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-[1.3]">
            카비어를 시작하기 전<br />
            한눈에 쉽게 알아보기
          </h1>
        </div>
      </section>

      {/* 거래 유형 구분 */}
      <section className="max-w-5xl mx-auto px-6 py-14 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">거래 방식 구분하기</h2>
          <p className="text-sm text-slate-500">카비어에서 차를 파는 방법은 두 가지입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TRADE_TYPES.map((t) => (
            <div
              key={t.tag}
              className={
                t.accent === 'violet'
                  ? 'bg-white border-2 border-violet-200 rounded-2xl overflow-hidden'
                  : 'bg-white border border-slate-200 rounded-2xl overflow-hidden'
              }
            >
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-3xl">{t.icon}</span>
                  <span
                    className={
                      t.accent === 'violet'
                        ? 'text-xs font-black text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full'
                        : 'text-xs font-black text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full'
                    }
                  >
                    {t.tag}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">{t.headline}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{t.desc}</p>
                <ul className="space-y-2">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className={t.accent === 'violet' ? 'text-violet-500' : 'text-slate-400'}>•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-100 px-6 py-4">
                <Link
                  href={t.cta.href}
                  className={
                    t.accent === 'violet'
                      ? 'block text-center bg-violet-600 hover:bg-violet-700 text-white font-black py-3 rounded-xl text-sm transition-colors'
                      : 'block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-xl text-sm transition-colors'
                  }
                >
                  {t.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 검차가 어디에 끼는가 */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">검차는 어디에 쓰나요?</h2>
            <p className="text-sm text-slate-500">
              거래 자체는 무료입니다. 카비어가 비용을 받는 건 <strong className="font-bold text-slate-700">검차(평가사 방문)</strong> 하나입니다.
            </p>
          </div>

          <div className="bg-white border border-violet-100 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-black text-slate-900 mb-2">🔑 파는 분</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  리포트가 붙은 매물은 사는 쪽이 믿고 연락합니다. 상태를 설명하느라 실랑이할 일이 줄어듭니다.
                </p>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 mb-2">🛒 사는 분</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  계약 전에 평가사를 불러 차 상태를 확인합니다. 잘못 산 차는 되돌리기 어렵습니다.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">국산 99,000원 · 수입 132,000원 · 출장비 없음</p>
              <Link
                href="/call-evaluator"
                className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
              >
                평가사 부르기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 팔 때 / 살 때 */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-xl font-black text-slate-900 mb-5">차를 팔 때</h2>
        <StepList steps={SELL_STEPS} />

        <h2 className="text-xl font-black text-slate-900 mb-5 mt-12">차를 살 때</h2>
        <StepList steps={BUY_STEPS} />
      </section>

      {/* 마무리 */}
      <section className="bg-gradient-to-br from-violet-50 to-slate-50 border-t border-violet-100">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-3">이제 시작해볼까요?</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/sell/register" className="bg-violet-600 hover:bg-violet-700 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors">
              내 차 팔기 (무료)
            </Link>
            <Link href="/market" className="bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors">
              내 차 사기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
