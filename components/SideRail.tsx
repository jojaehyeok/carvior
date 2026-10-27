'use client';

// 오른쪽 도구 막대 — 찜한 차 / 최근 본 차 / 맨 위로.
// 헤이딜러처럼 "개수가 먼저 보이고, 누르면 목록이 펼쳐지는" 방식.
// 데스크톱은 오른쪽에 떠 있고, 모바일은 화면을 가리지 않게 아래쪽 동그란 버튼만 둔다.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getFavorites, getRecent, removeFavorite, type GarageCar } from '@/lib/garage';
import HeartButton from './HeartButton';

const fmt = (n: number | null) => (n ? `${Math.round(n / 10000).toLocaleString()}만원` : '가격 문의');

type Panel = 'recent' | 'favorite' | null;

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#111827' : 'none'} stroke="#111827" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function SideRail() {
  const [panel, setPanel] = useState<Panel>(null);
  const [favorites, setFavorites] = useState<GarageCar[]>([]);
  const [recent, setRecent] = useState<GarageCar[]>([]);
  const [showTop, setShowTop] = useState(false);

  const refresh = useCallback(() => {
    setFavorites(getFavorites());
    setRecent(getRecent());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('carvior-garage', refresh);
    window.addEventListener('storage', refresh);
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('carvior-garage', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('scroll', onScroll);
    };
  }, [refresh]);

  const list = panel === 'favorite' ? favorites : recent;
  const title = panel === 'favorite' ? '찜한 차' : '최근 본 차';

  return (
    <>
      {panel && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setPanel(null)} />
          <div className="fixed right-4 bottom-24 md:bottom-auto md:top-24 md:right-24 z-[195] w-[20rem] max-h-[70vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <p className="text-sm font-black text-slate-900">
                {title} <span className="text-violet-600">{list.length}</span>
              </p>
              <button onClick={() => setPanel(null)} className="text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
            </div>

            {list.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-xs text-slate-400 mb-4">
                  {panel === 'favorite' ? '아직 찜한 차가 없습니다.' : '아직 본 차가 없습니다.'}
                </p>
                <Link
                  href="/market"
                  onClick={() => setPanel(null)}
                  className="text-xs font-bold text-violet-600 hover:underline"
                >
                  매물 둘러보기 →
                </Link>
              </div>
            ) : (
              <ul className="overflow-y-auto divide-y divide-slate-50">
                {list.map((car) => (
                  <li key={car.id} className="relative hover:bg-slate-50/70">
                    <Link
                      href={`/market/${car.id}`}
                      onClick={() => setPanel(null)}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {car.photo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={car.photo} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pr-8">
                        <p className="text-xs font-bold text-slate-800 truncate">{car.title}</p>
                        <p className="text-sm font-black text-violet-600 mt-0.5">{fmt(car.price)}</p>
                      </div>
                    </Link>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {panel === 'favorite' ? (
                        <button
                          onClick={() => { removeFavorite(car.id); refresh(); }}
                          className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 text-sm"
                          title="찜 해제"
                        >
                          ×
                        </button>
                      ) : (
                        <HeartButton car={car} size="sm" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* 데스크톱 */}
      <div className="hidden md:flex fixed right-5 top-28 z-[180] flex-col items-center gap-4">
        <button onClick={() => setPanel(panel === 'favorite' ? null : 'favorite')} className="flex flex-col items-center gap-1 group">
          <span className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-violet-200 transition-colors">
            <HeartIcon filled={favorites.length > 0} />
          </span>
          <span className="text-[11px] font-bold text-slate-500">찜한 차 {favorites.length}</span>
        </button>

        <button onClick={() => setPanel(panel === 'recent' ? null : 'recent')} className="flex flex-col items-center gap-1 group">
          <span className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center group-hover:border-violet-200 transition-colors">
            {recent[0]?.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={recent[0].photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">🚗</span>
            )}
          </span>
          <span className="text-[11px] font-bold text-slate-500">최근 본 차</span>
        </button>

        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] font-black text-slate-400 hover:text-violet-600 hover:border-violet-200 transition-colors"
          >
            TOP
          </button>
        )}
      </div>

      {/* 모바일 */}
      <div className="md:hidden fixed right-4 bottom-5 z-[180] flex flex-col gap-2">
        <button
          onClick={() => setPanel(panel === 'favorite' ? null : 'favorite')}
          className="relative w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center"
          aria-label="찜한 차"
        >
          <HeartIcon filled={favorites.length > 0} />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </button>
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-violet-600 text-white shadow-lg flex items-center justify-center font-black"
            aria-label="맨 위로"
          >
            ▲
          </button>
        )}
      </div>
    </>
  );
}
