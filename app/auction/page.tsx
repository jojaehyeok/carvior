'use client';

import Link from 'next/link';

function openChannelTalk() {
  (window as any).ChannelIO?.('show');
}

const AUDIENCE = [
  { icon: '🚗', title: '중고차 딜러', desc: '진단 완료 차량을 시세보다 먼저, 합리적인 가격에 매입하세요.' },
  { icon: '🌏', title: '수출업자', desc: '해외 판매용 차량 정보를 도매 단계에서 미리 확인하고 선점하세요.' },
  { icon: '♻️', title: '폐차업자', desc: '부품·고철 매입가까지 고려한 차량 정보를 실시간으로 받아보세요.' },
];

const STEPS = [
  { num: '01', title: '딜러 인증', desc: '매매종사원증 또는 사업자등록증을 등록하고 승인을 받아요.' },
  { num: '02', title: '진단 매물 확인', desc: '카비어 평가사가 진단한 차량 정보를 실시간으로 확인해요.' },
  { num: '03', title: '직접 입찰', desc: '진단신청 필수 매물만 올라와요, 원하는 가격에 자유롭게 입찰하세요.' },
];

export default function AuctionPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── 히어로 ── */}
      <div className="bg-gradient-to-br from-zinc-900 via-purple-950 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <p className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-purple-300/60 border border-purple-400/20 px-3 py-1 rounded-full mb-5">
            카비어 스마트옥션
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.15] mb-4 max-w-2xl">
            진단 완료 차량을<br />가장 먼저, 가장 합리적으로.
          </h1>
          <p className="text-white/50 text-base mb-10 leading-relaxed max-w-xl">
            딜러 · 수출업자 · 폐차업자를 위한 공개 경쟁 입찰 플랫폼입니다.<br />
            카비어 평가사가 진단한 차량 정보를 실시간으로 확인하고 직접 입찰하세요.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-3xl">
            {[
              { icon: '✦', title: '진단 데이터 공개', desc: '사고·침수 이력, 주행거리까지 투명하게' },
              { icon: '⚡', title: '진단신청 필수', desc: '진단 완료 매물만 자유롭게 입찰' },
              { icon: '🔒', title: '승인 딜러만 열람', desc: '매매정보는 인증된 딜러에게만 공개' },
            ].map(f => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
                <p className="text-lg mb-2">{f.icon}</p>
                <p className="text-white font-black text-sm">{f.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/auction/market"
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              딜러 인증하고 입찰하기
            </Link>
            <button
              onClick={openChannelTalk}
              className="border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              딜러 · 파트너 신청 문의
            </button>
          </div>
        </div>
      </div>

      {/* ── 참여 대상 ── */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3">WHO</p>
            <h2 className="text-3xl font-black text-gray-900">이런 분들이 참여하고 있어요</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {AUDIENCE.map(a => (
              <div key={a.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <span className="text-2xl mb-3 block">{a.icon}</span>
                <h3 className="font-black text-gray-900 mb-1.5">{a.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 진행 절차 ── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">HOW IT WORKS</p>
          <h2 className="text-3xl font-black text-gray-900">3단계면 충분해요</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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

      {/* ── 왜 카비어인가 ── */}
      <div className="bg-zinc-900 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 mb-4">WHY CARVIOR</p>
          <h2 className="text-3xl font-black text-white mb-10">허위매물 걱정 없이,<br />진단 데이터로만 거래하세요.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: '진단 완료율', value: '100%' },
              { label: '진단신청', value: '필수' },
              { label: '매매정보 공개', value: '승인 딜러만' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-5">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-purple-950 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-purple-300/50 mb-4">지금 시작하세요</p>
          <h2 className="text-3xl font-black text-white mb-4">
            딜러 · 수출업자 · 폐차업자<br />파트너를 모집합니다.
          </h2>
          <p className="text-white/40 text-sm mb-10">
            서류 등록 후 승인되면 바로 입찰을 시작할 수 있어요.<br />
            궁금한 점은 채팅으로 편하게 문의해주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auction/market"
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors"
            >
              딜러 인증하고 입찰하기
            </Link>
            <button
              onClick={openChannelTalk}
              className="border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              채팅으로 문의하기
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
