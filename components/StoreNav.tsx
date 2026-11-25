'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { clsx } from 'clsx';

// ⚠ 이게 실제 전역 헤더다(app/layout.tsx에서 렌더).
//
// 여기 올리지 않기로 한 것들 (2026-11-25 유저 지시) —
//  · /dealer-inspection : 딜러 전용 요금표다. 일반 고객에게 보이면 안 된다.
//    딜러에게는 로그인 후 홈(app/page.tsx의 isDealer 블록)에서만 안내한다.
//  · /price : 시세 조회가 지금 동작하지 않는다(EnCarAPI 구독 끊김).
//  · /inspection : 검차 신청은 메뉴에 걸지 않는다.
const NAV_LINKS: { label: string; href: string; badge?: string }[] = [
  { label: '내차 사기',   href: '/market' },
  { label: '내차 팔기',   href: '/sell' },
  { label: '수출·폐차 견적받기', href: '/export-scrap' },
  { label: '스마트옥션', href: '/auction', badge: '딜러' },
];

export default function StoreNav({ transparent }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  // 돋보기 — 전엔 onClick이 없는 장식이라 눌러도 아무 일이 없었다.
  // 누르면 입력칸이 열리고, 넣은 말로 매물을 찾아 /market으로 보낸다.
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user as any;
  const isDealer = user?.role === 'dealer';

  const runSearch = () => {
    const q = searchText.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchText('');
    setOpen(false);
    router.push(`/market?q=${encodeURIComponent(q)}`);
  };

  // 로그인 화면은 비즈처럼 한 장으로 둔다 — 로고를 눌러 홈으로 나간다
  const HIDE_NAV_PATHS = ['/marketing/simple-request', '/login'];
  if (HIDE_NAV_PATHS.some(p => pathname?.startsWith(p))) return null;

  return (
    <nav className={clsx(
      'sticky top-0 z-50 border-b transition-colors',
      transparent ? 'bg-transparent border-black/10' : 'bg-white border-gray-200'
    )}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="카비어" style={{ height: '32px', width: 'auto' }} />
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = pathname?.startsWith(l.href);
            return (
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                    active ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {l.label}
                  {l.badge && (
                    <span className="text-[9px] font-black tracking-wide bg-purple-500/20 text-purple-600 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase">{l.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {user?.image ? (
                  <img src={user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.name?.[0] ?? '?'}
                  </div>
                )}
                <span className="text-xs text-gray-800 font-semibold max-w-[80px] truncate">{user?.name}</span>
                {isDealer && <span className="text-[9px] font-black text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">딜러</span>}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/mypage'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    마이페이지
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/mypage/settings'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    계정 설정
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => { setProfileOpen(false); signOut({ callbackUrl: '/' }); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
            {/* 처음 온 사람이 "여기서 뭘 할 수 있나"를 먼저 보게 — 로그인 옆에 둔다 */}
            <Link
              href="/guide"
              className="hidden lg:flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50"
            >
              ⓘ 이용가이드
            </Link>
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              로그인
            </Link>
            </>
          )}

          <button
            onClick={() => setSearchOpen(v => !v)}
            className="p-2.5 text-gray-400 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
            aria-label="검색"
            aria-expanded={searchOpen}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {searchOpen
                ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                : <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>
              }
            </svg>
          </button>
          <button
            onClick={() => setOpen(v => !v)}
            className="p-2.5 text-gray-400 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50 lg:hidden"
            aria-label="메뉴"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open
                ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* 검색창 — 돋보기를 누르면 열린다 */}
      {searchOpen && (
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2">
            <input
              autoFocus
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
              placeholder="찾는 차를 적어주세요 — 예) 그랜저 / 카니발 / 아반떼"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500"
            />
            <button
              onClick={runSearch}
              disabled={!searchText.trim()}
              className="shrink-0 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold px-5 rounded-xl transition-colors"
            >
              검색
            </button>
          </div>
        </div>
      )}

      {/* 모바일 메뉴 */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          {NAV_LINKS.map(l => {
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-6 py-4 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <span>{l.label}</span>
                {l.badge && (
                  <span className="text-[9px] font-black tracking-wide bg-purple-500/20 text-purple-600 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase">{l.badge}</span>
                )}
              </Link>
            );
          })}
          {session ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-sm text-gray-900 font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={() => { setOpen(false); router.push('/chat'); }}
                className="w-full flex items-center px-6 py-4 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                문의 대화
              </button>
              <button
                onClick={() => { setOpen(false); router.push('/mypage'); }}
                className="w-full flex items-center px-6 py-4 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                마이페이지
              </button>
              <button
                onClick={() => { setOpen(false); router.push('/mypage/settings'); }}
                className="w-full flex items-center px-6 py-4 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                계정 설정
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center px-6 py-4 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}
              className="flex items-center px-6 py-4 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              로그인 / 회원가입
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
