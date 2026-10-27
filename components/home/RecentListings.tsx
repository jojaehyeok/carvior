'use client';

// 홈 "최근 올라온 차량" — 개인 직거래 매물을 바로 보여준다.
// 들어오자마자 실제 매물이 보여야 거래 사이트처럼 느껴지고, 리포트 뱃지가 붙은 차가
// 섞여 있어야 "검차를 받으면 이렇게 보이는구나"가 전달된다.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

const TABS = ['전체', '세단', 'SUV', 'RV', '경차'] as const;

interface Listing {
  id: number;
  titleKo: string;
  trim?: string;
  year: number;
  mileage: number;
  fuel?: string;
  askingPrice: number | null;
  category?: string;
  region?: string;
  photos?: { exterior?: string[] };
  hasReport?: boolean | number;
}

const fmtPrice = (n: number | null) => {
  if (!n) return '가격 문의';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  return `${Math.round(n / 10_000).toLocaleString()}만원`;
};

export default function RecentListings() {
  const [items, setItems] = useState<Listing[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/public/personal-listings`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    const filtered = tab === '전체' ? items : items.filter((i) => i.category === tab);
    return filtered.slice(0, 8);
  }, [items, tab]);

  // 매물이 한 대도 없으면 빈 그리드를 보여주느니 등록을 권하는 쪽이 낫다
  if (!loading && items.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-gray-900 mb-3">최근 올라온 차량</h2>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl py-16 text-center">
          <p className="text-sm text-gray-500 mb-6">아직 등록된 직거래 매물이 없습니다. 첫 번째로 올려보세요.</p>
          <Link
            href="/sell/register"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors"
          >
            내 차 무료로 등록하기 →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900">최근 올라온 차량</h2>
          <p className="text-sm text-gray-500 mt-1.5">개인이 직접 올린 매물입니다. 중개 수수료 없이 거래하세요.</p>
        </div>
        <Link href="/market" className="shrink-0 text-sm font-bold text-violet-600 hover:underline">
          전체 보기 →
        </Link>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors',
              tab === t ? 'text-violet-600 border-violet-600' : 'text-gray-400 border-transparent hover:text-gray-600',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-gray-400">매물을 불러오는 중입니다…</p>
      ) : shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">이 분류에는 아직 매물이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {shown.map((item) => (
            <Link
              key={item.id}
              href={`/market/${item.id}`}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-violet-300 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {item.photos?.exterior?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photos.exterior[0]} alt={item.titleKo} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">사진 준비 중</div>
                )}
                {!!item.hasReport && (
                  <span className="absolute top-2.5 left-2.5 bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    🔍 진단 리포트
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-black text-gray-900 truncate">{item.titleKo}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.year}년 · {item.mileage?.toLocaleString()}km
                </p>
                <p className="mt-2.5 text-lg font-black text-violet-700">{fmtPrice(item.askingPrice)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
