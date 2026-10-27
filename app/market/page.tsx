'use client';

// 개인 직거래 매물 목록 — 개인이 올린 정찰제 매물을 누구나 보는 화면.
// 딜러 경매(/auction/market)와는 완전히 다른 목록이다. 거기는 딜러만 들어가고 입찰로
// 가격이 정해지지만, 여기는 판매자가 적어둔 가격 하나로 거래한다.
//
// 중개는 무료고 카비어가 돈을 받는 건 검차뿐이라, 리포트가 붙은 매물을 위로 올려
// "평가사를 부르면 더 잘 팔린다"가 눈에 보이게 한다.
//
// ⚠ 샘플 매물(SAMPLE_LISTINGS): 실제 매물이 적을 때 화면이 비어 보이지 않게 뒤에 붙인다.
// 반드시 "샘플" 배지를 달고 상세로 못 들어가게 둘 것 — 진짜 매물처럼 보이면 그게 허위매물이다.
// 실제 매물이 SAMPLE_UNTIL(8대)을 넘으면 샘플은 저절로 사라진다.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SideRail from '@/components/SideRail';
import { clsx } from 'clsx';
import HeartButton from '@/components/HeartButton';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

const CATEGORIES = ['전체', '경차', '소형차', '중형', '대형', 'SUV', 'RV', '세단', '해치백'];
const FUELS = ['전체', '가솔린', '디젤', 'LPG', '하이브리드', '전기'];
const PRICE_BANDS = [
  { label: '전체', min: 0, max: Infinity },
  { label: '1천만원 이하', min: 0, max: 10_000_000 },
  { label: '1~2천만원', min: 10_000_000, max: 20_000_000 },
  { label: '2~3천만원', min: 20_000_000, max: 30_000_000 },
  { label: '3~5천만원', min: 30_000_000, max: 50_000_000 },
  { label: '5천만원 이상', min: 50_000_000, max: Infinity },
];
const MILEAGE_BANDS = [
  { label: '전체', max: Infinity },
  { label: '3만km 이하', max: 30_000 },
  { label: '6만km 이하', max: 60_000 },
  { label: '10만km 이하', max: 100_000 },
];
const SORTS = ['최근등록순', '낮은가격순', '높은가격순', '주행거리순'] as const;

const SAMPLE_UNTIL = 8;

interface Listing {
  id: number;
  titleKo: string;
  trim?: string;
  year: number;
  mileage: number;
  fuel?: string;
  accident: boolean;
  askingPrice: number | null;
  category?: string;
  region?: string;
  photos?: { exterior?: string[] };
  hasReport?: boolean | number;
  carHash?: string | null;
  registeredAt?: string;
  isSample?: boolean;
}

const SAMPLE_LISTINGS: Listing[] = [
  { id: -1, titleKo: '현대 그랜저 IG', trim: '2.5 GDi 프리미엄', year: 2020, mileage: 52_000, fuel: '가솔린', accident: false, askingPrice: 24_900_000, category: '대형', region: '경기', hasReport: true, isSample: true },
  { id: -2, titleKo: '기아 쏘렌토 MQ4', trim: '2.2 디젤 시그니처', year: 2021, mileage: 38_000, fuel: '디젤', accident: false, askingPrice: 31_500_000, category: 'SUV', region: '서울', hasReport: true, isSample: true },
  { id: -3, titleKo: '현대 아반떼 CN7', trim: '1.6 모던', year: 2022, mileage: 21_000, fuel: '가솔린', accident: false, askingPrice: 18_700_000, category: '중형', region: '인천', hasReport: false, isSample: true },
  { id: -4, titleKo: '기아 카니발 4세대', trim: '2.2 디젤 프레스티지', year: 2022, mileage: 28_000, fuel: '디젤', accident: false, askingPrice: 38_900_000, category: 'RV', region: '경기', hasReport: true, isSample: true },
  { id: -5, titleKo: '제네시스 G80', trim: '2.5T AWD', year: 2021, mileage: 44_000, fuel: '가솔린', accident: false, askingPrice: 42_500_000, category: '대형', region: '서울', hasReport: false, isSample: true },
  { id: -6, titleKo: '현대 투싼 NX4', trim: '1.6T 하이브리드', year: 2023, mileage: 15_000, fuel: '하이브리드', accident: false, askingPrice: 32_400_000, category: 'SUV', region: '부산', hasReport: true, isSample: true },
  { id: -7, titleKo: '기아 레이', trim: '1.0 가솔린', year: 2021, mileage: 33_000, fuel: '가솔린', accident: false, askingPrice: 11_800_000, category: '경차', region: '대전', hasReport: false, isSample: true },
  { id: -8, titleKo: '쉐보레 트레일블레이저', trim: '1.35T AWD', year: 2022, mileage: 41_000, fuel: '가솔린', accident: true, askingPrice: 19_900_000, category: 'SUV', region: '광주', hasReport: true, isSample: true },
];

