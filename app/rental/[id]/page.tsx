'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
const INTERNAL_KEY = process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '';
const HEADERS = { 'x-internal-key': INTERNAL_KEY };

interface RentalItem {
  id: number;
  carNumber?: string;
  titleKo?: string;
  year?: number;
  mileage?: number;
  fuel?: string;
  rentalCompany?: string;
  monthlyPayment?: number;
  remainingMonths?: number;
  totalMonths?: number;
  totalTakeoverCost?: number;
  totalRemainingPayment?: number;
  maxSubsidy?: number;
  returnFeeAtEnd?: number;
  description?: string;
  insuranceNote?: string;
  status: string;
}

interface Bid {
  id: number;
  bidderName: string;
  requestedSubsidy: number;
  createdAt: string;
}

function fmtWon(n?: number) {
  if (!n) return '-';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  return `${Math.round(n / 10_000).toLocaleString()}만원`;
}

export default function RentalBidPage() {
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<RentalItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const load = () => {
    Promise.all([
      fetch(`${API}/admin/rental-listings/${id}`, { headers: HEADERS }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/external/rental-listings/${id}/bids`, { headers: HEADERS }).then(r => r.ok ? r.json() : []),
    ]).then(([itemData, bidsData]) => {
      setItem(itemData);
      setBids(Array.isArray(bidsData) ? bidsData : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (id) load(); }, [id]);

  const handleSubmit = async () => {
    if (!name.trim() || !amount) { alert('이름과 희망 지원금을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/external/rental-listings/${id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...HEADERS },
        body: JSON.stringify({ bidderName: name, bidderContact: contact, requestedSubsidy: Number(amount) * 10_000 }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      load();
    } catch {
      alert('제출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중…</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-gray-400">매물을 찾을 수 없습니다.</div>;

  const sorted = [...bids].sort((a, b) => a.requestedSubsidy - b.requestedSubsidy);
  const closed = item.status !== 'active';

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-700 text-center">
          🚧 렌트카 승계 베타 — 공개 페이지 아님
        </div>

        <div>
          <p className="text-2xl font-black text-gray-900">{item.titleKo}</p>
          <p className="text-sm text-gray-400 mt-1">
            {item.carNumber}{item.year ? ` · ${item.year}년` : ''}{item.mileage ? ` · ${item.mileage.toLocaleString()}km` : ''}{item.fuel ? ` · ${item.fuel}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-gray-400">렌트사</p>
            <p className="font-bold text-gray-900">{item.rentalCompany || '-'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-gray-400">월 납입금 (고정)</p>
            <p className="font-bold text-gray-900">{fmtWon(item.monthlyPayment)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-gray-400">잔여 개월</p>
            <p className="font-bold text-gray-900">{item.remainingMonths ?? '-'}/{item.totalMonths ?? '-'}개월</p>
          </div>
          <div className="bg-violet-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-violet-500">판매자 희망 지원금 (참고용)</p>
            <p className="font-black text-violet-700">{fmtWon(item.maxSubsidy)}</p>
          </div>
        </div>

        {item.description && (
          <div>
            <p className="text-xs font-black text-gray-700 mb-1.5">차량 설명</p>
            <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{item.description}</p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm font-black text-gray-900 mb-1">현재 승계 희망 현황 ({sorted.length}건)</p>
          <p className="text-[11px] text-gray-400 mb-3">낮은 지원금 요청일수록 유리해요</p>
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-300 py-4">아직 아무도 신청하지 않았습니다.</p>
          ) : (
            <div className="space-y-1.5 mb-2">
              {sorted.slice(0, 5).map((b, i) => (
                <div key={b.id} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">{i + 1}위 {b.bidderName}</span>
                  <span className="font-bold text-gray-900">{fmtWon(b.requestedSubsidy)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {closed ? (
          <div className="bg-gray-100 rounded-xl px-4 py-4 text-center text-sm text-gray-500 font-bold">이미 마감된 매물입니다</div>
        ) : done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 text-center text-sm text-green-700 font-bold">
            신청 완료! 차주가 확인 후 연락드립니다.
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <p className="text-sm font-black text-gray-900">승계 신청하기</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="이름"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500" />
            <input value={contact} onChange={e => setContact(e.target.value)} placeholder="연락처 (선택)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500" />
            <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="희망 지원금 (만원 단위, 예: 200)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500" />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-violet-600 text-white text-sm font-black disabled:opacity-50 hover:bg-violet-500 transition-colors"
            >
              {submitting ? '제출 중…' : '승계 신청하기'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
