'use client';

// 신고 창 — 매물과 대화 둘 다 같은 모양으로 받는다.
// 신고해도 매물이 바로 내려가지 않는다는 걸 분명히 적어둔다(바로 내려갈 거라 믿고
// 신고만 하고 연락을 끊으면, 정작 사기 건은 대응이 늦어진다).

import { useState } from 'react';

const REASONS: { code: string; label: string }[] = [
  { code: 'fake', label: '허위매물 의심 (실제로 없는 차·사진 도용)' },
  { code: 'price', label: '가격이 올린 것과 다름' },
  { code: 'dealer', label: '개인인 척하는 딜러' },
  { code: 'fraud', label: '사기 의심 (선입금·계좌이체 요구)' },
  { code: 'abuse', label: '욕설·협박' },
  { code: 'spam', label: '광고·도배' },
  { code: 'other', label: '기타' },
];

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

export default function ReportModal({
  targetType,
  targetId,
  token,
  onClose,
}: {
  targetType: 'listing' | 'chat';
  targetId: number;
  token: string | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reason || !token) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetType, targetId, reason, detail }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.message ?? '신고를 접수하지 못했습니다.');
        return;
      }
      setDone(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="px-6 py-10 text-center">
            <p className="text-base font-black text-slate-900 mb-2">신고가 접수되었습니다</p>
            <p className="text-xs leading-relaxed text-slate-500 mb-7">
              카비어가 내용을 확인한 뒤 조치합니다. 사기 피해가 이미 생겼다면
              경찰(112)·인터넷 신고(ecrm.police.go.kr)에도 함께 접수해주세요.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-sm"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-black text-slate-900">
                {targetType === 'listing' ? '이 매물 신고하기' : '이 대화 신고하기'}
              </p>
              <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs font-bold text-slate-500 mb-3">무엇이 문제인가요?</p>
              <div className="space-y-1.5">
                {REASONS.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => setReason(r.code)}
                    className={`w-full text-left text-xs font-bold px-4 py-3 rounded-xl border transition-colors ${
                      reason === r.code
                        ? 'border-violet-400 bg-violet-50 text-violet-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="자세한 내용을 적어주시면 확인이 빨라집니다. (선택)"
                className="w-full mt-4 resize-none border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-violet-500"
              />

              <p className="text-[11px] leading-relaxed text-slate-400 mt-3">
                신고만으로 매물이 바로 내려가지는 않습니다 — 카비어가 확인한 뒤 조치합니다.
                거짓으로 신고하면 이용이 제한될 수 있습니다.
              </p>

              <button
                onClick={submit}
                disabled={!reason || sending || !token}
                className="w-full mt-5 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3.5 rounded-xl text-sm transition-colors"
              >
                {sending ? '접수 중…' : '신고 접수'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