const fmtPrice = (n: number | null) => {
  if (!n) return '가격 문의';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  return `${Math.round(n / 10_000).toLocaleString()}만원`;
};

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-4">
      <p className="text-xs font-black text-slate-800 mb-3">{title}</p>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={clsx(
            'px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors',
            value === o
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-white border-slate-200 text-slate-500 hover:border-violet-200',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function ListingRow({ item }: { item: Listing }) {
  const photo = item.photos?.exterior?.[0];

  const body = (
    <div
      className={clsx(
        'flex gap-4 p-4 bg-white border rounded-2xl transition-all',
        item.isSample ? 'border-slate-100 opacity-70' : 'border-slate-200 hover:border-violet-300 hover:shadow-sm',
      )}
    >
      <div className="relative w-32 h-24 sm:w-44 sm:h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={item.titleKo} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">사진 준비 중</div>
        )}
        {item.isSample && (
          <span className="absolute top-2 left-2 bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded">
            샘플
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-black text-slate-900 truncate">{item.titleKo}</p>
            {item.trim && <p className="text-xs text-slate-400 truncate mt-0.5">{item.trim}</p>}
          </div>
          {!item.isSample && (
            <HeartButton
              car={{ id: item.id, title: item.titleKo, photo: photo ?? null, price: item.askingPrice }}
              size="sm"
              className="shrink-0"
            />
          )}
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {item.year}년 · {item.mileage?.toLocaleString()}km{item.fuel ? ` · ${item.fuel}` : ''}
          {item.region ? ` · ${item.region}` : ''}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {!!item.hasReport && (
            <span className="text-[10px] font-black text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              🔍 진단 리포트
            </span>
          )}
          <span
            className={clsx(
              'text-[10px] font-bold px-2 py-0.5 rounded-full border',
              item.accident ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-slate-500 bg-slate-50 border-slate-100',
            )}
          >
            {item.accident ? '사고 이력' : '무사고'}
          </span>
        </div>

        <p className="mt-3 text-lg sm:text-xl font-black text-violet-700">{fmtPrice(item.askingPrice)}</p>
      </div>
    </div>
  );

  // 샘플은 들어갈 상세가 없다 — 링크로 감싸지 않는다
  return item.isSample ? <div>{body}</div> : <Link href={`/market/${item.id}`}>{body}</Link>;
}

export default function MarketPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('전체');
  const [fuel, setFuel] = useState('전체');
  const [priceBand, setPriceBand] = useState('전체');
  const [mileageBand, setMileageBand] = useState('전체');
  const [yearFrom, setYearFrom] = useState('');
  const [reportOnly, setReportOnly] = useState(false);
  const [noAccidentOnly, setNoAccidentOnly] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]>('최근등록순');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/public/personal-listings`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const resetFilters = () => {
    setKeyword('');
    setCategory('전체');
    setFuel('전체');
    setPriceBand('전체');
    setMileageBand('전체');
    setYearFrom('');
    setReportOnly(false);
    setNoAccidentOnly(false);
  };

  // 실제 매물이 적을 때만 샘플을 뒤에 붙여 화면을 채운다
  const withSamples = useMemo(() => {
    if (items.length >= SAMPLE_UNTIL) return items;
    return [...items, ...SAMPLE_LISTINGS.slice(0, SAMPLE_UNTIL - items.length)];
  }, [items]);

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    const band = PRICE_BANDS.find((b) => b.label === priceBand)!;
    const mile = MILEAGE_BANDS.find((b) => b.label === mileageBand)!;

    const list = withSamples.filter((it) => {
      if (category !== '전체' && it.category !== category) return false;
      if (fuel !== '전체' && it.fuel !== fuel) return false;
      if (reportOnly && !it.hasReport) return false;
      if (noAccidentOnly && it.accident) return false;
      if (yearFrom && it.year < Number(yearFrom)) return false;
      if (it.mileage > mile.max) return false;
      const price = it.askingPrice ?? 0;
      if (price < band.min || price > band.max) return false;
      if (text && !`${it.titleKo} ${it.trim ?? ''}`.toLowerCase().includes(text)) return false;
      return true;
    });

    const sorted = [...list].sort((a, b) => {
      if (sort === '낮은가격순') return (a.askingPrice ?? 0) - (b.askingPrice ?? 0);
      if (sort === '높은가격순') return (b.askingPrice ?? 0) - (a.askingPrice ?? 0);
      if (sort === '주행거리순') return (a.mileage ?? 0) - (b.mileage ?? 0);
      return String(b.registeredAt ?? '').localeCompare(String(a.registeredAt ?? ''));
    });
    // 샘플은 항상 뒤로
    return sorted.sort((a, b) => Number(!!a.isSample) - Number(!!b.isSample));
  }, [withSamples, keyword, category, fuel, priceBand, mileageBand, yearFrom, reportOnly, noAccidentOnly, sort]);

  const filterPanel = (
    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-2">
      <div className="flex items-center justify-between py-3 border-b border-slate-100">
        <p className="text-sm font-black text-slate-900">스마트 필터</p>
        <button onClick={resetFilters} className="text-[11px] font-bold text-slate-400 hover:text-violet-600">
          ↺ 초기화
        </button>
      </div>

      <FilterGroup title="차종">
        <Chips options={CATEGORIES} value={category} onChange={setCategory} />
      </FilterGroup>
      <FilterGroup title="금액">
        <Chips options={PRICE_BANDS.map((b) => b.label)} value={priceBand} onChange={setPriceBand} />
      </FilterGroup>
      <FilterGroup title="연료">
        <Chips options={FUELS} value={fuel} onChange={setFuel} />
      </FilterGroup>
      <FilterGroup title="주행거리">
        <Chips options={MILEAGE_BANDS.map((b) => b.label)} value={mileageBand} onChange={setMileageBand} />
      </FilterGroup>
      <FilterGroup title="연식">
        <select
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500 bg-white"
        >
          <option value="">전체</option>
          {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>{y}년 이후</option>
          ))}
        </select>
      </FilterGroup>
      <div className="py-4 space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
          <input type="checkbox" checked={reportOnly} onChange={(e) => setReportOnly(e.target.checked)} />
          진단 리포트 있는 차만
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
          <input type="checkbox" checked={noAccidentOnly} onChange={(e) => setNoAccidentOnly(e.target.checked)} />
          무사고만
        </label>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">내 차 사기</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            개인이 직접 올린 매물입니다. <strong className="font-bold text-slate-700">중개 수수료는 없습니다.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6 items-start">
          {/* 필터 — 모바일에선 접어둔다 */}
          <div className="lg:sticky lg:top-24">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="lg:hidden w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 mb-3"
            >
              {filterOpen ? '필터 닫기 ▲' : '필터 열기 ▼'}
            </button>
            <div className={filterOpen ? 'block' : 'hidden lg:block'}>{filterPanel}</div>
          </div>

          <div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예) 그랜저 / 카니발 / 아반떼"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 bg-white"
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              전체 <strong className="font-black text-slate-900">{filtered.filter((f) => !f.isSample).length}</strong>대
              {items.length < SAMPLE_UNTIL && (
                <span className="ml-2 text-xs text-slate-400">
                  · <b>샘플</b> 표시는 화면 예시이며 실제 매물이 아닙니다
                </span>
              )}
            </p>

            {loading ? (
              <p className="py-24 text-center text-sm text-slate-400">매물을 불러오는 중입니다…</p>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-20 text-center">
                <p className="text-sm text-slate-500 mb-6">조건에 맞는 매물이 없습니다.</p>
                <button onClick={resetFilters} className="text-sm font-bold text-violet-600 hover:underline">
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <ListingRow key={item.id} item={item} />
                ))}
              </div>
            )}

            <div className="bg-white border border-violet-100 rounded-2xl mt-6 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-black text-slate-900">내 차도 팔아보세요</p>
                <p className="text-sm text-slate-500 mt-1">등록비·중개 수수료 없이 무료입니다.</p>
              </div>
              <Link
                href="/sell/register"
                className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
              >
                무료로 등록하기 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SideRail />
    </main>
  );
}
