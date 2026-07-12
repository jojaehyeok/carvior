'use client';

import { useState } from 'react';
import Link from 'next/link';

const STEPS = [
  {
    num: '01',
    label: '출품신청',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M9 8h6M9 16h4"/>
      </svg>
    ),
    desc: '출품을 원하실 때에는 구비서류를 준비하여 아래 두가지 방법으로 출품신청이 가능합니다.',
    detail: [
      { tag: '온라인 신청', text: '딜러 로그인 후 경매출품 신청 (회원가입 필요)' },
      { tag: '직접입수', text: '경매장에 차량을 가지고 직접 방문' },
    ],
  },
  {
    num: '02',
    label: '탁송/입고',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    desc: '탁송 서비스를 이용하거나 직접 경매장으로 차량을 입고합니다.',
    detail: [
      { tag: '탁송 서비스', text: '전국 탁송 네트워크를 통해 차량을 안전하게 경매장으로 이동' },
      { tag: '직접 입고', text: '차량을 직접 경매장에 가져오시면 신속하게 접수 처리' },
    ],
  },
  {
    num: '03',
    label: '차량평가',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    desc: '평가사가 차량 상태를 정밀 점검하고 등급을 부여합니다.',
    detail: [
      { tag: '외관 점검', text: '차체, 도장, 유리 등 외관 전반 검사' },
      { tag: '기계 점검', text: '엔진, 미션, 하체 등 기계 상태 정밀 점검' },
    ],
  },
  {
    num: '04',
    label: '경매진행',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="m14.5 12.5-8 8a2.121 2.121 0 0 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>
      </svg>
    ),
    desc: '등록된 딜러들이 실시간으로 참여하는 공개 경쟁 입찰이 진행됩니다.',
    detail: [
      { tag: '실시간 입찰', text: '다수의 검증된 딜러가 동시에 경쟁 입찰' },
      { tag: '투명한 낙찰', text: '최고가 입찰자에게 낙찰 — 결과 즉시 확인 가능' },
    ],
  },
  {
    num: '05',
    label: '대금입금',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    desc: '낙찰 완료 후 약정된 일정에 따라 대금이 입금됩니다.',
    detail: [
      { tag: '당일 정산', text: '낙찰 당일 수수료 차감 후 잔액 즉시 입금' },
      { tag: '안전 거래', text: '에스크로 방식으로 대금 안전 보장' },
    ],
  },
  {
    num: '06',
    label: '사후확인',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
      </svg>
    ),
    desc: '거래 완료 후 서비스 만족도 확인 및 사후 지원을 제공합니다.',
    detail: [
      { tag: '거래 완료 확인', text: '낙찰자와의 명의이전 절차 지원' },
      { tag: '고객 지원', text: '거래 관련 문의사항 1:1 전담 상담사 연결' },
    ],
  },
];

const FEES = [
  { label: '총류 수수료', value: '22,000원', note: '차량 1대 기준' },
  { label: '낙찰 수수료', value: '낙찰가의 2.2%', note: '최소 110,000원 / 최대 440,000원' },
];

