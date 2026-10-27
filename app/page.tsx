'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppFooter from '@/components/footermodal';
import HomePromoPopups from '@/components/HomePromoPopups';
import RecentListings from '@/components/home/RecentListings';
import NoticeAndFaq from '@/components/home/NoticeAndFaq';
import SideRail from '@/components/SideRail';
import { brandLogoSlug } from '@/lib/carBrand';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  driverName: string | null;
  driverPhotoUrl: string | null;
  carModel: string | null;
  createdAt: string;
}

const VEHICLE_DATA_POINTS = [
  '외관 8방향', '엔진룸', '하부', '휠·타이어', '계기판',
  'VIN', '고장코드', '도막 측정', '옵션 작동', '누유', '사고·교환·판금',
];

// 검차가 실제로 어떻게 흘러가는지 — 홈 '이용안내' 섹션에서 쓴다
const INSPECTION_STEPS = [
  { icon: '📝', title: '신청', desc: '차량번호와 차 있는 위치, 원하는 시간을 남기면 접수됩니다.' },
  { icon: '🚗', title: '평가사 방문', desc: '가까운 진단평가사가 배정돼 그 자리로 직접 찾아갑니다.' },
  { icon: '🔍', title: '현장 진단', desc: '외관·엔진룸·하부·도막·옵션 작동까지 항목별로 확인하고 사진으로 남깁니다.' },
  { icon: '📄', title: '리포트 전달', desc: '결과를 링크로 받아 바로 열어보고, 상대에게 그대로 보낼 수 있습니다.' },
];

const PRINCIPLES = [
  { no: '01', title: '판매와 진단의 분리', desc: '차량 판매를 위해 진단 결과를 바꾸지 않습니다.' },
  { no: '02', title: '차량 상태의 기록', desc: '사진·진단결과·주요 확인사항을 데이터로 남깁니다.' },
  { no: '03', title: '가격의 투명성', desc: '거래 전 소비자가 부담하는 비용을 명확하게 보여줍니다.' },
  { no: '04', title: '공정한 딜러 경쟁', desc: '누구에게나 동일한 차량 정보를 제공합니다.' },
  { no: '05', title: '거래 기록의 보존', desc: '입찰·진단·거래 과정을 기록하여 분쟁을 줄입니다.' },
];

const DEALER_PROTECTIONS = [
  '차량 상태를 보고 입찰',
  '진단 사진과 기록 확인',
  '매입 후 예상치 못한 손실 최소화',
  '이의제기 기록 관리',
  '거래 과정 투명하게 보존',
];

