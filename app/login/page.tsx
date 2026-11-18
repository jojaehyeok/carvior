'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { BuildingIcon, KakaoMark, NaverMark, StoreIcon, UserIcon } from '@/components/BrandMarks';

type Tab = 'user' | 'dealer' | 'biz';

/** 이메일 저장 — 비밀번호는 절대 담지 않는다. 이메일만이다. */
const SAVED_EMAIL_KEY = 'carvior.savedLoginEmail';

function readSavedEmail() {
  try {
    return localStorage.getItem(SAVED_EMAIL_KEY) ?? '';
  } catch {
    // 사파리 사생활 보호 모드 등에서는 localStorage 접근 자체가 막힌다. 저장만 포기한다.
    return '';
  }
}

/**
 * 탭은 로그인 방식이 아니라 **누구인가**로 나눈다.
 *
 * 일반 회원과 딜러는 같은 문으로 들어오지만 들어와서 쓰는 게 다르고, 상사 대표님은
 * 아예 다른 문(biz.carvior.store)으로 가신다. 처음 온 사람이 막히는 자리가 거기다 —
 * 상사 계정으로 여기서 아무리 눌러도 안 들어와진다.
 */
const TABS: { key: Tab; label: string; Icon: typeof UserIcon }[] = [
  { key: 'user', label: '일반 회원', Icon: UserIcon },
  { key: 'dealer', label: '딜러', Icon: StoreIcon },
  { key: 'biz', label: '상사 대표', Icon: BuildingIcon },
];

/**
 * 로그인 화면.
 *
 * 이메일·비밀번호를 맨 위에 둔다. 전에는 카카오·네이버가 먼저고 이메일은 '또는' 아래
 * 다른 페이지로 넘기는 단추였는데, 그러면 대부분 소셜로 들어오고 **우리는 그 사람의
 * 이메일을 못 받는다.**
 *
 * 추측이 아니다 — lib/auth.ts 에 이미 적혀 있다: "카카오는 이메일 동의를 안 받은
 * 계정이 많아서 이메일로 되찾는 경로도 막혀 있다." 연락할 방법이 없는 회원이 쌓이면
 * 거래 알림도, 비밀번호 되찾기도 못 한다.
 *
 * 그래서 이메일이 기본이고 소셜은 아래 줄로 내린다. 막지는 않는다 — 소셜이 빠른 사람이
 * 많고, 이미 그렇게 가입한 분들이 계신다.
 */
