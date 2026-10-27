'use client';

// 거래 후기 — 거래완료된 대화방에서 별점과 한 줄을 남긴다.
// 개인 거래는 상대가 어떤 사람인지가 전부라, 이 후기가 다음 사람의 판단 재료가 된다.

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

function Star({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="p-1 transition-transform hover:scale-110" aria-label="별점">
      <svg width="30" height="30" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : '#e2e8f0'}>
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.4l-5.8 3 1.1-6.45-4.7-4.6 6.5-.95L12 2.5z" />
      </svg>
    </button>
  );
}

export default function TradeReviewModal({
  roomId,
  token,
  onClose,
  onDone,
}: {
  roomId: number;
  token: string | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!rating || !token) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/trade-reviews/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.message ?? '후기를 남기지 못했습니다.');
        return;
      }
      onDone();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-black text-slate-900">거래 후기 남기기</p>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
        </div>

        <div className="px-6 py-6">
          <p className="text-xs text-slate-500 text-center mb-3">상대방과의 거래는 어땠나요?</p>
          <div className="flex items-center justify-center mb-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} filled={n <= rating} onClick={() => setRating(n)} />
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="약속 시간을 잘 지켰어요, 차 상태를 솔직하게 말해줬어요… (선택, 300자)"
            className="w-full resize-none border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-violet-500"
          />
          <p className="text-[11px] leading-relaxed text-slate-400 mt-3">
            후기는 지울 수 없고, 상대방의 다음 거래에 그대로 보입니다(이름은 첫 글자만 표시됩니다).
          </p>

          <button
            onClick={submit}
            disabled={!rating || sending || !token}
            className="w-full mt-5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3.5 rounded-xl text-sm transition-colors"
          >
            {sending ? '등록 중…' : '후기 등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