const AUCTION_FLOW = [
  { icon: '🚗', title: '판매자', desc: '한 명의 딜러 가격이 아닌,\n시장의 가격을 확인하세요.' },
  { icon: '✦', title: 'CARVIOR INSPECTION', desc: '독립 평가사가\n차량 상태를 기록해요.' },
  { icon: '🔨', title: '전국 딜러 경쟁입찰', desc: '승인된 딜러들이\n공개적으로 가격을 제안해요.' },
  { icon: '🏆', title: '최고가 제안 확인', desc: '가장 높은 제안가를\n바로 확인해요.' },
  { icon: '⚖️', title: '판매 / 보류 선택', desc: '판매자가 직접\n최종 결정해요.' },
];

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://carvior.store/api/v1/reviews')
      .then(r => r.json())
      .then((data: Review[]) => setReviews(Array.isArray(data) ? data.filter(r => r.rating >= 4) : []))
      .catch(() => setReviews([]));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HomePromoPopups />

      {/* ── 히어로 ──
           전에는 화면을 가득 채워서 매물을 보려면 한참 내려야 했다. 여백을 줄여서 낮췄다.
           ⚠ max-height로 자르면 안 된다 — 글자 크기나 줄 수가 바뀌면 버튼부터 잘려나간다.
           배경 사진은 오른쪽에 붙여 배너 비주얼처럼 쓰고, 글자 쪽은 어둡게 덮어 읽히게 한다. */}
      <section className="relative bg-gradient-to-br from-violet-50 via-white to-slate-50 overflow-hidden border-b border-violet-100">
        <img
          src="/images/diagnostic-1.jpg"
          alt=""
          className="absolute inset-y-0 right-0 w-full md:w-3/5 h-full object-cover object-center opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-violet-300/20 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              독립 진단 기반 · 투명한 거래
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-[1.25] mb-4">
              중고차 거래,<br />
              이제 <span className="text-violet-400">차량 상태부터</span><br />
              투명하게.
            </h1>

            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-7">
              카비어는 차량을 직접 판매하지 않습니다.<br />
              독립된 진단평가와 투명한 거래 정보로<br />
              사는 사람과 파는 사람이 안심할 수 있는 시장을 만듭니다.
            </p>

            {/* 들어오는 사람은 둘 중 하나다 — 팔러 왔거나 사러 왔거나.
                검차는 그 과정에서 자연스럽게 만나게 하고, 히어로에선 두 동선만 보여준다. */}
            <div className="flex flex-wrap gap-3">
              <Link href="/sell/register"
                className="bg-violet-600 hover:bg-violet-500 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors">
                내 차 팔기 (무료) →
              </Link>
              <Link href="/market"
                className="bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors">
                내 차 사기
              </Link>
              <Link href="/inspection"
                className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors">
                검차 신청
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 최근 올라온 차량 (개인 직거래) ──
           브랜드 소개보다 실제 매물이 먼저 보여야 거래 사이트로 읽힌다. */}
      <RecentListings />

      {/* ── 검차 서비스 이용안내 ──
           "사진 몇 장이 아니라 기록을 남긴다"는 주장만 있던 자리를, 실제로 어떻게 흘러가는지
           단계로 보여주는 안내로 바꿨다. 개인 거래에서 제일 많이 묻는 게 "그래서 뭘 해주냐"다. */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">INSPECTION PROCESS</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">
              검차는 이렇게 진행됩니다
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              평가사가 차가 있는 곳으로 직접 가서 확인하고, 결과를 리포트로 남깁니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {INSPECTION_STEPS.map((s, i) => (
              <div key={s.title} className="relative bg-white border border-violet-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-violet-100 rounded-2xl p-6 md:p-7">
            <p className="text-sm font-black text-slate-900 mb-1.5">무엇을 확인하나요?</p>
            <p className="text-xs text-slate-500 mb-4">진단 한 건마다 30장 이상의 사진과 항목별 기록이 남습니다.</p>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_DATA_POINTS.map(tag => (
                <span key={tag} className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/call-evaluator" className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-black px-8 py-3.5 rounded-xl text-sm transition-colors">
              평가사 부르기 →
            </Link>
          </div>
        </div>
      </section>
      {/* ── 진단 받아보신 분들의 후기 (실제 리뷰) ── */}
      {reviews.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-100 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-bold tracking-widest uppercase text-violet-500 mb-2">REAL REVIEWS</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">진단 받아보신 분들의 후기</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory">
              {reviews.map(r => {
                const expanded = expandedReviewId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setExpandedReviewId(expanded ? null : r.id)}
                    className="shrink-0 w-72 snap-start bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {brandLogoSlug(r.carModel) && (
                        <img src={`/brand-logos/${brandLogoSlug(r.carModel)}.png`} alt="" className="h-6 w-auto object-contain" />
                      )}
                      <p className="text-xs font-bold text-violet-600">{r.carModel ?? '차종 미상'}</p>
                    </div>
                    <div className="text-amber-400 text-sm mb-3">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    <p className={`text-sm text-gray-700 leading-relaxed mb-4 ${expanded ? '' : 'line-clamp-5'}`}>{r.comment}</p>
                    {!expanded && (r.comment?.length ?? 0) > 90 && (
                      <p className="text-[11px] text-violet-400 font-bold mb-3">더보기</p>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      {r.driverPhotoUrl ? (
                        <img src={r.driverPhotoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100" />
                      )}
                      <p className="text-xs text-gray-400">{r.driverName ? `${r.driverName} 평가사` : '카비어 평가사'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <NoticeAndFaq />

      {/* ── 차바타 앱 안내 ──
           고객용·딜러용 앱은 따로 만들 예정이라, 지금은 실제로 나와 있는
           진단평가사 앱(차바타)만 소개한다. 앱이 더 나오면 여기에 나란히 붙이면 된다. */}
      <section className="bg-gradient-to-br from-violet-50 to-slate-50 border-y border-violet-100">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo-icon.svg" alt="" className="w-9 h-9" />
              <span className="text-slate-900 text-xl font-black">차바타</span>
              <span className="text-[10px] font-bold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">
                진단평가사용
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">
              현장 진단을 더 쉽고 빠르게.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-7">
              배정받은 의뢰 확인부터 사진 촬영·리포트 작성·정산 내역까지<br className="hidden sm:block" />
              진단평가사가 현장에서 쓰는 앱입니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.rabbitjindan.ChavatarApp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white hover:bg-violet-50 border border-violet-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl text-sm shadow-sm transition-colors"
              >
                ▶ Google Play
              </a>
              <a
                href="https://apps.apple.com/kr/app/id6801937353"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white hover:bg-violet-50 border border-violet-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl text-sm shadow-sm transition-colors"
              >
                 App Store
              </a>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              진단평가사 지원은 <Link href="/recruit" className="underline hover:text-violet-600">평가사 모집</Link>에서 받습니다.
            </p>
          </div>

          <div className="shrink-0">
            <div className="hidden sm:flex w-44 h-80 rounded-[2rem] border-4 border-violet-100 bg-white shadow-sm flex-col items-center justify-center gap-3">
              <img src="/logo-icon.svg" alt="" className="w-14 h-14" />
              <p className="text-slate-900 font-black">차바타</p>
              <p className="text-slate-400 text-xs">진단평가사 전용 앱</p>
            </div>
          </div>
        </div>
      </section>

      {/* 공지·FAQ는 푸터 바로 위 — 거래 사이트에서 제일 자주 찾는 두 가지 */}

      {/* ── CARVIOR 5 PRINCIPLES ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-violet-500 mb-2">CARVIOR 5 PRINCIPLES</p>
          <h2 className="text-3xl font-black text-gray-900">카비어가 지키는 5가지 원칙</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRINCIPLES.map(p => (
            <div key={p.no} className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <p className="text-[11px] font-black text-violet-400 mb-3">{p.no}</p>
              <h3 className="font-black text-gray-900 text-sm mb-1.5">{p.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* 최근 본 차량 · 찜 · 맨 위로 — 어느 화면에서나 오른쪽에 붙어 있다 */}
      <SideRail />

      <AppFooter />
    </div>
  );
}