export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('user');

  const [email, setEmail] = useState(readSavedEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => readSavedEmail() !== '');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = !!loading;
  const canSubmit = email.trim() !== '' && password !== '' && !busy;

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    const id = email.trim();
    if (!id || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading('email');
    setError(null);
    const result = await signIn('credentials', { email: id, password, redirect: false });
    if (result?.ok) {
      try {
        if (remember) localStorage.setItem(SAVED_EMAIL_KEY, id);
        else localStorage.removeItem(SAVED_EMAIL_KEY);
      } catch {
        // 저장이 안 돼도 로그인은 됐다. 막지 않는다.
      }
      router.push('/');
      return;
    }
    setLoading(null);
    setError('이메일 또는 비밀번호가 올바르지 않습니다.');
  };

  const handleSocial = async (provider: 'kakao' | 'naver') => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/' });
  };

  const field =
    'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-[15px] text-slate-900 outline-none transition ' +
    'placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-12">
      <main className="w-full max-w-[400px]">

        <header className="mb-7 text-center">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="카비어" className="mx-auto h-9 w-auto" />
          </Link>
          <p className="mt-3 text-[13px] font-medium text-slate-400">
            중고차 거래, 차량 상태부터 투명하게
          </p>
        </header>

        {/* 탭 — 누구로 들어오는가 */}
        <div className="flex overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-slate-50">
          {TABS.map(({ key, label, Icon }, i) => {
            const on = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={on}
                className={
                  'flex flex-1 items-center justify-center gap-1.5 py-3 text-[13px] transition ' +
                  (i > 0 ? 'border-l border-slate-200 ' : '') +
                  (on ? 'bg-white font-bold text-slate-900' : 'font-medium text-slate-400 hover:text-slate-600')
                }
              >
                <Icon className={(on ? 'text-violet-600 ' : 'text-slate-300 ') + 'size-[14px]'} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="rounded-b-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          {tab === 'biz' ? (
            /* 상사 대표님은 여기가 아니다 — 두 제품의 계정이 아직 따로다.
               여기서 로그인하는 척하지 않고 문을 가리켜 드린다. */
            <>
              <p className="text-[13px] leading-relaxed text-slate-500">
                상사 운영 프로그램 <b className="font-bold text-slate-700">카비어 비즈</b>는
                따로 로그인합니다. 대표님·사무장님·직원 계정 모두 그쪽입니다.
              </p>
              <a
                href="https://biz.carvior.store"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-[14px] font-bold text-white transition hover:bg-violet-700"
              >
                카비어 비즈로 이동 →
              </a>
              <Link
                href="/biz"
                className="mt-2.5 flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 text-[14px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                어떤 프로그램인지 먼저 보기
              </Link>
            </>
          ) : (
            <>
              {tab === 'dealer' && (
                <div className="mb-5 rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-3">
                  <p className="text-[12px] font-bold text-violet-700">딜러 회원 안내</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-violet-500">
                    딜러로 가입하시면 스마트옥션과 매매 관리를 쓰실 수 있습니다.
                    로그인은 일반 회원과 같은 방법입니다.
                  </p>
                </div>
              )}

              <form onSubmit={handleEmail} noValidate>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="이메일 주소를 입력하세요."
                  autoComplete="username"
                  autoCapitalize="none"
                  autoFocus
                  className={field}
                />

                <input
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="비밀번호를 입력하세요."
                  autoComplete="current-password"
                  className={field + ' mt-2.5'}
                />

                <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-[13px] text-slate-500 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="size-4 cursor-pointer rounded border-slate-300 accent-violet-600"
                  />
                  이메일 저장
                </label>

                {error && (
                  <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-[15px] font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-100 disabled:text-violet-400"
                >
                  {loading === 'email' && (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  로그인
                </button>
              </form>

              {/* 소셜은 아래로 내린다 — 막지는 않는다. 빠른 사람이 많고 이미 그렇게 가입한 분들이 계신다. */}
              <div className="mt-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-100" />
                <span className="shrink-0 text-[11px] text-slate-400">SNS 계정으로 계속하기</span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSocial('kakao')}
                  disabled={busy}
                  title="카카오로 로그인"
                  aria-label="카카오로 로그인"
                  className="flex size-11 items-center justify-center rounded-full bg-[#FEE500] text-[#191600] transition hover:brightness-[0.97] disabled:opacity-40"
                >
                  {loading === 'kakao' ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-[#191600]/25 border-t-[#191600]" />
                  ) : (
                    <KakaoMark className="size-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSocial('naver')}
                  disabled={busy}
                  title="네이버로 로그인"
                  aria-label="네이버로 로그인"
                  className="flex size-11 items-center justify-center rounded-full bg-[#03C75A] text-white transition hover:brightness-95 disabled:opacity-40"
                >
                  {loading === 'naver' ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <NaverMark className="size-[17px]" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {tab !== 'biz' && (
          <>
            {/* 비밀번호 되찾기 화면은 아직 없다. 없는 걸 있는 것처럼 걸어두지 않는다. */}
            <p className="mt-5 text-center text-[12px] text-slate-400">
              비밀번호를 잊으셨나요? 고객센터{' '}
              <a href="tel:07041382017" className="font-semibold text-slate-500 underline-offset-2 hover:text-violet-600 hover:underline">
                070-4138-2017
              </a>
            </p>

            <p className="mt-3 text-center text-[13px] text-slate-400">
              계정이 없으신가요?{' '}
              <button
                onClick={() => router.push(tab === 'dealer' ? '/register?role=dealer' : '/register')}
                className="font-bold text-violet-600 underline-offset-2 hover:underline"
              >
                {tab === 'dealer' ? '딜러 회원가입' : '일반 회원가입'}
              </button>
            </p>
          </>
        )}

        <SiteFooter />
      </main>
    </div>
  );
}

/**
 * 사업자 정보.
 *
 * 로그인 화면은 로그인 안 한 사람이 보는 자리라 여기에 둔다. 전화번호는 눌러서 바로 걸리게 한다.
 */
function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-100 pt-6 text-center text-[11px] leading-relaxed text-slate-400">
      <p className="font-semibold text-slate-500">카비어 주식회사</p>
      <p className="mt-1.5">
        대표자 : 조재혁, 유진욱
        <span className="mx-1.5 text-slate-300">|</span>
        사업자등록번호 : 889-81-03879
      </p>
      <p className="mt-0.5">통신판매업신고 : 제 2026-경기안산-0474</p>
      <p className="mt-0.5">경기도 안산시 단원구 원포공원1로 59, A동 5층 2호 (초지동, 신명트윈타워)</p>
      <p className="mt-1.5">
        대표번호{' '}
        <a href="tel:07041382017" className="underline-offset-2 hover:text-slate-600 hover:underline">
          070-4138-2017
        </a>
        <span className="mx-1.5 text-slate-300">|</span>
        고객센터{' '}
        <a href="tel:07041382017" className="underline-offset-2 hover:text-slate-600 hover:underline">
          070-4138-2017
        </a>
      </p>
      <p className="mt-3 text-slate-300">© {new Date().getFullYear()} CARVIOR Corp.</p>
    </footer>
  );
}
