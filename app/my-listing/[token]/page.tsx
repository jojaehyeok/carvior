'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SaleStageTimeline from '@/components/SaleStageTimeline';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface Bid {
  id: number;
  dealerName: string;
  amount: number;
  createdAt: string;
}

interface ListingItem {
  id: number;
  carNumber: string;
  titleKo: string;
  year?: number;
  mileage?: number;
  priceKRW?: number;
  status: string;
  saleStage?: string;
  auctionEndAt?: string | null;
  ownerRequestedBidId?: number | null;
  transferredRegistrationUrl?: string | null;
  photos?: Record<string, string[]>;
}

function fmtKRW(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  return `${Math.round(n / 10_000)}만원`;
}

function useCountdown(deadline?: string | null) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setText('마감됨'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setText(`${h}시간 ${m}분 남음`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [deadline]);
  return text;
}

export default function MyListingPage() {
  const params = useParams();
  const token = params?.token as string;

  const [item, setItem] = useState<ListingItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestingId, setRequestingId] = useState<number | null>(null);

  const countdown = useCountdown(item?.auctionEndAt);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/external/my-listing/${token}`)
      .then(res => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then(data => {
        setItem(data.item);
        setBids(Array.isArray(data.bids) ? data.bids : []);
      })
      .catch(() => setError('입찰현황을 찾을 수 없습니다. 링크를 다시 확인해주세요.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRequestSale = async (bidId: number) => {
    if (!item) return;
    setRequestingId(bidId);
    try {
      const res = await fetch(`${API}/external/my-listing/${token}/request-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      });
      if (!res.ok) throw new Error();
      setItem({ ...item, ownerRequestedBidId: bidId });
    } catch {
      alert('판매요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중…</div>;
  }
  if (error || !item) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 px-6 text-center">{error || '매물을 찾을 수 없습니다.'}</div>;
  }

  const thumb = item.photos ? Object.values(item.photos).flat()[0] : undefined;
  const sorted = [...bids].sort((a, b) => b.amount - a.amount);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center gap-4 px-5 py-4">
            {thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-black text-gray-900 truncate">{item.titleKo}</p>
              <p className="text-xs text-gray-400">
                {item.carNumber}
                {item.year ? ` · ${item.year}년` : ''}
                {item.mileage ? ` · ${item.mileage.toLocaleString()}km` : ''}
              </p>
              {!!item.priceKRW && (
                <p className="text-xs text-violet-600 font-bold mt-0.5">내 희망가 {fmtKRW(item.priceKRW)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-6 mb-6">
          <SaleStageTimeline
            status={item.status}
            saleStage={item.saleStage}
            auctionEndAt={item.auctionEndAt}
            transferredRegistrationUrl={item.transferredRegistrationUrl}
          />
          {item.status === 'active' && countdown && (
            <p className="text-center text-sm font-bold text-violet-600 mt-4">{countdown}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
          <p className="text-sm font-black text-gray-900 mb-3">입찰 현황 ({sorted.length}건)</p>
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">아직 입찰이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {sorted.map((bid, i) => {
                const requested = item.ownerRequestedBidId === bid.id;
                return (
                  <div key={bid.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-400">{i + 1}위</p>
                      <p className="font-black text-gray-900">{fmtKRW(bid.amount)}</p>
                    </div>
                    {item.status === 'active' ? (
                      requested ? (
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full">요청됨 · 확인중</span>
                      ) : item.ownerRequestedBidId ? (
                        <span className="text-xs text-gray-300">-</span>
                      ) : (
                        <button
                          onClick={() => handleRequestSale(bid.id)}
                          disabled={requestingId === bid.id}
                          className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {requestingId === bid.id ? '요청 중…' : '판매요청'}
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
