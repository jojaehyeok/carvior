'use client';

// 다른 번호로 접수한 검차 건 찾기 — 문자 인증으로 그 번호가 본인 것임을 확인한다.
//
// ⚠ 인증 없이 번호만 받으면 남의 번호를 넣어 남의 검차 이력(차량번호·주소·연락처)을
// 그대로 들여다볼 수 있다. 그래서 번호만 입력받는 화면은 만들면 안 된다.

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

const fmtPhone = (v: string) => {
  const n = v.replace(/[^0-9]/g, '').slice(0, 11);
  if (n.length < 4) return n;
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
};

export default function LinkPhoneModal({
  token,
  onClose,
  onLinked,
}: {
  token: string | null;
  onClose: () => void;
  onLinked: (phone: string) => void;
}) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (path: string, body: object) => {
    const res = await fetch(`${API}/users/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message ?? '처리하지 못했습니다.');
    return data;
  };

  const send = async () => {
    setError(null);
    setBusy(true);
    try {
      await call('phone-verify/send', { phone });
      setStep('code');
    } catch (e: any) {
      setError(e?.message ?? '인증번호를 보내지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setError(null);
    setBusy(true);
    try {
      await call('phone-verify/confirm', { phone, code });
      onLinked(phone.replace(/[^0-9]/g, ''));
    } catch (e: any) {
      setError(e?.message ?? '인증에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-black text-slate-900">다른 번호로 신청한 건 찾기</p>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
        </div>

        <div className="px-6 py-5">
          {step === 'phone' ? (
            <>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                검차를 신청하실 때 적으신 번호를 입력해주세요. 본인 확인을 위해
                그 번호로 인증번호를 보내드립니다.
              </p>
              <input
                value={phone}
                onChange={e => setPhone(fmtPhone(e.target.value))}
                placeholder="010-0000-0000"
                inputMode="numeric"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500"
              />
              <button
                onClick={send}
                disabled={busy || phone.replace(/[^0-9]/g, '').length < 10 || !token}
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3.5 rounded-xl text-sm transition-colors"
              >
                {busy ? '보내는 중…' : '인증번호 받기'}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                <strong className="text-slate-800">{phone}</strong> 로 보낸 인증번호 6자리를
                입력해주세요. 3분 안에 입력하셔야 합니다.
              </p>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-black tracking-[0.3em] outline-none focus:border-violet-500"
              />
              <button
                onClick={confirm}
                disabled={busy || code.length !== 6}
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3.5 rounded-xl text-sm transition-colors"
              >
                {busy ? '확인 중…' : '확인하고 연결하기'}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode(''); setError(null); }}
                className="w-full mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 py-2"
              >
                번호를 잘못 입력했어요
              </button>
            </>
          )}

          {error && <p className="text-xs text-red-500 leading-relaxed mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}
