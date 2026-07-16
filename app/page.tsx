'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import AppFooter from '@/components/footermodal';
import InspectionPromoPopup from '@/components/InspectionPromoPopup';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <InspectionPromoPopup />

      {/* ── 히어로 ── */}
      <section className="relative bg-zinc-900 overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-zinc-900 to-zinc-900 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            {/* 뱃지 */}
            <span className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              MVP 한정 · 등록 완전 무료
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
              살 때도, 팔 때도<br />
              <span className="text-violet-400">카비어 하나면</span><br />
              충분해요.
            </h1>

            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-10">
              허위매물 없는 진단 차량만 · 딜러 수수료 0원 · 전 세계 바이어 연결<br />
              복잡한 중고차 거래, 이제 쉽게 해결하세요.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/buy"
                className="bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors">
                지금 매물 보기 →
              </Link>
              <Link href="/sell"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors">
                내 차 무료 등록
              </Link>
            </div>
          </div>

          {/* 플로팅 카드 */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🚗', title: '무료 등록', sub: '지금 바로 올려보세요' },
              { icon: '💰', title: '등록비 무료', sub: 'MVP 기간 한정' },
              { icon: '🌏', title: '글로벌 바이어', sub: '해외 직거래 연결' },
              { icon: '📋', title: '투명한 이력', sub: '사고·침수 전수 공개' },
            ].map(c => (
              <div key={c.title} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
                <p className="text-2xl mb-2">{c.icon}</p>
                <p className="text-white font-black text-sm">{c.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 뭘 하고 싶으세요? ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-black text-gray-900 mb-2">무엇을 도와드릴까요?</h2>
        <p className="text-gray-400 text-sm mb-10">원하는 서비스를 선택하면 바로 시작할 수 있어요.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 내차사기 */}
          <Link href="/buy"
            className="group relative overflow-hidden rounded-2xl bg-zinc-900 p-7 hover:bg-violet-700 transition-colors duration-200">
            <div className="absolute bottom-0 right-0 text-[100px] leading-none opacity-10 select-none group-hover:opacity-20 transition-opacity">🚗</div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-4">BUY</p>
            <h3 className="text-xl font-black text-white mb-2">차 사고 싶어요</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              진단 완료된 차량만 모았어요.<br />사진, 이력, 가격 전부 투명하게.
            </p>
            <span className="inline-flex items-center gap-1 text-white font-bold text-sm">
              매물 보러가기
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </Link>

          {/* 내차팔기 */}
          <Link href="/sell"
            className="group relative overflow-hidden rounded-2xl bg-violet-600 p-7 hover:bg-violet-500 transition-colors duration-200">
            <div className="absolute bottom-0 right-0 text-[100px] leading-none opacity-10 select-none group-hover:opacity-20 transition-opacity">💵</div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-4">SELL · FREE</p>
            <h3 className="text-xl font-black text-white mb-2">차 팔고 싶어요</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              등록비도, 수수료도 0원.<br />사진 올리면 바로 글로벌 노출.
            </p>
            <span className="inline-flex items-center gap-1 text-white font-bold text-sm">
              무료로 등록하기
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </Link>

          {/* 딜러/바이어 */}
          <Link href="/auction"
            className="group relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-200 p-7 hover:border-violet-400 hover:bg-violet-50 transition-colors duration-200">
            <div className="absolute bottom-0 right-0 text-[100px] leading-none opacity-10 select-none group-hover:opacity-20 transition-opacity">🔨</div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">DEALER</p>
            <h3 className="text-xl font-black text-gray-900 mb-2">딜러 · 바이어예요</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              원하는 차에 직접 가격 제안.<br />빠른 매입, 대량 거래도 OK.
            </p>
            <span className="inline-flex items-center gap-1 text-gray-500 group-hover:text-violet-600 font-bold text-sm transition-colors">
              입찰 마켓 가기
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* ── 딜러/수출업자/폐차업자 모집 소개 ── */}
      <section className="bg-zinc-900 relative overflow-hidden py-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                딜러 · 수출업자 · 폐차업자 파트너 모집
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                진단 완료 차량을<br />가장 먼저 만나보세요.
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                카비어 스마트옥션은 딜러 · 수출업자 · 폐차업자만 참여하는 공개 경쟁 입찰 플랫폼입니다.<br />
                검증된 진단 데이터로 투명하게, 원하는 가격에 직접 입찰하세요.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/auction"
                className="bg-purple-600 hover:bg-purple-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors text-center">
                스마트옥션 살펴보기
              </Link>
              <a href="mailto:partner@carvior.store"
                className="border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors text-center">
                파트너 신청 문의
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 진단 vs 개인직거래 ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-violet-500 mb-2">WHY INSPECTION</p>
          <h2 className="text-3xl font-black text-gray-900 mb-3">진단받은 차가 왜 더 잘 팔릴까요?</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            개인이 직접 올린 매물과 평가사가 검증한 매물은 구매자의 신뢰도부터 다릅니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* 개인 직거래 */}
          <div className="rounded-2xl border-2 border-gray-200 p-6 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-gray-200 text-gray-500">개인직거래</span>
            </div>
            <div className="space-y-3">
              {[
                ['판매까지 평균', '47일'],
                ['구매자 신뢰도', '낮음'],
                ['허위정보 리스크', '있음'],
                ['해외 바이어 연결', '어려움'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-bold text-gray-500">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 진단 */}
          <div className="rounded-2xl border-2 border-amber-400 p-6 bg-amber-50/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-400 text-amber-900">✦ 진단</span>
            </div>
            <div className="space-y-3">
              {[
                ['판매까지 평균', '13일'],
                ['구매자 신뢰도', '높음'],
                ['허위정보 리스크', '없음'],
                ['해외 바이어 연결', '자동 노출'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-black text-amber-700">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/inspection"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-900 font-black px-8 py-4 rounded-xl text-sm transition-colors">
            ✦ 검차 신청하기
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <p className="text-xs text-gray-400 mt-2">
            <Link href="/marketing/carvior-inspection" className="underline hover:text-gray-600">서비스 자세히 보기</Link>
          </p>
        </div>
      </section>

      {/* ── 어떻게 진행되나요? ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-black text-gray-900 mb-2">어떻게 진행되나요?</h2>
        <p className="text-gray-400 text-sm mb-12">복잡한 거 없어요. 딱 3단계예요.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: '차량 등록 또는 검색', desc: '사진 몇 장 올리면 바로 등록 완료.\n사는 분은 차종·예산으로 필터링.', color: 'text-violet-600' },
            { step: '02', title: '진단 & 가격 제안', desc: '평가사 방문 진단.\n바이어가 직접 가격 제안도 가능해요.', color: 'text-violet-600' },
            { step: '03', title: '탁송 또는 검차 연결', desc: '계약 완료 후 탁송·검차 예약까지\n카비어에서 한 번에 끝내요.', color: 'text-violet-600' },
          ].map(s => (
            <div key={s.step} className="flex gap-5">
              <span className={clsx('text-4xl font-black leading-none shrink-0', s.color)}>{s.step}</span>
              <div>
                <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 차 팔기 CTA ── */}
      <section className="bg-violet-600 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-violet-300 text-xs font-bold tracking-widest uppercase mb-3">MVP 기간 한정</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-2">
              내 차, 지금 바로<br />무료로 올려보세요.
            </h2>
            <p className="text-violet-200 text-sm">등록비 0원 · 수수료 0원 · 해외 바이어 자동 연결</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/sell/register"
              className="bg-white text-violet-700 font-black px-8 py-4 rounded-xl text-sm hover:bg-violet-50 transition-colors text-center">
              지금 무료 등록하기
            </Link>
            <Link href="/buy"
              className="border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors text-center">
              매물 구경하기
            </Link>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
