'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface Bid {
  id: number;
  bidderName: string;
  bidderContact?: string;
  requestedSubsidy: number;
  createdAt: string;
}

interface RentalItem {
  id: number;
  carNumber?: string;
  titleKo?: string;
  year?: number;
  mileage?: number;
  rentalCompany?: string;
  monthlyPayment?: number;
  remainingMonths?: number;
  totalMonths?: number;
  totalTakeoverCost?: number;
  maxSubsidy?: number;
  status: string;
  ownerRequestedBidId?: number | null;
}

function fmtWon(n?: number) {
  if (!n) return '-';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  return `${Math.round(n / 10_000).toLocaleString()}만원`;
}

export default function MyRentalPage() {
  const params = useParams();
  const token = params?.token as string;

  const [item, setItem] = useState<RentalItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [requestingId, setRequestingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/external/my-rental/${token}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        setItem(data.item);
        setBids(Array.isArray(data.bids) ? data.bids : []);
        setSelectedId(data.item?.ownerRequestedBidId ?? null);
      })
      .catch(() => setError('승계 현황을 찾을 수 없습니다. 링크를 다시 확인해주세요.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSelect = async (bidId: number) => {
    setRequestingId(bidId);
    try {
      const res = await fetch(`${API}/external/my-rental/${token}/request-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      });
      if (!res.ok) throw new Error();
      setSelectedId(bidId);
    } catch {
      alert('선택 요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중…</div>;
  if (error || !item) return <div className="min-h-screen flex items-center justify-center text-gray-400 px-6 text-center">{error}</div>;

  const sorted = [...bids].sort((a, b) => a.requestedSubsidy - b.requestedSubsidy);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-700 text-center">
          🚧 베타 페이지입니다
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
          <p className="font-black text-gray-900">{item.titleKo}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {item.carNumber}{item.year ? ` · ${item.year}년` : ''}{item.mileage ? ` · ${item.mileage.toLocaleString()}km` : ''}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400">렌트사</p>
              <p className="text-sm font-bold text-gray-900">{item.rentalCompany || '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400">월 납입금</p>
              <p className="text-sm font-bold text-gray-900">{fmtWon(item.monthlyPayment)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400">잔여 개월</p>
              <p className="text-sm font-bold text-gray-900">{item.remainingMonths ?? '-'}/{item.totalMonths ?? '-'}개월</p>
            </div>
            <div className="bg-violet-50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-violet-500">내가 제시한 최대 지원금</p>
              <p className="text-sm font-black text-violet-700">{fmtWon(item.maxSubsidy)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
          <p className="text-sm font-black text-gray-900 mb-1">승계 희망자 ({sorted.length}명)</p>
          <p className="text-[11px] text-gray-400 mb-3">지원금을 적게 요청할수록 나에게 유리해요</p>
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">아직 승계 희망자가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {sorted.map((bid, i) => {
                const isSelected = selectedId === bid.id;
                return (
                  <div key={bid.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-400">{i + 1}위 {i === 0 && '· 최저 요청'}</p>
                      <p className="font-black text-gray-900">{bid.bidderName} 님</p>
                      <p className="text-sm font-bold text-violet-600">지원금 {fmtWon(bid.requestedSubsidy)} 요청</p>
                    </div>
                    {item.status === 'active' ? (
                      isSelected ? (
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full">선택됨 · 확인중</span>
                      ) : selectedId ? (
                        <span className="text-xs text-gray-300">-</span>
                      ) : (
                        <button
                          onClick={() => handleSelect(bid.id)}
                          disabled={requestingId === bid.id}
                          className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {requestingId === bid.id ? '요청 중…' : '이 분으로 선택'}
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
