'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import AppFooter from '@/components/footermodal';

const CAR_TYPES = [
  { label: '전체',    icon: 'all' },
  { label: '경차',    icon: 'mini' },
  { label: '소형차',  icon: 'compact' },
  { label: '준중형차', icon: 'subcompact' },
  { label: '중형차',  icon: 'midsize' },
  { label: '대형차',  icon: 'fullsize' },
  { label: 'SUV',   icon: 'suv' },
  { label: 'RV',    icon: 'rv' },
];

function CarIcon({ type }: { type: string }) {
  const sw = '1.8';
  const shared = { fill: 'none' as const, stroke: 'currentColor', strokeWidth: sw };
  const nodes: Record<string, React.ReactNode> = {
    all:        <><rect x="4" y="10" width="40" height="13" rx="3" {...shared}/><path d="M10 10L14 4H34L38 10" {...shared}/><circle cx="13" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="35" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
    mini:       <><rect x="6" y="11" width="32" height="12" rx="3" {...shared}/><path d="M12 11L16 5H28L32 11" {...shared}/><circle cx="13" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="31" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
    compact:    <><rect x="3" y="11" width="42" height="12" rx="3" {...shared}/><path d="M9 11L15 5H33L39 11" {...shared}/><circle cx="12" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="36" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
    subcompact: <><rect x="3" y="11" width="44" height="12" rx="2.5" {...shared}/><path d="M8 11L13 5H37L42 11" {...shared}/><circle cx="13" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="37" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
    midsize:    <><rect x="3" y="11" width="46" height="12" rx="2.5" {...shared}/><path d="M8 11L13 5H39L44 11" {...shared}/><circle cx="13" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="39" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
    fullsize:   <><rect x="2" y="11" width="52" height="12" rx="2.5" {...shared}/><path d="M7 11L13 5H43L49 11" {...shared}/><circle cx="13" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="43" cy="23" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
    suv:        <><rect x="3" y="9" width="48" height="15" rx="2.5" {...shared}/><path d="M8 9L11 4H43L46 9" {...shared}/><circle cx="13" cy="24" r="4.5" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="41" cy="24" r="4.5" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
    rv:         <><rect x="3" y="10" width="46" height="14" rx="2.5" {...shared}/><path d="M3 10L3 5H40L46 10" {...shared}/><circle cx="12" cy="24" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/><circle cx="40" cy="24" r="4" fill="currentColor" stroke="currentColor" strokeWidth={sw}/></>,
  };
  return (
    <svg viewBox="0 0 56 28" className="w-9 h-6">
      {nodes[type] ?? nodes['all']}
    </svg>
  );
}

const SERVICES = [
  {
    label: '내차사기',
    href: '/buy',
    desc: '검증된 매물만 엄선\n허위매물 필터링',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M21 10H3M21 10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2M21 10l-3-7H6L3 10"/>
        <circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/>
      </svg>
    ),
  },
  {
    label: '내차팔기',
    href: '/sell',
    desc: '평가사가 직접 방문\n무료 시세 산정',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: '내차시세',
    href: '/price',
    desc: '30초만에 확인\n빅데이터 기반 시세',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    label: '딜러 입찰',
    href: '/auction',
    desc: '가격 미매칭 매물\n딜러 직접 입찰',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="m14.5 12.5-8 8a2.121 2.121 0 0 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>
      </svg>
    ),
  },
];

const TRUST_STATS = [
  { value: '7,800+', label: '등록 매물' },
  { value: '87%',    label: '매칭 성공률' },
  { value: '2,400+', label: '등록 딜러' },
  { value: '4.8',    label: '이용자 평점' },
];

interface StoreItem {
  id: string;
  titleKo: string;
  year: number;
  mileage: number;
  priceKRW: number;
  region: string;
  photos: { exterior?: string[] };
  status: string;
}

