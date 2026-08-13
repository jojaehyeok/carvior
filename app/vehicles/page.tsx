'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuctionItem, fmtKRW } from '@/components/auction/shared';

// 카비어 진단리포트 유무를 눈으로 비교시켜주는 고정 예시 매물(상태와 무관하게 항상 노출)
const PINNED_EXAMPLE_ID = '13';

// 누구나(로그인/딜러승인 없이) 볼 수 있는 공개 매물 갤러리 — 히어로 "검차 차량 보기" CTA 대상.
// 딜러 전용 스마트옥션(/auction/market)과 달리 입찰 기능은 없고 진단 리포트 열람만 가능하다.
export default function VehiclesPage() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const KEY = process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '';
    const headers = { 'x-internal-key': KEY };

    Promise.all([
      fetch(`${API}/external/store-items`, { headers }).then(r => r.json()).catch(() => []),
      // 예시 매물은 마감(closed)돼도 active 목록에서 빠지므로 별도로 항상 가져온다
      fetch(`${API}/external/store-items/${PINNED_EXAMPLE_ID}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([list, pinned]) => {
      const base: AuctionItem[] = Array.isArray(list) ? list : [];
      const merged = pinned && !base.some(i => String(i.id) === String(pinned.id)) ? [...base, pinned] : base;
      setItems(merged);
    }).finally(() => setLoading(false));
  }, []);

  const openCarReportPopup = (hash: string) => {
    const w = Math.round(window.screen.availWidth / 3);
    const h = window.screen.availHeight;
    window.open(`/car-report/${hash}`, 'car-report', `width=${w},height=${h},left=0,top=0,scrollbars=yes,resizable=yes`);
  };

  const inspected = items.filter(i => i.hasReport && i.carHash);
  const personal = items.filter(i => !(i.hasReport && i.carHash));

  function Card({ item }: { item: AuctionItem }) {
    const thumb = item.photos?.exterior?.[0];
    return (
      <div className="rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">
        <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative">
          {thumb ? (
            <img src={thumb} alt={item.titleKo ?? item.carNumber} className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 500 280" fill="none" className="w-4/5 opacity-10">
              <rect x="40" y="140" width="420" height="100" rx="20" fill="#000" />
              <path d="M110 140 L155 75 H345 L390 140Z" fill="#000" />
              <circle cx="130" cy="220" r="40" fill="#333" />
              <circle cx="370" cy="220" r="40" fill="#333" />
            </svg>
          )}
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full text-white ${item.hasReport ? 'bg-black/70' : 'bg-gray-500/80'}`}>
            {item.hasReport ? '진단완료' : '개인매물'}
          </span>
        </div>
        <div className="p-4">
          <p className="font-bold text-gray-900 line-clamp-1 mb-1">{item.titleKo ?? '차종 미상'}</p>
          <p className="text-xs text-gray-400 mb-3">
            {item.carNumber} · {item.region?.split(' ')[0] ?? '지역 미상'} · {item.mileage ? `${item.mileage.toLocaleString()}km` : '주행거리 미상'}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-300 mb-0.5">희망 판매가</p>
              <span className="font-black text-gray-900">{fmtKRW(item.priceKRW)}</span>
            </div>
            {item.hasReport && item.carHash ? (
              <button
                onClick={() => openCarReportPopup(item.carHash!)}
                className="text-xs font-bold text-violet-600 underline hover:text-violet-700"
              >
                리포트 보기 →
              </button>
            ) : (
              <span className="text-xs text-gray-300">리포트 없음</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">INSPECTED VEHICLES</p>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">진단완료 매물과 개인매물, 무엇이 다를까요?</h1>
        <p className="text-gray-400 text-sm">같은 중고차라도 카비어 진단 리포트가 있으면 상태를 근거로 확인할 수 있어요.</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🚗</p>
            <p className="font-semibold">아직 등록된 매물이 없습니다.</p>
            <p className="text-sm mt-1">검차가 완료되면 이곳에 자동으로 나타나요.</p>
          </div>
        ) : (
          <>
            {inspected.length > 0 && (
              <div className="mb-14">
                <h2 className="text-lg font-black text-gray-900 mb-1">✦ 진단완료 매물</h2>
                <p className="text-xs text-gray-400 mb-5">카비어 평가사가 직접 확인하고 리포트를 남긴 매물이에요.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {inspected.map(item => <Card key={item.id} item={item} />)}
                </div>
              </div>
            )}
            {personal.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-gray-400 mb-1">개인매물</h2>
                <p className="text-xs text-gray-400 mb-5">차주가 직접 등록한 매물이에요. 진단 리포트가 없어 상태를 확인하기 어려워요.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {personal.map(item => <Card key={item.id} item={item} />)}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-14">
          <p className="text-gray-400 text-sm mb-4">이런 검차 완료 매물, 내 차도 만들 수 있어요.</p>
          <Link href="/inspection" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors">
            내 차 진단하기
          </Link>
        </div>
      </section>
    </div>
  );
}
