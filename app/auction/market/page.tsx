'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import AuctionAccessGate from '@/components/AuctionAccessGate';
import BidModal from '@/components/auction/BidModal';
import { AuctionItem, Bid, fmtKRW, loadBids, saveBid, timeLeftLabel } from '@/components/auction/shared';

function AuctionContent() {
  const { data: session } = useSession();
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidTarget, setBidTarget] = useState<AuctionItem | null>(null);
  const dealerName = (session?.user as any)?.name ?? '딜러';

  useEffect(() => {
    setBids(loadBids());

    fetch('/api/admin/store-items')
      .then(r => r.json())
      .then((data: AuctionItem[]) => setItems(Array.isArray(data) ? data.filter(i => ['active', 'sold', 'closed'].includes(i.status)) : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleBid = (itemId: string, amount: number) => {
    const updated = saveBid(bids, itemId, amount, dealerName);
    setBids(updated);
    alert(`✓ ${fmtKRW(amount)} 입찰 완료!\n최종 낙찰은 어드민에서 확인됩니다.`);
  };

  const getBidCount = (id: string) => bids.filter(b => b.itemId === id).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase">스마트옥션</p>
                <span className="text-[10px] font-black tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase">딜러 전용</span>
              </div>
              <h1 className="text-3xl font-black text-white">진단 완료 차량 경매</h1>
              <p className="text-zinc-400 text-sm mt-1.5">카비어 진단이 완료된 차량을 경매로 직접 낙찰받으세요.</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300 text-sm font-semibold">{dealerName}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: '경매 진행중', value: loading ? '…' : String(items.filter(i => i.status === 'active').length) },
              { label: '내 입찰 건수', value: String(new Set(bids.map(b => b.itemId)).size) },
              { label: '낙찰 예정', value: '어드민 확인' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
        <p className="text-amber-700 text-xs font-semibold text-center max-w-7xl mx-auto">
          ⚡ 데모 버전 · 입찰 내역은 로컬에 저장됩니다. 실제 낙찰 처리는 카비어 어드민을 통해 확인해주세요.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🔨</p>
            <p className="font-semibold">진행 중인 경매가 없습니다.</p>
            <p className="text-sm mt-1">진단 완료 차량이 등록되면 자동으로 나타납니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => {
              const bidCount = getBidCount(item.id);
              const closed   = item.status !== 'active';
              const thumb    = item.photos?.exterior?.[0];
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border overflow-hidden ${closed ? 'opacity-60' : 'hover:border-gray-300 hover:shadow-lg'} transition-all`}
                >
                  <Link href={`/auction/market/${item.id}`} className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative block">
                    {thumb ? (
                      <img src={thumb} alt={item.titleKo ?? item.carNumber} className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 500 280" fill="none" className="w-4/5 opacity-10">
                        <rect x="40" y="140" width="420" height="100" rx="20" fill="#000"/>
                        <path d="M110 140 L155 75 H345 L390 140Z" fill="#000"/>
                        <circle cx="130" cy="220" r="40" fill="#333"/>
                        <circle cx="370" cy="220" r="40" fill="#333"/>
                      </svg>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full">진단완료</span>
                      {closed
                        ? <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">{item.status === 'sold' ? '낙찰완료' : '마감'}</span>
                        : <span className="bg-green-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">진행중</span>
                      }
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <Link href={`/auction/market/${item.id}`} className="font-bold text-gray-900 line-clamp-1 hover:underline">
                        {item.titleKo ?? '차종 미상'}
                      </Link>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {item.carNumber} · {item.region?.split(' ')[0] ?? '지역 미상'} · {item.mileage ? `${item.mileage.toLocaleString()}km` : '주행거리 미상'}
                    </p>

                    {/* 다른 딜러 입찰 현황은 금액을 공개하지 않음(경쟁입찰 원칙) — 건수/예상가만 표시 */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400">예상 낙찰가</p>
                        <p className="text-lg font-black text-gray-900">{fmtKRW(item.priceKRW)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">입찰 {bidCount}건</p>
                        <p className="text-[10px] text-gray-400">
                          {!closed && timeLeftLabel(item.auctionEndAt) ? timeLeftLabel(item.auctionEndAt) : '마감'}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={closed}
                      onClick={() => setBidTarget(item)}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-colors bg-black hover:bg-gray-800 text-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {closed ? (item.status === 'sold' ? '낙찰완료' : '경매 마감') : bidCount > 0 ? '입찰 수정' : '입찰하기'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {bidTarget && (
        <BidModal
          item={bidTarget}
          bids={bids}
          onBid={handleBid}
          onClose={() => setBidTarget(null)}
        />
      )}
    </div>
  );
}

export default function AuctionMarketPage() {
  return (
    <AuctionAccessGate>
      <AuctionContent />
    </AuctionAccessGate>
  );
}
