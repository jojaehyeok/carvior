'use client';

import Link from 'next/link';
import AppFooter from '@/components/footermodal';
import HomePromoPopups from '@/components/HomePromoPopups';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HomePromoPopups />

      {/* ── 히어로 ── */}
      <section className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-zinc-900 to-zinc-900 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              전문 평가사 진단 기반 · 신뢰 거래
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
              복잡하고 불투명하던<br />
              중고차 거래,<br />
              <span className="text-violet-400">카비어가 정리합니다.</span>
            </h1>

            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-10">
              전문 평가사의 진단 리포트로 내 차값을 증명하고,<br />
              검증된 딜러 네트워크에 가장 먼저 전달하세요.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/sell/register"
                className="bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors">
                내 차 등록하기 →
              </Link>
              <Link href="/price"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors">
                번호판으로 시세 조회
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🚗', title: '간편 등록', sub: '지금 바로 올려보세요' },
              { icon: '📝', title: '진단 기반 시세', sub: '평가사 정밀 진단' },
              { icon: '🌏', title: '딜러 네트워크', sub: '수출업자까지 연결' },
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

      {/* ── 브랜드 스토리: Cavior = Car + Savior ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-4">ABOUT CARVIOR</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
              Car<span className="text-violet-600">vior</span>
            </h2>
            <p className="text-gray-400 text-sm font-bold mb-6">Car + Savior · 중고차 구원자</p>
            <p className="text-gray-600 text-base leading-relaxed">
              중고차는 팔 때마다 근거 없이 깎여요. "그냥 시세가 그래요"라는 말 한마디로
              내 차의 가치가 부당하게 낮아지는 게 지금까지의 중고차 거래였습니다.
            </p>
            <p className="text-gray-600 text-base leading-relaxed mt-3">
              카비어는 이름 그대로 <strong className="text-gray-900">불합리한 감가로부터 차주를 구하는</strong> 회사예요.
              전문 평가사의 정밀 진단으로 차량 상태를 객관적으로 증명하고,
              검증된 딜러들의 공개 경쟁입찰로 진짜 가치에 가장 가까운 가격을 찾아드립니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🛡️', title: '불합리한 감가 방지', desc: '근거 없는 "시세가 그래요"는 그만. 감가 사유를 항목별로 증명해요.' },
              { icon: '📈', title: '진짜 가치로 판매', desc: '정밀 진단 리포트로 내 차 상태를 객관적으로 입증하고 시작해요.' },
              { icon: '⚖️', title: '공정한 경쟁입찰', desc: '승인된 딜러들이 공개적으로 가격을 제안, 원하는 만큼 받을 수 있어요.' },
              { icon: '🔐', title: '안전한 거래', desc: '에스크로 결제·탁송·정산까지 전 과정을 카비어가 관리해요.' },
            ].map(v => (
              <div key={v.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <span className="text-2xl mb-3 block">{v.icon}</span>
                <h3 className="font-black text-gray-900 text-sm mb-1.5">{v.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
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
          {/* 검차 신청 */}
          <Link href="/inspection"
            className="group relative overflow-hidden rounded-2xl bg-zinc-900 p-7 hover:bg-violet-700 transition-colors duration-200">
            <div className="absolute bottom-0 right-0 text-[100px] leading-none opacity-10 select-none group-hover:opacity-20 transition-opacity">✦</div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-4">INSPECTION</p>
            <h3 className="text-xl font-black text-white mb-2">내 차 진단받고 싶어요</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              평가사가 직접 방문해 정밀 진단.<br />근거 있는 시세로 증명하세요.
            </p>
            <span className="inline-flex items-center gap-1 text-white font-bold text-sm">
              검차 신청하기
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </Link>

          {/* 내차팔기 */}
          <Link href="/sell"
            className="group relative overflow-hidden rounded-2xl bg-violet-600 p-7 hover:bg-violet-500 transition-colors duration-200">
            <div className="absolute bottom-0 right-0 text-[100px] leading-none opacity-10 select-none group-hover:opacity-20 transition-opacity">💵</div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-4">SELL</p>
            <h3 className="text-xl font-black text-white mb-2">차 팔고 싶어요</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              진단만 받으면<br />딜러 네트워크에 바로 노출.
            </p>
            <span className="inline-flex items-center gap-1 text-white font-bold text-sm">
              등록하기
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
              진단 완료 차량에 직접 가격 제안.<br />빠른 매입, 대량 거래도 OK.
            </p>
            <span className="inline-flex items-center gap-1 text-gray-500 group-hover:text-violet-600 font-bold text-sm transition-colors">
              스마트옥션 가기
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* ── 카비어 진단 리포트 ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-4">CARVIOR REPORT</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            근거 없이 깎이던 내 차값,<br />진단 리포트로 시작합니다.
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10">
            평가사가 방문해 외관 · 기계 · 사고이력을 정밀 점검하고,<br />
            감가 사유까지 항목별로 투명하게 공개해드려요.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-sm mx-auto text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400">진단 리포트 미리보기</span>
              <span className="text-[10px] font-black bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">✦ 진단완료</span>
            </div>
            <div className="space-y-2.5">
              {[
                ['외판 도색 흔적', '-15만원'],
                ['타이어 교체 필요', '-12만원'],
                ['휠 복원 필요', '-8만원'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-bold text-red-500">{val}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400">진단 기반 예상가</span>
              <span className="font-black text-gray-900">협의 가능</span>
            </div>
          </div>

          <Link href="/inspection"
            className="inline-flex items-center gap-2 mt-10 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors">
검차 신청하기
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── 번호판으로 시세 조회 ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1 order-2 lg:order-1">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">시세 조회</p>
            <h2 className="text-3xl font-black text-gray-900 mb-4">번호판만 입력하면<br />내 차 시세가 바로.</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              차종 · 연식 · 주행거리 기반의 실거래 데이터로<br />
              정확한 시세 범위를 바로 확인할 수 있어요.
            </p>
            <Link href="/price"
              className="inline-flex items-center gap-2 border border-gray-300 hover:border-violet-500 hover:text-violet-600 text-gray-700 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors">
              내 차 시세 조회하기
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="flex-1 order-1 lg:order-2 flex justify-center">
            <div className="w-full max-w-[280px] bg-white rounded-[2rem] border border-gray-200 shadow-xl p-5">
              <div className="border border-gray-300 rounded-lg px-3 py-2 text-center font-black text-gray-800 mb-4">
                12가 3456
              </div>
              <div className="space-y-1.5 text-xs text-gray-400 mb-5">
                <div className="flex justify-between"><span>모델명</span><span className="text-gray-700 font-semibold">쏘나타 뉴라이즈</span></div>
                <div className="flex justify-between"><span>연식</span><span className="text-gray-700 font-semibold">2018년형</span></div>
                <div className="flex justify-between"><span>주행거리</span><span className="text-gray-700 font-semibold">78,000km</span></div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 mb-1">내 차 예상시세</p>
              <p className="text-xl font-black text-violet-600">1,150 ~ 1,280만원</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 딜러/수출업자/폐차업자 모집 소개 ── */}
      <section className="bg-zinc-900 relative overflow-hidden py-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 mb-10">
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

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            {[
              { label: '출품 조건', value: '진단신청 필수' },
              { label: '매매정보 공개', value: '승인 딜러만' },
              { label: '참여 가능', value: '딜러·수출·폐차' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-white font-black text-sm">{s.value}</p>
                <p className="text-zinc-500 text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
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

      {/* ── 어떻게 진행되나요? (전체 거래 프로세스 개략도) ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">HOW IT WORKS</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">내 차가 팔리기까지, 이렇게 진행돼요</h2>
          <p className="text-gray-400 text-sm mb-12">
            진단부터 대금 정산까지 — 신청 이후엔 카비어가 각 단계를 직접 확인하며 진행하니 따로 신경 쓸 일이 없어요.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', icon: '✦', title: '검차 신청', desc: '평가사가 방문해 정밀 진단하고 리포트로 남겨요.' },
              { step: '02', icon: '🤝', title: '판매 동의', desc: '진단 완료 후 판매를 결정하면 매물로 전환돼요.' },
              { step: '03', icon: '🔨', title: '딜러 경쟁입찰', desc: '승인된 딜러들이 진단 리포트를 보고 공개 입찰해요.' },
              { step: '04', icon: '🏆', title: '낙찰 확정', desc: '최고 입찰가를 확인하고 판매를 최종 승인해요.' },
              { step: '05', icon: '🔒', title: '안전결제 확인', desc: '카비어가 대금을 직접 보관하지 않고, 에스크로로 입금을 확인해요.' },
              { step: '06', icon: '🚚', title: '탁송', desc: '입금 확인 후 차량을 안전하게 인수·배송해요.' },
              { step: '07', icon: '💰', title: '대금 정산', desc: '탁송료 등 항목을 투명하게 분리해서 정산 금액을 계산해요.' },
              { step: '08', icon: '🎉', title: '거래 완료', desc: '차주에게 대금이 지급되면 거래가 마무리돼요.' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[11px] font-black text-gray-300">{s.step}</span>
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-10">
            <Link href="/inspection"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors">
              검차 신청부터 시작하기
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </p>
        </div>
      </section>

      {/* ── 안심거래 ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3">TRUST</p>
            <h2 className="text-3xl font-black text-gray-900">안심하고 거래할 수 있는 이유</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: '✦', title: '투명한 진단 리포트', desc: '전문 평가사의 정밀 진단으로 감가 사유까지 근거 있게 공개합니다.' },
              { icon: '🔒', title: '승인제 딜러 네트워크', desc: '서류 심사를 통과한 딜러 · 매매업자만 매매정보에 접근할 수 있어요.' },
              { icon: '💬', title: '전담 상담 지원', desc: '궁금한 점은 언제든 010-2285-6017로 편하게 문의해주세요.' },
            ].map(t => (
              <div key={t.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <span className="text-2xl mb-3 block">{t.icon}</span>
                <h3 className="font-black text-gray-900 mb-1.5">{t.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 차 팔기 CTA ── */}
      <section className="bg-violet-600 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-violet-300 text-xs font-bold tracking-widest uppercase mb-3">지금 시작하세요</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-2">
              내 차, 지금 바로<br />등록해보세요.
            </h2>
            <p className="text-violet-200 text-sm">진단만 받으면 딜러 네트워크 자동 연결</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/sell/register"
              className="bg-white text-violet-700 font-black px-8 py-4 rounded-xl text-sm hover:bg-violet-50 transition-colors text-center">
              지금 등록하기
            </Link>
            <Link href="/price"
              className="border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors text-center">
              내 차 시세 확인하기
            </Link>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
