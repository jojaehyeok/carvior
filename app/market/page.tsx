'use client';

// 개인 직거래 매물 목록 — 개인이 올린 정찰제 매물을 누구나 볼 수 있는 화면.
// 딜러 경매(/auction/market)와는 완전히 다른 목록이다. 거기는 딜러만 들어갈 수 있고
// 입찰로 가격이 정해지지만, 여기는 판매자가 적어둔 가격 하나로 거래한다.
//
// 중개는 무료다. 카비어가 돈을 받는 건 검차뿐이라, 리포트가 붙은 매물을 위로 올려서
// "검차를 받으면 더 잘 팔린다"가 눈에 보이게 한다.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

const CATEGORIES = ['전체', 'SUV', '세단', '해치백', '경차', '소형차', '중형', '대형', 'RV'];

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
}

const fmtPrice = (n: number | null) => {
  if (!n) return '가격 문의';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  return `${Math.round(n / 10_000).toLocaleString()}만원`;
};

function ListingCard({ item }: { item: Listing }) {
  const photo = item.photos?.exterior?.[0];
  const hasReport = !!item.hasReport;

  return (
    <Link
      href={`/market/${item.id}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-violet-300 hover:shadow-lg transition-all"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={item.titleKo} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">사진 준비 중</div>
        )}
        {hasReport && (
          <span className="absolute top-3 left-3 bg-violet-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow">
            🔍 진단 리포트
          </span>
        )}
        {!item.accident && (
          <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
            무사고
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-base font-black text-gray-900 truncate">{item.titleKo}</p>
        {item.trim && <p className="text-xs text-gray-400 truncate mt-0.5">{item.trim}</p>}
        <p className="text-xs text-gray-500 mt-2">
          {item.year}년 · {item.mileage?.toLocaleString()}km{item.fuel ? ` · ${item.fuel}` : ''}
        </p>
        <p className="mt-3 text-xl font-black text-violet-700">{fmtPrice(item.askingPrice)}</p>
        {item.region && <p className="mt-1 text-xs text-gray-400">{item.region}</p>}
      </div>
    </Link>
  );
}

export default function MarketPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [reportOnly, setReportOnly] = useState(false);

  useEffect(() => {
    fetch(`${API}/public/personal-listings`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    return items.filter((it) => {
      if (category !== '전체' && it.category !== category) return false;
      if (reportOnly && !it.hasReport) return false;
      if (text && !`${it.titleKo} ${it.trim ?? ''}`.toLowerCase().includes(text)) return false;
      return true;
    });
  }, [items, category, keyword, reportOnly]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-xs font-black tracking-[0.2em] text-violet-600 uppercase mb-2">직거래</p>
          <h1 className="text-3xl font-black text-gray-900">개인 직거래 매물</h1>
          <p className="text-sm text-gray-500 mt-2">
            개인이 직접 올린 차량입니다. <strong className="font-bold text-gray-700">중개 수수료는 없습니다.</strong>
            {' '}마음에 드는 차는 판매자에게 바로 문의하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="차종으로 검색 (예: 그랜저, 카니발)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 px-2 cursor-pointer select-none">
              <input type="checkbox" checked={reportOnly} onChange={(e) => setReportOnly(e.target.checked)} />
              진단 리포트 있는 차만
            </label>
          </div>

          <div className="flex gap-2 flex-wrap mt-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors',
                  category === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 목록 */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <p className="py-24 text-center text-sm text-gray-400">매물을 불러오는 중입니다…</p>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-gray-400 mb-6">조건에 맞는 매물이 아직 없습니다.</p>
            <Link
              href="/sell/register"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
            >
              내 차 무료로 등록하기
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              전체 <strong className="font-black text-gray-900">{filtered.length}</strong>대
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 내 차 팔기 유도 */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black text-gray-900">내 차도 팔아보세요</h2>
            <p className="text-sm text-gray-500 mt-1.5">
              등록비·중개 수수료 없이 무료입니다. 카비어 검토 후 매물로 올라갑니다.
            </p>
          </div>
          <Link
            href="/sell/register"
            className="shrink-0 bg-gray-900 hover:bg-gray-800 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors"
          >
            무료로 등록하기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
