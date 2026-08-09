'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import AuctionAccessGate from '@/components/AuctionAccessGate';
import { fmtKRW } from '@/components/auction/shared';

// 차량판매중개 시스템(4단계) — 기존 스마트옥션(StoreItem 경매)과는 완전히 별개의 데이터모델.
// 딜러 회원/권한은 기존 딜러 승인 체계(AuctionAccessGate)를 그대로 재사용한다.
interface DealerListing {
  id: number;
  carNumber?: string;
  carModel?: string;
  mileage?: number;
  color?: string;
  askingPrice: number;
  listingStatus: string;
  biddingStartAt?: string;
  biddingEndAt?: string;
  carHash?: string;
}

function SaleListingsContent() {
  const [listings, setListings] = useState<DealerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
    fetch(`${API}/external/sale-listings`, {
      headers: { 'x-internal-key': process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '' },
    })
      .then(r => r.json())
      .then((data: DealerListing[]) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase">차량판매중개</p>
            <span className="text-[10px] font-black tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase">딜러 전용</span>
          </div>
          <h1 className="text-3xl font-black text-white">판매차량 목록</h1>
          <p className="text-zinc-400 text-sm mt-1.5">
            차주 판매동의를 받은 차량만 올라와요. 경쟁입찰 기능은 곧 오픈됩니다.
          </p>
          <div className="flex items-center gap-2 mt-5 text-xs">
            <Link href="/auction/market" className="text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-full border border-white/10">
              스마트옥션(경매)
            </Link>
            <span className="text-white px-3 py-1.5 rounded-full bg-white/10 border border-white/10 font-bold">판매차량 목록</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 animate-pulse h-56" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🚗</p>
            <p className="font-semibold">아직 등록된 판매차량이 없습니다.</p>
            <p className="text-sm mt-1">차주 판매동의가 완료되면 자동으로 나타납니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setPreviewId(l.id)}
                className="text-left rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative">
                  <svg viewBox="0 0 500 280" fill="none" className="w-4/5 opacity-10">
                    <rect x="40" y="140" width="420" height="100" rx="20" fill="#000"/>
                    <path d="M110 140 L155 75 H345 L390 140Z" fill="#000"/>
                    <circle cx="130" cy="220" r="40" fill="#333"/>
                    <circle cx="370" cy="220" r="40" fill="#333"/>
                  </svg>
                  <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full">진단완료</span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-900 line-clamp-1">{l.carModel || '차종 미상'}</p>
                  <p className="text-xs text-gray-400 mt-1 mb-3">
                    {l.carNumber} · {l.mileage ? `${l.mileage.toLocaleString()}km` : '주행거리 미상'}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">차주 희망가</p>
                    <p className="text-lg font-black text-gray-900">{fmtKRW(l.askingPrice)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 상세는 iframe으로 — /auction/sale-listings/[id] 페이지를 그대로 임베드 */}
      {previewId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <p className="text-sm font-bold text-gray-700">매물 상세</p>
              <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-black">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <iframe
              src={`/auction/sale-listings/${previewId}?embed=1`}
              className="flex-1 w-full border-0"
              title="판매차량 상세"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SaleListingsPage() {
  return (
    <AuctionAccessGate>
      <SaleListingsContent />
    </AuctionAccessGate>
  );
}
