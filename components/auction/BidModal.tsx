'use client';

import { useState } from 'react';
import { AuctionItem, Bid, fmtDate, fmtKRW, getUSD } from './shared';

export default function BidModal({
  item,
  bids,
  onBid,
  onClose,
}: {
  item: AuctionItem;
  /** 이 매물에 대한 "내"(현재 로그인 딜러) 입찰 내역 — 호출부에서 dealerId로 필터링해서 전달 */
  bids: Bid[];
  onBid: (itemId: string, amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const myBids = bids;
  const topBid = myBids.reduce((max, b) => Math.max(max, b.amount), 0);
  const estWin = item.priceKRW ?? 0;
  const estExportUSD = getUSD(item);

  const quickPicks = estWin > 0
    ? [0.9, 0.95, 1.0, 1.05].map(r => Math.round((estWin * r) / 10_000))
    : [1000, 1500, 2000, 2500];

  const handleSubmit = () => {
    const n = Number(amount.replace(/[^0-9]/g, '')) * 10_000;
    if (!n || n < 100_000) { alert('100만원 이상 입력해주세요.'); return; }
    if (estWin > 0 && n < estWin * 0.7) {
      const ok = confirm('예상 낙찰가보다 많이 낮은 금액이에요. 이런 입찰이 반복되면 향후 입찰 참여가 제한될 수 있어요. 그래도 입찰할까요?');
      if (!ok) return;
    }
    onBid(item.id, n);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-black p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">경매 입찰</p>
              <h2 className="text-white font-black text-lg mt-0.5">{item.titleKo ?? item.carNumber}</h2>
              <p className="text-white/40 text-sm mt-0.5">{item.carNumber} · {item.region?.split(' ')[0]}</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none p-1">×</button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl px-3 py-2.5">
              <p className="text-white/40 text-[10px]">예상 낙찰가</p>
              <p className="text-white font-black text-sm">{estWin > 0 ? fmtKRW(estWin) : '—'}</p>
            </div>
            <div className="bg-white/5 rounded-xl px-3 py-2.5">
              <p className="text-white/40 text-[10px]">예상 수출가</p>
              <p className="text-white font-black text-sm">{estExportUSD > 0 ? `$${estExportUSD.toLocaleString()}` : '—'}</p>
            </div>
          </div>

          {topBid > 0 && (
            <div className="mt-2 bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white/50 text-xs">내 최고 입찰가</span>
              <span className="text-white font-black">{fmtKRW(topBid)}</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-500 mb-2">입찰가 (만원 단위)</label>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="예: 2500"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <span className="flex items-center text-sm text-gray-400 font-bold">만원</span>
          </div>
          {amount && Number(amount) >= 100 && (
            <p className="text-sm text-gray-500 mb-3">
              총 입찰가: <strong className="text-gray-900">{fmtKRW(Number(amount) * 10_000)}</strong>
            </p>
          )}

          <div className="flex gap-2 flex-wrap mb-5">
            {quickPicks.map((v, i) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {v >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${v}만`}
                {estWin > 0 && <span className="text-gray-300 ml-1">{['−10%', '−5%', '예상가', '+5%'][i]}</span>}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
          >
            입찰하기
          </button>
          <p className="text-center text-gray-400 text-xs mt-3">
            입찰은 즉시 반영되며, 낙찰 확정은 카비어 어드민을 통해 진행됩니다.
          </p>
        </div>

        {myBids.length > 0 && (
          <div className="border-t border-gray-100 px-5 pb-5">
            <p className="text-xs font-semibold text-gray-400 mt-4 mb-2">내 입찰 내역</p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {[...myBids].reverse().map((b, i) => (
                <div key={b.id ?? i} className="flex justify-between text-xs text-gray-500">
                  <span>{fmtDate(b.createdAt)}</span>
                  <span className="font-semibold text-gray-900">{fmtKRW(b.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
