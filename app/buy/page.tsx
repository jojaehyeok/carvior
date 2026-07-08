'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { clsx } from 'clsx';

const CAR_TYPES = ['전체', 'SUV', '세단', '해치백', '경차', '소형차', '중형', '대형', 'RV'];

const USD_RATE = 1350;

interface StoreItem {
  id: string;
  bookingId: number;
  titleKo: string;
  titleEn: string;
  trim: string;
  year: number;
  mileage: number;
  fuel: string;
  accident: boolean;
  priceKRW: number;
  priceUSD?: number;
  category: string;
  region: string;
  inspectedAt: string;
  status: 'active' | 'sold' | 'hidden';
  photos: { exterior?: string[] };
  hasReport: boolean;
  carHash?: string;
}

function getUSD(item: StoreItem) {
  if (item.priceUSD && item.priceUSD > 0) return item.priceUSD;
  return item.priceKRW ? Math.round(item.priceKRW / USD_RATE) : 0;
}

// 스토어 아이템이 없을 때 보여줄 데모 차량
const DEMO_CARS: StoreItem[] = [
  { id: '1',  bookingId: 1,  titleKo: '기아 더 뉴 쏘렌토',  titleEn: 'Kia Sorento',      trim: 'Noblesse', year: 2024, mileage: 31764,  fuel: '가솔린', accident: false, priceKRW: 36_900_000, category: 'SUV',  region: '경기도', inspectedAt: '2026-05-22', status: 'active', photos: {}, hasReport: true },
  { id: '2',  bookingId: 2,  titleKo: '현대 더 뉴 아반떼',  titleEn: 'Hyundai Avante',   trim: 'Smart',    year: 2016, mileage: 93508,  fuel: '가솔린', accident: false, priceKRW:  7_800_000, category: '세단', region: '서울',   inspectedAt: '2026-05-18', status: 'active', photos: {}, hasReport: false },
  { id: '6',  bookingId: 6,  titleKo: '제네시스 G80',       titleEn: 'Genesis G80',      trim: '2.5T',     year: 2021, mileage: 44000,  fuel: '가솔린', accident: false, priceKRW: 39_900_000, category: '세단', region: '서울',   inspectedAt: '2026-05-20', status: 'active', photos: {}, hasReport: true },
  { id: '7',  bookingId: 7,  titleKo: '현대 그랜저 IG',     titleEn: 'Hyundai Grandeur', trim: '2.5 GDi',  year: 2020, mileage: 52000,  fuel: '가솔린', accident: false, priceKRW: 24_900_000, category: '세단', region: '경기도', inspectedAt: '2026-05-15', status: 'active', photos: {}, hasReport: true },
  { id: '8',  bookingId: 8,  titleKo: '기아 카니발 4세대',  titleEn: 'Kia Carnival',     trim: 'Prestige', year: 2022, mileage: 28000,  fuel: '디젤',   accident: false, priceKRW: 42_000_000, category: 'RV',   region: '인천',   inspectedAt: '2026-05-10', status: 'active', photos: {}, hasReport: true },
  { id: '9',  bookingId: 9,  titleKo: '현대 투싼 NX4',     titleEn: 'Hyundai Tucson',   trim: 'Prestige', year: 2023, mileage: 15000,  fuel: '하이브리드', accident: false, priceKRW: 34_500_000, category: 'SUV', region: '부산', inspectedAt: '2026-05-08', status: 'active', photos: {}, hasReport: true },
];

function isStaleItem(inspectedAt: string) {
  return (Date.now() - new Date(inspectedAt).getTime()) / 86400000 > 30;
}

function fmtMileage(n: number) {
  return n.toLocaleString() + ' km';
}
function fmtPrice(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  return `${Math.round(n / 10_000)}만원`;
}

function BuyCard({ car }: { car: StoreItem }) {
  const stale = isStaleItem(car.inspectedAt);
  return (
    <Link
      href={`/buy/${car.id}`}
      className={clsx(
        'group block rounded-2xl overflow-hidden border transition-all',
        stale
          ? 'border-gray-100 opacity-60 hover:shadow-md'
          : car.hasReport
            ? 'border-amber-400 ring-2 ring-amber-300/40 hover:ring-amber-400/70 hover:shadow-lg hover:shadow-amber-100'
            : 'border-gray-100 hover:border-gray-300 hover:shadow-lg'
      )}
    >
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {car.photos?.exterior?.[0] ? (
          <img src={car.photos.exterior[0]} alt={car.titleKo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 500 280" fill="none" className="w-4/5 opacity-20">
              <rect x="40" y="140" width="420" height="100" rx="20" fill="#000"/>
              <path d="M110 140 L155 75 H345 L390 140Z" fill="#000"/>
              <circle cx="130" cy="220" r="40" fill="#333"/>
              <circle cx="370" cy="220" r="40" fill="#333"/>
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {stale && (
            <span className="bg-gray-500/70 text-white text-[9px] font-bold px-2 py-1 rounded-full">오래된 매물</span>
          )}
          {car.hasReport && (
            <a
              href={car.carHash ? `/report/${car.carHash}` : '/marketing/carvior-inspection'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-0.5 bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-1 rounded-full hover:bg-amber-300 transition-colors shadow-sm"
            >
              ✦ 공인진단
            </a>
          )}
          {car.accident && (
            <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">사고</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-0.5">{car.year}년 · {car.region}</p>
        <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-1">{car.titleKo}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span>{fmtMileage(car.mileage)}</span>
          <span>·</span>
          <span>{car.fuel}</span>
        </div>
        <p className="text-lg font-black text-gray-900">
          {getUSD(car) > 0 ? `$ ${getUSD(car).toLocaleString()}` : '가격 협의'}
        </p>
        {car.priceKRW > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">{fmtPrice(car.priceKRW)}</p>
        )}
      </div>
    </Link>
  );
}

export default function BuyPage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('전체');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'mileage'>('recent');

  useEffect(() => {
    fetch('/api/admin/store-items')
      .then(r => r.json())
      .then((data: StoreItem[]) => {
        const active = data.filter(i => i.status === 'active');
        setItems(active.length > 0 ? active : DEMO_CARS);
      })
      .catch(() => setItems(DEMO_CARS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items
    .filter(i => selectedType === '전체' || i.category === selectedType)
    .filter(i => !search || i.titleKo.includes(search) || i.region?.includes(search))
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return a.priceKRW - b.priceKRW;
      if (sortBy === 'price_desc') return b.priceKRW - a.priceKRW;
      if (sortBy === 'mileage')    return a.mileage - b.mileage;
      // 최신순: 30일+ → 뒤로, 14일+ → 중간, 신규 → 앞
      const now = Date.now();
      const penalty = (d: string) => {
        const age = (now - new Date(d).getTime()) / 86400000;
        return age > 30 ? 2 : age > 14 ? 1 : 0;
      };
      const pa = penalty(a.inspectedAt), pb = penalty(b.inspectedAt);
      if (pa !== pb) return pa - pb;
      return new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime();
    });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">카비어 매물</p>
          <h1 className="text-3xl font-black text-white">공인 진단 완료 차량</h1>
          <p className="text-zinc-400 text-sm mt-1.5">허위매물 없이, 진단 완료된 차량만 올립니다.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 필터 바 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            {CAR_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={clsx(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                  selectedType === t
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 shrink-0">
            <input
              type="text"
              placeholder="차종 / 지역 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 w-40"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
            >
              <option value="recent">최신순</option>
              <option value="price_asc">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
              <option value="mileage">주행거리순</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">총 {filtered.length}대</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(car => (
              <BuyCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
