'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { clsx } from 'clsx';

const NAV_LINKS = [
  { label: '차량 구매',   href: '/buy' },
  { label: '차량 판매',   href: '/sell' },
  { label: '시세 조회',   href: '/price' },
  { label: '스마트옥션', href: '/auction' },
];

export default function StoreNav({ transparent }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user as any;
  const isDealer = user?.role === 'dealer';

  return (
    <nav className={clsx(
      'sticky top-0 z-50 border-b transition-colors',
      transparent ? 'bg-transparent border-white/10' : 'bg-zinc-800 border-white/10'
    )}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="카비어" width={120} height={40} className="object-contain" priority />
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = pathname?.startsWith(l.href);
            const isDealerMenu = l.href === '/auction';
            // 옥션은 딜러만 표시
            if (isDealerMenu && !isDealer) return null;
            return (
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                    active ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  {l.label}
                  {isDealerMenu && (
                    <span className="text-[9px] font-black tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase">딜러</span>
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              >
                {user?.image ? (
                  <img src={user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.name?.[0] ?? '?'}
                  </div>
                )}
                <span className="text-xs text-white font-semibold max-w-[80px] truncate">{user?.name}</span>
                {isDealer && <span className="text-[9px] font-black text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded-full">딜러</span>}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/mypage'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    마이페이지
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
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              로그인
            </Link>
          )}

          <button className="p-2.5 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5" aria-label="검색">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button
            onClick={() => setOpen(v => !v)}
            className="p-2.5 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5 lg:hidden"
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

      {/* 모바일 메뉴 */}
      {open && (
        <div className="lg:hidden bg-zinc-800 border-t border-white/10">
          {NAV_LINKS.map(l => {
            if (l.href === '/auction' && !isDealer) return null;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-6 py-4 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 transition-colors"
              >
                <span>{l.label}</span>
                {l.href === '/auction' && (
                  <span className="text-[9px] font-black tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase">딜러</span>
                )}
              </Link>
            );
          })}
          {session ? (
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div>
                <p className="text-sm text-white font-semibold">{user?.name}</p>
                <p className="text-xs text-white/40">{user?.email}</p>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-xs text-red-400 font-semibold">로그아웃</button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}
              className="flex items-center px-6 py-4 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5">
              로그인 / 회원가입
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
