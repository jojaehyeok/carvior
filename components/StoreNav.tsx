'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const NAV_LINKS = [
  { label: '차량 구매',   href: '/buy' },
  { label: '차량 판매',   href: '/sell' },
  { label: '시세 조회',   href: '/price' },
  { label: '스마트옥션', href: '/auction' },
];

interface DealerSession {
  code: string;
  name: string;
  company: string;
}

export default function StoreNav({ transparent }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [dealer, setDealer] = useState<DealerSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('carvior_dealer');
      if (raw) setDealer(JSON.parse(raw));
    } catch {}
  }, []);

  const handleDealerLogout = () => {
    localStorage.removeItem('carvior_dealer');
    setDealer(null);
  };

  return (
    <nav className={clsx(
      'sticky top-0 z-50 border-b transition-colors',
      transparent ? 'bg-transparent border-white/10' : 'bg-zinc-800 border-white/10'
    )}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo.png"
            alt="카비어"
            width={80}
            height={80}
            className="object-contain invert"
            priority
          />
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = pathname?.startsWith(l.href);
            const isDealer = l.href === '/auction';
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
                  {isDealer && (
                    <span className="text-[9px] font-black tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase">
                      딜러
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          {dealer ? (
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-purple-300 font-semibold">{dealer.name}</span>
              </div>
              <button
                onClick={handleDealerLogout}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/auction"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              딜러 로그인
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
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-6 py-4 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 transition-colors"
            >
              <span>{l.label}</span>
              {l.href === '/auction' && (
                <span className="text-[9px] font-black tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase">
                  딜러
                </span>
              )}
            </Link>
          ))}
          {dealer && (
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs text-purple-300">{dealer.name} ({dealer.company})</span>
              <button onClick={handleDealerLogout} className="text-xs text-white/40">로그아웃</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
