'use client';

import Link from 'next/link';
import AuctionAccessGate from '@/components/AuctionAccessGate';

function openChannelTalk() {
  (window as any).ChannelIO?.('show');
}

const FEATURES = [
  { icon: '🧑‍🔧', title: '전문 평가사 현장 방문', desc: '차량이 있는 곳으로 카비어 평가사가 직접 찾아가요.' },
  { icon: '📄', title: '사진 + PDF 리포트 제공', desc: '현장 사진과 함께 정리된 리포트를 바로 받아보세요.' },
  { icon: '🔍', title: '사고·교환·판금·누유·하부 확인', desc: '매입 판단에 필요한 핵심 항목을 빠짐없이 점검해요.' },
  { icon: '🚗', title: '고객 요청 차량 / 매입 전 차량 확인', desc: '매입을 결정하기 전, 원하는 차량만 골라 확인할 수 있어요.' },
];

// 딜러 전용가(88,000/110,000원)를 노출하는 페이지라 일반 고객은 못 보게 승인된 딜러 계정만 통과
function DealerInspectionContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 */}
      <div className="bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-zinc-900 to-zinc-900 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            딜러 파트너 전용가
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.2] mb-5">
            딜러 전용 <span className="text-violet-400">제휴 검차</span>
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl font-bold mb-3">
            타지역 매입차, 직접 보러 가지 마세요
          </p>
          <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            카비어 평가사가 대신 방문해 차량 상태를 확인합니다.<br />
            전국 어디든 카비어가 갑니다!
          </p>
          <Link
            href="/inspection?promo=member"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors"
          >
            제휴 검차 신청하기 →
          </Link>
        </div>
      </div>

      {/* 기능 소개 */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">WHAT YOU GET</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">이렇게 확인해드려요</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-black text-gray-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 가격 */}
      <div className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <p className="text-xs font-black text-violet-600 mb-4">딜러 파트너 전용가</p>
              <div className="flex items-center gap-6">
                <div>
                  <span className="inline-block text-[11px] font-black bg-gray-900 text-white px-2.5 py-1 rounded-full mb-2">국산</span>
                  <p className="text-3xl font-black text-gray-900">88,000<span className="text-base font-bold ml-1">원</span></p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <span className="inline-block text-[11px] font-black bg-gray-900 text-white px-2.5 py-1 rounded-full mb-2">수입</span>
                  <p className="text-3xl font-black text-gray-900">110,000<span className="text-base font-bold ml-1">원</span></p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">VAT 포함</p>
            </div>
            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              <div className="flex items-start gap-2.5 mb-2">
                <span className="text-violet-500 shrink-0 mt-0.5">🛡️</span>
                <p className="text-sm font-bold text-gray-900">정확한 정보로 더 빠르고 안전한 매입</p>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">딜러의 시간과 비용을 아껴드립니다!</p>
            </div>
          </div>
        </div>
      </div>

      {/* 딜러 파트너 모집 CTA */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">카비어 딜러 파트너 모집</h2>
          <p className="text-violet-200 text-sm mb-8">검차 이용 · 파트너 제휴 · 스마트옥션 연계</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inspection?promo=member"
              className="bg-white text-violet-700 font-black px-8 py-4 rounded-xl text-sm hover:bg-violet-50 transition-colors"
            >
              제휴 검차 신청하기
            </Link>
            <button
              onClick={openChannelTalk}
              className="border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              파트너 제휴 문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealerInspectionMarketingPage() {
  return (
    <AuctionAccessGate>
      <DealerInspectionContent />
    </AuctionAccessGate>
  );
}
