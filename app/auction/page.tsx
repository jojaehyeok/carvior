'use client';

// 스마트옥션 소개 — 로그인 전 딜러가 보는 한 장짜리 안내.
//
// 전에는 히어로·참여대상·3단계·WHY·CTA 다섯 덩어리였는데, 같은 말을 네 번 하느라
// 정작 "들어가서 보기" 버튼까지 다섯 번 스크롤해야 했다. 읽을 게 아니라 들어갈 화면이라
// 한 화면 안에서 끝내고, 상세한 조건은 문의로 넘긴다.

import Link from 'next/link';

function openChannelTalk() {
  (window as any).ChannelIO?.('show');
}

const POINTS = [
  { title: '진단 완료 차량만', desc: '카비어 평가사가 직접 본 차량만 올라옵니다. 사고·침수 이력과 주행거리를 그대로 공개합니다.' },
  { title: '승인 딜러만 열람', desc: '매매종사원증 또는 사업자등록증을 확인한 딜러·수출업자·폐차업자만 입찰할 수 있습니다.' },
  { title: '입찰가는 비공개', desc: '다른 딜러가 얼마를 넣었는지는 서로 볼 수 없습니다. 몇 명이 넣었는지만 보입니다.' },
];

const STEPS = [
  ['01', '딜러 인증', '종사원증·사업자등록증 등록'],
  ['02', '매물 확인', '진단 데이터 열람'],
  ['03', '입찰', '원하는 가격에 직접'],
];

export default function AuctionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── 한 화면 ── */}
      <div className="bg-gradient-to-br from-zinc-900 via-purple-950 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
          <p className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-purple-300/60 border border-purple-400/20 px-3 py-1 rounded-full mb-5">
            카비어 스마트옥션
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-[1.2] mb-3">
            진단 완료 차량을<br />가장 먼저, 가장 합리적으로.
          </h1>
          <p className="text-white/50 text-sm mb-8">
            딜러 · 수출업자 · 폐차업자를 위한 공개 경쟁 입찰.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
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
              파트너 신청 문의
            </button>
          </div>

          {/* 진행 순서 — 한 줄로 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            {STEPS.map(([num, title, desc], i) => (
              <div key={num} className="flex items-center gap-3">
                {i > 0 && <span className="text-white/20">→</span>}
                <div className="flex items-baseline gap-2">
                  <span className="text-purple-400/70 font-black">{num}</span>
                  <span className="text-white font-bold">{title}</span>
                  <span className="text-zinc-500 hidden sm:inline">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 알아둘 것 세 가지 ── */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {POINTS.map(p => (
            <div key={p.title}>
              <h2 className="font-black text-gray-900 mb-1.5">{p.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap items-center gap-4">
          <p className="text-sm text-gray-500">
            서류 등록 후 승인되면 바로 입찰할 수 있습니다.
          </p>
          <div className="ml-auto flex gap-2">
            <Link
              href="/auction/market"
              className="bg-gray-900 hover:bg-gray-800 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-colors"
            >
              입찰 시작하기
            </Link>
            <button
              onClick={openChannelTalk}
              className="border border-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-xl text-xs hover:border-gray-400 transition-colors"
            >
              문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
