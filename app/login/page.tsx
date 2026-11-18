'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BuildingIcon, KakaoMark, NaverMark, StoreIcon, UserIcon } from '@/components/BrandMarks';

type Tab = 'user' | 'dealer' | 'biz';

/**
 * 탭은 로그인 방식이 아니라 **누구인가**로 나눈다.
 *
 * 일반 회원과 딜러는 같은 문으로 들어오지만 들어와서 쓰는 게 다르고, 상사 대표님은
 * 아예 다른 문(biz.carvior.store)으로 가신다. 처음 온 사람이 막히는 자리가 거기다 —
 * 상사 계정으로 여기서 아무리 눌러도 안 들어와진다.
 *
 * 그래서 탭이 바꾸는 것은 입력칸이 아니라 **안내와 아래 단추**다.
 */
const TABS: { key: Tab; label: string; Icon: typeof UserIcon }[] = [
  { key: 'user', label: '일반 회원', Icon: UserIcon },
  { key: 'dealer', label: '딜러', Icon: StoreIcon },
  { key: 'biz', label: '상사 대표', Icon: BuildingIcon },
];

/**
 * 로그인 화면.
 *
 * 비즈(biz.carvior.store) 로그인과 같은 결로 맞춰 둔다 — 로고 하나, 태그라인 한 줄,
 * 유저 구분 탭, 그리고 들어가는 길. 한 회사의 두 제품인데 문이 따로 놀면 안 된다.
 */
export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('user');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocial = async (provider: 'kakao' | 'naver') => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/' });
  };

  const busy = !!loading;

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

              <div className="space-y-2.5">
                <button
                  onClick={() => handleSocial('kakao')}
                  disabled={busy}
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] text-[14px] font-bold text-[#191600] transition hover:brightness-[0.97] disabled:opacity-50"
                >
                  {loading === 'kakao' ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-[#191600]/25 border-t-[#191600]" />
                  ) : (
                    <KakaoMark className="size-[18px]" />
                  )}
                  카카오로 로그인
                </button>

                <button
                  onClick={() => handleSocial('naver')}
                  disabled={busy}
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#03C75A] text-[14px] font-bold text-white transition hover:brightness-95 disabled:opacity-50"
                >
                  {loading === 'naver' ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <NaverMark className="size-[15px]" />
                  )}
                  네이버로 로그인
                </button>
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-100" />
                <span className="text-[11px] font-medium text-slate-300">또는</span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>

              <button
                onClick={() => router.push('/login/email')}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 text-[14px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                이메일로 로그인
              </button>
            </>
          )}
        </div>

        {tab !== 'biz' && (
          <p className="mt-5 text-center text-[13px] text-slate-400">
            계정이 없으신가요?{' '}
            <button
              onClick={() => router.push(tab === 'dealer' ? '/register?role=dealer' : '/register')}
              className="font-bold text-violet-600 underline-offset-2 hover:underline"
            >
              {tab === 'dealer' ? '딜러 회원가입' : '일반 회원가입'}
            </button>
          </p>
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
        <a href="tel:01022856017" className="underline-offset-2 hover:text-slate-600 hover:underline">
          010-2285-6017
        </a>
      </p>
      <p className="mt-3 text-slate-300">© {new Date().getFullYear()} CARVIOR Corp.</p>
    </footer>
  );
}
