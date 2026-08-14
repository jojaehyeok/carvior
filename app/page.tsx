'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppFooter from '@/components/footermodal';
import HomePromoPopups from '@/components/HomePromoPopups';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  driverName: string | null;
  driverPhotoUrl: string | null;
  carModel: string | null;
  createdAt: string;
}

// 브랜드 로고는 매번 외부 API를 부르지 않고 public/brand-logos에 고정으로 박아둔 파일만 사용
// (filippofilip95/car-logos-dataset, MIT). 차종 텍스트에서 브랜드명을 찾아 슬러그로 매핑.
const BRAND_LOGO_MAP: [RegExp, string][] = [
  [/테슬라|tesla/i, 'tesla'],
  // "벤츠" 표기가 없어도 C220처럼 벤츠 모델코드(C/E/S클래스, GLA~GLS, CLA, CLS)만 적혀있는 경우도 매칭
  [/벤츠|벤즈|mercedes|메르세데스|\b(?:[CES]\s?\d{3}|GL[ABCES]|CLA|CLS)\b/i, 'mercedes-benz'],
  // 브랜드명 없이 모델명만 적힌 경우도 추정: 현대/기아/쌍용은 국내 매물 특성상 자주 그렇게 씀
  [/현대|hyundai|아반떼|소나타|그랜저|투싼|싼타페|팰리세이드|코나|캐스퍼|베뉴|아이오닉|스타렉스|포터|넥쏘|벨로스터/i, 'hyundai'],
  [/기아|\bkia\b|\bk[3-9]\b|모닝|레이|셀토스|스포티지|쏘렌토|카니발|모하비|스팅어|니로|\bev[369]\b/i, 'kia'],
  [/\bbmw\b/i, 'bmw'],
  [/아우디|audi/i, 'audi'],
  [/제네시스|genesis/i, 'genesis'],
  [/쉐보레|쉐비|chevrolet/i, 'chevrolet'],
  [/르노|renault/i, 'renault'],
  [/쌍용|ssangyong|kg모빌리티|렉스턴|티볼리|코란도|무쏘|액티언|카이런|체어맨|토레스/i, 'ssangyong'],
  [/폭스바겐|volkswagen|\bvw\b/i, 'volkswagen'],
  [/토요타|도요타|toyota/i, 'toyota'],
  [/렉서스|lexus/i, 'lexus'],
  [/포르쉐|porsche/i, 'porsche'],
  [/볼보|volvo/i, 'volvo'],
  [/랜드로버|land.?rover/i, 'land-rover'],
  [/지프|\bjeep\b/i, 'jeep'],
  [/포드|\bford\b/i, 'ford'],
  [/혼다|honda/i, 'honda'],
  [/닛산|nissan/i, 'nissan'],
  [/미니쿠퍼|\bmini\b/i, 'mini'],
];

function brandLogoSlug(carModel: string | null): string | null {
  if (!carModel) return null;
  const hit = BRAND_LOGO_MAP.find(([re]) => re.test(carModel));
  return hit ? hit[1] : null;
}

