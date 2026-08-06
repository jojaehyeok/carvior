'use client';

function openChannelTalk() {
  (window as any).ChannelIO?.('show');
}

const FEATURES = [
  { icon: '🔗', title: '우리 회사 전용 URL', desc: '가입 즉시 "carvior.store/diagnosis/우리회사" 전용 페이지가 생겨요. 코드 작업, 대기 기간 없이 바로 씁니다.' },
  { icon: '📋', title: '신청내역 한눈에', desc: '우리 회사가 요청한 검차 건들만 모아서 보여드려요. 상태(대기·진행·완료)까지 실시간 확인 가능.' },
  { icon: '📄', title: '리포트 모아보기', desc: '완료된 진단 리포트를 건마다 찾아다닐 필요 없이 한 화면에서 모아볼 수 있어요.' },
  { icon: '✍️', title: '계약 정보 관리', desc: '계약자성함·구전 등 우리 쪽 거래 진행 정보를 직접 기록하고 관리할 수 있어요.' },
  { icon: '🔔', title: '완료 알림', desc: '진단이 끝나면 담당자 번호로 바로 알림이 가서 놓치는 건 없이 확인됩니다.' },
  { icon: '💳', title: '후정산 지원', desc: '건별 결제 대신 월 단위로 모아서 정산하는 것도 가능해요.' },
];

const STEPS = [
  { num: '01', title: '제휴 문의', desc: '아래 버튼으로 회사 정보만 간단히 남겨주세요.' },
  { num: '02', title: '카비어가 계정 생성', desc: '확인 후 전용 관리 계정을 만들어드려요.' },
  { num: '03', title: '바로 이용 시작', desc: '전용 페이지에서 신청·리포트·정산까지 한 번에.' },
];

export default function PartnerPanelPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 */}
      <div className="bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-zinc-900 to-zinc-900 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            렌트사 · 소형 업체 제휴 무료 지원
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.2] mb-5">
            검차 요청할 때마다 흩어지던 이력,<br />
            <span className="text-violet-400">우리 회사 전용 페이지</span>로 모아드립니다.
          </h1>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            렌트 만기·판매 전환 등으로 검차를 종종 요청하신다면, 매번 따로 연락하고 리포트 찾을 필요 없이
            회사 전용 관리페이지 하나로 신청부터 리포트까지 관리하실 수 있어요.
          </p>
          <button
            onClick={openChannelTalk}
            className="bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors"
          >
            제휴 문의하기 →
          </button>
        </div>
      </div>

      {/* 기능 소개 */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">WHAT YOU GET</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">가입하시면 이런 게 생겨요</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-black text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 진행 절차 */}
      <div className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">HOW IT WORKS</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">복잡한 절차 없이, 3단계면 끝</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="flex gap-5">
                <span className="text-4xl font-black leading-none shrink-0 text-violet-600">{s.num}</span>
                <div>
                  <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-violet-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">전용 관리페이지, 지금 문의해보세요</h2>
          <p className="text-violet-200 text-sm mb-8">가입비·월 이용료 없이 무료로 제공됩니다.</p>
          <button
            onClick={openChannelTalk}
            className="bg-white text-violet-700 font-black px-8 py-4 rounded-xl text-sm hover:bg-violet-50 transition-colors"
          >
            제휴 문의하기 →
          </button>
        </div>
      </div>
    </div>
  );
}
