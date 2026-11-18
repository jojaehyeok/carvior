'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SKIP_KEY } from '@/lib/profileGate';

/**
 * 처음 오신 분께 한 번 받는 자리.
 *
 * 카카오·네이버로 들어오면 **번호가 없다.** 그런데 마이페이지는 번호로 검차 신청을
 * 찾는다(bookings 에 userId 가 없고 접수할 때 적은 번호만 있다) — 번호가 비어 있으면
 * 자기가 넣은 신청을 자기가 못 본다. 카카오는 이메일 동의를 안 받은 계정도 많아서
 * 연락할 방법까지 없는 회원이 쌓인다.
 *
 * 그래서 비어 있는 칸만 한 번 받는다. 이미 있는 값은 묻지 않는다 —
 * 여기는 "처음 한 번" 자리이지 정보 수정 자리가 아니다.
 *
 * 막아 세우지는 않는다. '나중에 하기'를 두되 이번 브라우저 세션에만 유효하게 해서,
 * 다음에 다시 들어오면 한 번 더 여쭌다.
 */
export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const user = session?.user as
    | { email?: string | null; name?: string | null; apiToken?: string; needsProfile?: boolean }
    | undefined;

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState<'send' | 'done' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const needEmail = !user?.email;

  // 로그인하지 않았거나 받을 게 없으면 여기 있을 이유가 없다
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.replace('/login');
    else if (user?.needsProfile === false) router.replace('/');
  }, [status, session, user?.needsProfile, router]);

  const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const auth = { Authorization: 'Bearer ' + (user?.apiToken ?? ''), 'Content-Type': 'application/json' };

  const onlyDigits = (v: string) => v.replace(/[^0-9]/g, '');

  const sendCode = async () => {
    const p = onlyDigits(phone);
    if (!/^01[0-9]{8,9}$/.test(p)) {
      setError('휴대폰 번호를 다시 확인해 주세요.');
      return;
    }
    setBusy('send');
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(API + '/users/phone-verify/send', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ phone: p }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || '인증번호를 보내지 못했습니다.');
      setSent(true);
      setNotice('인증번호를 보냈습니다. 3분 안에 입력해 주세요.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '인증번호를 보내지 못했습니다.');
    } finally {
      setBusy(null);
    }
  };

  const finish = async () => {
    const p = onlyDigits(phone);
    if (!sent) {
      setError('먼저 인증번호를 받아 주세요.');
      return;
    }
    if (onlyDigits(code).length < 4) {
      setError('문자로 받은 인증번호를 입력해 주세요.');
      return;
    }
    setBusy('done');
    setError(null);
    try {
      const res = await fetch(API + '/users/profile/complete', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({
          phone: p,
          code: onlyDigits(code),
          email: needEmail ? email.trim() : undefined,
          name: user?.name ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || '저장하지 못했습니다.');
      // 재로그인 없이 세션에서 바로 꺼준다 — 안 꺼지면 계속 이 화면으로 끌려온다
      await update({ needsProfile: false, ...(needEmail && email.trim() ? { email: email.trim() } : {}) });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장하지 못했습니다.');
      setBusy(null);
    }
  };

  const skip = () => {
    try {
      sessionStorage.setItem(SKIP_KEY, '1');
    } catch {
      // 저장이 안 돼도 넘어가는 건 막지 않는다
    }
    router.replace('/');
  };

  const field =
    'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-[15px] text-slate-900 outline-none transition ' +
    'placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-12">
      <main className="w-full max-w-[400px]">

        <header className="mb-7 text-center">
          <img src="/logo.png" alt="카비어" className="mx-auto h-9 w-auto" />
          <h1 className="mt-5 text-[19px] font-black text-slate-900">
            거의 다 됐습니다
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
            {needEmail
              ? '연락받으실 번호와 이메일만 확인하면 끝입니다.'
              : '연락받으실 번호만 확인하면 끝입니다.'}
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

          <label className="mb-1 block text-xs font-semibold text-slate-500">휴대폰 번호</label>
          <div className="flex gap-2">
            <input
              value={phone}
              onChange={e => {
                setPhone(e.target.value);
                setError(null);
              }}
              placeholder="010-0000-0000"
              inputMode="tel"
              autoFocus
              className={field}
            />
            <button
              type="button"
              onClick={() => void sendCode()}
              disabled={busy !== null}
              className="h-12 shrink-0 rounded-xl border border-violet-200 bg-violet-50/60 px-4 text-[13px] font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
            >
              {busy === 'send' ? '보내는 중…' : sent ? '다시 받기' : '인증번호 받기'}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            검차 신청을 이 번호로 찾습니다. 번호가 없으면 마이페이지에서 신청하신 건이 안 보입니다.
          </p>

          {sent && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold text-slate-500">인증번호</label>
              <input
                value={code}
                onChange={e => {
                  setCode(e.target.value);
                  setError(null);
                }}
                placeholder="문자로 받은 6자리"
                inputMode="numeric"
                className={field}
              />
            </div>
          )}

          {needEmail && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold text-slate-500">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="carvior@example.com"
                inputMode="email"
                autoCapitalize="none"
                className={field}
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                카카오에서 이메일을 받지 못했습니다. 안 적으시면 비밀번호를 되찾을 길이 없습니다.
              </p>
            </div>
          )}

          {notice && !error && (
            <p className="mt-4 rounded-xl bg-violet-50 px-3.5 py-2.5 text-[13px] font-medium text-violet-600">{notice}</p>
          )}
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={() => void finish()}
            disabled={busy !== null || !sent}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-[15px] font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-100 disabled:text-violet-400"
          >
            {busy === 'done' && (
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            시작하기
          </button>
        </div>

        <button
          type="button"
          onClick={skip}
          className="mt-4 w-full text-center text-[12px] text-slate-400 transition hover:text-slate-600"
        >
          나중에 하기
        </button>
      </main>
    </div>
  );
}