export default function HomePage() {
  const [selectedType, setSelectedType] = useState('전체');
  const [priceMax, setPriceMax]         = useState(10000);
  const [previewCars, setPreviewCars]   = useState<StoreItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/store-items')
      .then(r => r.json())
      .then((items: StoreItem[]) => {
        const active = items.filter(i => i.status === 'active').slice(0, 4);
        setPreviewCars(active);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── 히어로 ── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-gray-500 bg-gray-200 px-3 py-1 rounded-full mb-6">
              카비어 중고차 수출 플랫폼
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6">
              검증된 한국 중고차,<br />
              <span className="text-gray-400">전 세계로.</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg mb-10 leading-relaxed">
              공인 평가사가 직접 확인한 매물만 올립니다.<br />
              허위매물 없이, 가격도 투명하게.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link href="/buy" className="bg-violet-600 text-white font-black px-7 py-3.5 rounded-xl text-sm hover:bg-violet-700 transition-colors">
                매물 보러가기
              </Link>
              <Link href="/price" className="border border-gray-300 text-gray-700 font-bold px-7 py-3.5 rounded-xl text-sm hover:border-violet-500 hover:text-violet-600 transition-colors">
                내 차 시세 보기
              </Link>
            </div>
          </div>

          <div className="shrink-0 w-full max-w-sm lg:max-w-md xl:max-w-lg">
            <svg viewBox="0 0 500 280" fill="none" className="w-full drop-shadow-sm">
              <ellipse cx="250" cy="262" rx="180" ry="10" fill="#e5e7eb"/>
              <rect x="40" y="140" width="420" height="100" rx="20" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5"/>
              <path d="M110 140 L155 75 H345 L390 140Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5"/>
              <path d="M165 80 L155 130 H235 V80Z" fill="#e5e7eb" opacity="0.6"/>
              <path d="M245 80 H345 L335 130 H245V80Z" fill="#e5e7eb" opacity="0.6"/>
              <line x1="240" y1="130" x2="240" y2="195" stroke="#d1d5db" strokeWidth="1.5"/>
              <circle cx="130" cy="220" r="44" fill="#1f2937"/>
              <circle cx="130" cy="220" r="30" fill="#374151"/>
              <circle cx="130" cy="220" r="14" fill="#9ca3af"/>
              <circle cx="130" cy="220" r="5"  fill="#1f2937"/>
              <circle cx="370" cy="220" r="44" fill="#1f2937"/>
              <circle cx="370" cy="220" r="30" fill="#374151"/>
              <circle cx="370" cy="220" r="14" fill="#9ca3af"/>
              <circle cx="370" cy="220" r="5"  fill="#1f2937"/>
              <path d="M430 155 H455 L460 175 H430Z" fill="#fbbf24" opacity="0.9"/>
              <path d="M40 155 H60 V175 H38Z" fill="#d1d5db"/>
              <rect x="432" y="178" width="28" height="18" rx="4" fill="#d1d5db"/>
              <rect x="210" y="200" width="80" height="22" rx="4" fill="#e5e7eb"/>
            </svg>
          </div>
        </div>

        {/* 통계 */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 서비스 ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">서비스</p>
        <h2 className="text-3xl font-black text-gray-900 mb-12">카비어가 제공하는<br />모든 것</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="group border border-gray-200 rounded-2xl p-6 hover:border-violet-500 hover:shadow-[0_0_0_1px_theme(colors.violet.500)] bg-white transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-violet-600 flex items-center justify-center mb-5 transition-colors text-gray-500 group-hover:text-white">
                {s.icon}
              </div>
              <p className="font-black text-gray-900 text-base mb-1.5">{s.label}</p>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{s.desc}</p>
              <div className="mt-5 flex items-center gap-1 text-[12px] font-bold text-gray-300 group-hover:text-violet-600 transition-colors">
                바로가기
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 차량 검색 + 팔기 ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* 내차사기 */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">내차사기</p>
              <h2 className="text-2xl font-black text-gray-900 mb-8">어떤 차를 찾고 계세요?</h2>

              <div className="mb-8">
                <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">차종</p>
                <div className="flex flex-wrap gap-2">
                  {CAR_TYPES.map(t => (
                    <button
                      key={t.label}
                      onClick={() => setSelectedType(t.label)}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all',
                        selectedType === t.label
                          ? 'border-violet-600 bg-violet-600 text-white'
                          : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600 bg-white'
                      )}
                    >
                      <span className={selectedType === t.label ? 'text-white' : 'text-gray-400'}>
                        <CarIcon type={t.icon} />
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">예산</p>
                  <p className="text-xs font-black text-gray-900">
                    {priceMax >= 10000 ? '제한 없음' : `~ ${priceMax.toLocaleString()}만원`}
                  </p>
                </div>
                <input
                  type="range" min={0} max={10000} step={100}
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                  <span>0</span><span>1억원 이상</span>
                </div>
              </div>

              <Link
                href="/buy"
                className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white font-black py-4 rounded-xl text-sm hover:bg-violet-700 transition-colors"
              >
                매물 검색하기
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            {/* 내차팔기 */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">내차팔기</p>
              <h2 className="text-2xl font-black text-gray-900 mb-8">내 차를 팔고 싶어요</h2>

              <div className="space-y-3">
                {[
                  { title: '카비어 방문 평가', desc: '평가사가 직접 찾아가 한 번에 진행합니다.', href: '/sell', tag: '무료' },
                  { title: '내 차 시세 먼저 확인', desc: '30초만에 내 차 시세를 빅데이터로 확인하세요.', href: '/price', tag: '빠름' },
                  { title: '딜러 입찰 받기', desc: '가격 협상 실패? 딜러에게 직접 입찰받으세요.', href: '/auction', tag: '신규' },
                ].map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="group flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white hover:border-violet-500 hover:shadow-[0_0_0_1px_theme(colors.violet.500)] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-gray-900">{item.title}</p>
                        <span className="text-[9px] font-black text-white bg-violet-600 px-1.5 py-0.5 rounded-full">{item.tag}</span>
                      </div>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                      className="text-gray-300 group-hover:text-violet-600 shrink-0 ml-4 transition-colors">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 최신 매물 ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-2">최신 매물</p>
            <h2 className="text-3xl font-black text-gray-900">방금 올라온 차량</h2>
          </div>
          <Link href="/buy" className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
            전체보기
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewCars.map(car => {
            const thumb = car.photos?.exterior?.[0];
            const priceMan = Math.round(car.priceKRW / 10000);
            return (
              <Link key={car.id} href={`/buy/${car.id}`} className="group">
                <div className="relative aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden mb-3 flex items-center justify-center border border-gray-100 group-hover:border-gray-400 transition-colors">
                  {thumb ? (
                    <Image src={thumb} alt={car.titleKo} fill className="object-cover" sizes="300px" />
                  ) : (
                    <svg viewBox="0 0 120 70" fill="none" className="w-24 h-14 text-gray-200">
                      <rect x="5" y="22" width="110" height="36" rx="7" fill="currentColor"/>
                      <path d="M15 22L27 8H93L105 22Z" fill="currentColor"/>
                      <circle cx="28" cy="58" r="11" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
                      <circle cx="92" cy="58" r="11" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
                    </svg>
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide">
                    진단완료
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{car.year}년 · {car.region}</p>
                  <p className="font-bold text-gray-900 text-sm truncate mb-0.5">{car.titleKo}</p>
                  <p className="text-[11px] text-gray-400 mb-2">{car.mileage.toLocaleString()} km</p>
                  <p className="font-black text-gray-900 text-base">
                    {priceMan.toLocaleString()}<span className="text-xs font-bold text-gray-400 ml-0.5">만원</span>
                    <span className="text-xs font-bold text-gray-400 ml-2">${Math.round(car.priceKRW / 1350).toLocaleString()}</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 딜러 입찰 CTA (포인트 검정) ── */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/40 mb-3">NEW</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-2">
              가격 협상 실패한 매물?<br />딜러 입찰 마켓에 올리세요.
            </h2>
            <p className="text-white/50 text-sm">다른 플랫폼에서 안 팔린 차, 카비어 딜러들이 직접 입찰합니다.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/auction/register" className="bg-white text-black font-black px-7 py-3.5 rounded-xl text-sm hover:bg-gray-100 transition-colors text-center">
              내 차 등록하기
            </Link>
            <Link href="/auction" className="border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors text-center">
              입찰 현황 보기
            </Link>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