export default function AuctionRegisterPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── 히어로 ── */}
      <div className="bg-gradient-to-br from-zinc-900 via-purple-950 to-zinc-900 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">
          {/* 텍스트 */}
          <div className="flex-1">
            <p className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-purple-300/60 border border-purple-400/20 px-3 py-1 rounded-full mb-5">
              카비어 스마트옥션
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.15] mb-4">
              스마트옥션 안내
            </h1>
            <p className="text-white/50 text-base mb-10 leading-relaxed">
              공개 경쟁 입찰의 스마트옥션으로<br />
              내 차를 <span className="text-white font-black">최고가</span>로 판매하세요.
            </p>

            {/* 수수료 카드 */}
            <div className="flex flex-col gap-3 mb-10">
              {FEES.map(f => (
                <div key={f.label} className="flex items-start gap-4 pl-4 border-l-2 border-purple-500">
                  <div>
                    <p className="text-white/40 text-xs font-bold mb-0.5">{f.label}</p>
                    <p className="text-white text-2xl font-black leading-tight">{f.value}</p>
                    <p className="text-white/30 text-[11px] mt-0.5">({f.note})</p>
                  </div>
                </div>
              ))}
              <p className="text-white/25 text-xs mt-1">* 탁송료 등 부가비용은 수수료와 별도로 발생할 수 있습니다.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="bg-purple-600 hover:bg-purple-500 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors">
                내 차 출품하기
              </button>
              <button className="border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-white/5 transition-colors">
                연락처 안내
              </button>
            </div>

            <button className="mt-6 flex items-center gap-1.5 text-sm font-bold text-white/40 hover:text-white/80 transition-colors">
              경매센터 위치보기
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* 일러스트 */}
          <div className="shrink-0 w-full max-w-xs lg:max-w-sm">
            <div className="relative">
              {/* 스테이지 */}
              <div className="w-full aspect-[4/3] rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-end overflow-hidden">
                {/* 조명 효과 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-400/20 blur-3xl rounded-full" />
                {/* 연단 */}
                <svg viewBox="0 0 320 220" fill="none" className="w-full px-8 pb-4">
                  {/* 무대 바닥 */}
                  <ellipse cx="160" cy="190" rx="130" ry="18" fill="white" opacity="0.06"/>
                  {/* 차량 실루엣 */}
                  <rect x="60" y="110" width="200" height="70" rx="12" fill="white" opacity="0.12"/>
                  <path d="M95 110 L120 75 H200 L225 110Z" fill="white" opacity="0.12"/>
                  {/* 덮개 (orange cloth feel in purple) */}
                  <rect x="58" y="108" width="204" height="74" rx="14" fill="#a855f7" opacity="0.25"/>
                  <path d="M93 108 L119 72 H201 L227 108Z" fill="#a855f7" opacity="0.25"/>
                  {/* 바퀴 */}
                  <circle cx="105" cy="178" r="18" fill="#1f1f2e" stroke="#a855f7" strokeWidth="2" opacity="0.8"/>
                  <circle cx="215" cy="178" r="18" fill="#1f1f2e" stroke="#a855f7" strokeWidth="2" opacity="0.8"/>
                  <circle cx="105" cy="178" r="8" fill="#a855f7" opacity="0.4"/>
                  <circle cx="215" cy="178" r="8" fill="#a855f7" opacity="0.4"/>
                  {/* 스포트라이트 빔 */}
                  <path d="M80 0 L120 110 L40 110Z" fill="white" opacity="0.03"/>
                  <path d="M240 0 L280 110 L200 110Z" fill="white" opacity="0.03"/>
                  {/* 망치 */}
                  <rect x="252" y="30" width="10" height="40" rx="3" fill="white" opacity="0.3" transform="rotate(30 252 30)"/>
                  <rect x="240" y="20" width="28" height="14" rx="4" fill="white" opacity="0.4" transform="rotate(30 240 20)"/>
                </svg>
              </div>

              {/* 뱃지 */}
              <div className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full">
                LIVE AUCTION
              </div>
              <div className="absolute bottom-8 right-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/10">
                최고가 낙찰 보장
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 출품 절차 ── */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl font-black text-gray-900">스마트옥션 출품 절차</h2>
          </div>

          {/* 스텝 탭 */}
          <div className="flex flex-nowrap overflow-x-auto gap-0 justify-between mb-12 pb-2">
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                onClick={() => setActiveStep(i)}
                className="flex flex-col items-center gap-3 flex-1 min-w-[80px] group"
              >
                {/* 아이콘 원 */}
                <div className={`
                  relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-200
                  ${activeStep === i
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white border-gray-200 text-gray-400 group-hover:border-purple-300 group-hover:text-purple-400'}
                `}>
                  {s.icon}
                  {/* 연결선 */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 w-full h-px bg-gray-200 -z-10" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-black tracking-wider mb-0.5 ${activeStep === i ? 'text-purple-600' : 'text-gray-400'}`}>
                    {s.num}
                  </p>
                  <p className={`text-xs font-bold ${activeStep === i ? 'text-gray-900' : 'text-gray-500'}`}>
                    {s.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* 스텝 상세 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                {STEPS[activeStep].icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-purple-500 tracking-widest uppercase mb-0.5">
                  STEP {STEPS[activeStep].num}
                </p>
                <h3 className="text-2xl font-black text-gray-900">{STEPS[activeStep].label}</h3>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {STEPS[activeStep].desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STEPS[activeStep].detail.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="shrink-0 text-[10px] font-black text-purple-600 bg-purple-50 border border-purple-100 px-2 py-1 rounded-full mt-0.5">
                    {d.tag}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{d.text}</p>
                </div>
              ))}
            </div>

            {/* 이전/다음 */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              <button
                onClick={() => setActiveStep(v => Math.max(0, v - 1))}
                disabled={activeStep === 0}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                이전 단계
              </button>
              {activeStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStep(v => Math.min(STEPS.length - 1, v + 1))}
                  className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-500 transition-colors"
                >
                  다음 단계
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep(0)}
                  className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-500 transition-colors"
                >
                  처음으로
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M3 12h4"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 수수료 안내 ── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3">PRICING</p>
          <h2 className="text-3xl font-black text-gray-900">투명한 수수료</h2>
          <p className="text-gray-400 text-sm mt-2">숨겨진 비용 없이, 모든 수수료를 사전에 공개합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { label: '총류 수수료', amount: '22,000원', desc: '차량 1대당 고정 비용', highlight: false },
            { label: '낙찰 수수료', amount: '낙찰가의 2.2%', desc: '최소 110,000원 / 최대 440,000원', highlight: true },
            { label: '탁송 수수료', amount: '별도 문의', desc: '거리 및 차량에 따라 상이', highlight: false },
          ].map(f => (
            <div key={f.label} className={`rounded-2xl p-6 border ${f.highlight ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white border-gray-100'}`}>
              <p className={`text-xs font-bold mb-2 ${f.highlight ? 'text-purple-200' : 'text-gray-400'}`}>{f.label}</p>
              <p className={`text-xl font-black mb-1 ${f.highlight ? 'text-white' : 'text-gray-900'}`}>{f.amount}</p>
              <p className={`text-[11px] ${f.highlight ? 'text-purple-200' : 'text-gray-400'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-zinc-950 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 mb-4">지금 시작하세요</p>
          <h2 className="text-3xl font-black text-white mb-4">
            내 차를 최고가에<br />팔고 싶으신가요?
          </h2>
          <p className="text-white/40 text-sm mb-10">
            카비어 스마트옥션은 검증된 딜러 네트워크를 통해<br />
            공정하고 투명한 경쟁 입찰로 최고가 낙찰을 보장합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auction"
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors"
            >
              경매 현황 보기
            </Link>
            <Link
              href="/sell"
              className="border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              일반 판매 신청
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