const VEHICLE_DATA_POINTS = [
  '외관 8방향', '엔진룸', '하부', '휠·타이어', '계기판',
  'VIN', '고장코드', '도막 측정', '옵션 작동', '누유', '사고·교환·판금',
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

      {/* ── 히어로 ── */}
      <section className="relative bg-zinc-900 overflow-hidden">
        <img
          src="/images/diagnostic-1.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-zinc-900/80 to-zinc-900 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              독립 진단 기반 · 투명한 거래
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] mb-6">
              중고차 거래,<br />
              이제 <span className="text-violet-400">차량 상태부터</span><br />
              투명하게.
            </h1>

            <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-10">
              카비어는 차량을 직접 판매하지 않습니다.<br />
              독립된 진단평가와 투명한 거래 정보로<br />
              사는 사람과 파는 사람이 안심할 수 있는 시장을 만듭니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/inspection"
                className="bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors">
                내 차 진단하기 →
              </Link>
              <Link href="/vehicles"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors">
                검차 차량 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARVIOR VEHICLE DATA ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img src="/images/diagnostic-2.jpg" alt="도막 측정" className="rounded-2xl object-cover w-full h-56 col-span-1" />
            <img src="/images/diagnostic-3.jpg" alt="하부 점검" className="rounded-2xl object-cover w-full h-56 col-span-1" />
            <img src="/images/diagnostic-1.jpg" alt="진단 데이터 확인" className="rounded-2xl object-cover w-full h-40 col-span-2" />
          </div>

          <div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-4">CARVIOR VEHICLE DATA</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-5">
              사진 몇 장이 아니라,<br />차량의 기록을 남깁니다.
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              번호판 사진 두 장으로는 차량 상태를 증명할 수 없습니다.
              카비어는 진단 한 건마다 30장 이상의 사진과 항목별 기록을 남깁니다.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {VEHICLE_DATA_POINTS.map(tag => (
                <span key={tag} className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm font-black text-violet-600">한 번의 진단이 차량의 디지털 기록이 됩니다.</p>
          </div>
        </div>
      </section>

      {/* ── 판매와 진단의 분리 ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-violet-500 mb-4">CARVIOR PHILOSOPHY</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-500 mb-2">
            우리는 자동차를 팔기 위해 진단하지 않습니다.
          </h2>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12">
            차량 상태를 정확히 알기 위해 진단합니다.
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-4">
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-600 w-full sm:w-auto">
              판매자
            </div>
            <span className="text-gray-300 text-xl rotate-90 sm:rotate-0">⇄</span>
            <div className="bg-violet-600 rounded-2xl px-8 py-5 text-sm font-black text-white shadow-lg shadow-violet-200 w-full sm:w-auto">
              CARVIOR 진단 데이터
            </div>
            <span className="text-gray-300 text-xl rotate-90 sm:rotate-0">⇄</span>
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-600 w-full sm:w-auto">
              구매자
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-12">카비어는 어느 한쪽 편이 아니라, 차량 상태의 편입니다.</p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto border-t border-gray-200 pt-8">
            {[
              ['판매까지 평균', '13일'],
              ['구매자 신뢰도', '높음'],
              ['허위정보 리스크', '없음'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-lg font-black text-gray-900">{val}</p>
                <p className="text-[11px] text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <Link href="/marketing/carvior-inspection" className="inline-block text-sm text-gray-400 underline hover:text-gray-600 mt-10">
            서비스 자세히 보기
          </Link>
        </div>
      </section>

      {/* ── 가격 투명성 ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-4">PRICE TRANSPARENCY</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-5">
              가격도,<br />투명하게 보여드립니다.
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              관리비용·수수료를 나중에 더하지 않습니다.
              거래 전 화면에서 실제 부담 금액을 그대로 보여드려요.
            </p>
            <p className="text-lg font-black text-violet-600 mt-6">
              마지막 화면에서 가격이 달라지지 않습니다.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-7">
            <p className="text-xs font-bold text-gray-400 mb-5">가격표 (예시)</p>
            <div className="space-y-3">
              {[
                ['차량가격', '15,000,000원'],
                ['관리비용', '330,000원'],
                ['플랫폼 이용료', '0원'],
                ['기타 비용', '0원'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-bold text-gray-600">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 mt-5 pt-5">
              <span className="text-sm font-bold text-gray-900">내가 실제 내는 금액</span>
              <span className="text-xl font-black text-violet-600">15,330,000원</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 진단 받아보신 분들의 후기 (실제 리뷰) ── */}
      {reviews.length > 0 && (
        <section className="bg-gray-50 border-y border-gray-100 py-20">
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
                        <img src={`/brand-logos/${brandLogoSlug(r.carModel)}.png`} alt="" className="h-4 w-auto object-contain" />
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

      {/* ── CARVIOR CARE (준비 중) ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl border-2 border-dashed border-gray-200 p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-5">
                COMING SOON · CARVIOR CARE
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
                중고차의 문제는 하자가 아니라,<br />숨겨진 정보입니다.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                하자를 알고 선택하는 것과, 모르고 사는 것은 완전히 다릅니다.
                카비어는 협력 정비소와 연결해 예상 정비비까지 비교할 수 있는 서비스를 준비하고 있어요.
              </p>
              <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                협력 정비소 연결·견적 비교는 준비 중입니다. 다만 예상 정비비 자체는 이미 진단 리포트와{' '}
                <Link href="/vehicles" className="text-violet-500 underline hover:text-violet-600">검차 차량 보기</Link>
                에서 실제로 확인할 수 있어요.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 opacity-90">
              <p className="text-[10px] font-bold text-gray-300 mb-4">예상 정비비 (예시)</p>
              <div className="space-y-2.5">
                {[
                  ['프론트 로어암 부싱 균열', '18~25만원'],
                  ['엔진오일 미세누유', '15~40만원'],
                  ['앞 브레이크 패드 잔량 부족', '12~18만원'],
                  ['타이어 2본 교체 권장', '28~40만원'],
                  ['운전석 도어 판금', '20~30만원'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-bold text-gray-400">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 mt-4 pt-4">
                <span className="text-xs font-bold text-gray-400">예상 정비 총액</span>
                <span className="text-lg font-black text-gray-300">93~153만원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 공정한 경매 ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">FAIR AUCTION</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">전국 딜러가 경쟁하고, 판매자가 결정합니다</h2>
            <p className="text-gray-400 text-sm">카비어가 싸게 사서 비싸게 파는 게 아니라, 정보와 연결을 제공합니다.</p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-3">
            {AUCTION_FLOW.map((s, i) => (
              <div key={s.title} className="flex items-center gap-3">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 w-full md:w-40 text-center">
                  <span className="text-2xl mb-2 block">{s.icon}</span>
                  <h3 className="font-black text-gray-900 text-xs mb-1.5 whitespace-pre-line">{s.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed whitespace-pre-line">{s.desc}</p>
                </div>
                {i < AUCTION_FLOW.length - 1 && (
                  <span className="hidden md:block text-gray-300 text-xl shrink-0">→</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-center mt-12">
            <Link href="/inspection"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors">
              검차 신청부터 시작하기
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </p>
        </div>
      </section>

      {/* ── 딜러 보호 ── */}
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
                좋은 딜러도<br />보호합니다.
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
                정확한 정보가 좋은 딜러를 보호합니다.
              </p>
              <ul className="space-y-2 mb-2">
                {DEALER_PROTECTIONS.map(p => (
                  <li key={p} className="flex items-center gap-2 text-zinc-300 text-sm">
                    <span className="text-purple-400">✓</span>{p}
                  </li>
                ))}
              </ul>
              <p className="text-purple-300 font-bold text-sm mt-6">
                클레임을 많이 한다고 불이익 받는 플랫폼을 만들지 않겠습니다.
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

      {/* ── 뭘 하고 싶으세요? ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-black text-gray-900 mb-2">무엇을 도와드릴까요?</h2>
          <p className="text-gray-400 text-sm mb-10">원하는 서비스를 선택하면 바로 시작할 수 있어요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <Link href="/auction"
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-7 hover:border-violet-400 hover:bg-violet-50 transition-colors duration-200">
              <div className="absolute bottom-0 right-0 text-[100px] leading-none opacity-10 select-none group-hover:opacity-20 transition-opacity">🔨</div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">DEALER</p>
              <h3 className="text-xl font-black text-gray-900 mb-2">딜러 · 바이어예요</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                진단 완료 차량에 직접 가격 제안.<br />빠른 매입, 대량 거래도 OK.
              </p>
              <span className="inline-flex items-center gap-1 text-gray-500 group-hover:text-violet-600 font-bold text-sm transition-colors">
                스마트옥션 가기
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 마무리 CTA ── */}
      <section className="bg-violet-600 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-violet-200 text-sm font-bold mb-10">
            CARVIOR — 차를 거래하기 전에, 정보를 먼저 거래합니다.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
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
              <Link href="/inspection"
                className="border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors text-center">
                검차 신청하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
