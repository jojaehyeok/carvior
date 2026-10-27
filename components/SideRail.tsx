'use client';

// 오른쪽에 붙는 도구 막대 — 최근 본 차량 / 찜 / 맨 위로.
// 데스크톱에선 세로 막대, 모바일에선 화면을 가리지 않게 오른쪽 아래 작은 버튼만 띄운다.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getFavorites, getRecent, removeFavorite, type GarageCar } from '@/lib/garage';

const fmt = (n: number | null) =>
  n ? `${Math.round(n / 10000).toLocaleString()}만원` : '가격 문의';

type Panel = 'recent' | 'favorite' | null;

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
    // 다른 화면에서 찜을 눌러도 이 막대의 숫자가 바로 따라오게 한다
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

  return (
    <>
      {/* 펼침 패널 */}
      {panel && (
        <>
          <div className="fixed inset-0 z-[190] bg-black/20" onClick={() => setPanel(null)} />
          <div className="fixed right-4 bottom-24 md:bottom-auto md:top-28 z-[195] w-[18rem] max-h-[60vh] bg-white rounded-2xl border border-violet-100 shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-black text-slate-800">
                {panel === 'favorite' ? '찜한 차량' : '최근 본 차량'}
              </p>
              <button onClick={() => setPanel(null)} className="text-slate-300 hover:text-slate-500">×</button>
            </div>
            {list.length === 0 ? (
              <p className="px-4 py-10 text-center text-xs text-slate-400">
                {panel === 'favorite' ? '아직 찜한 차가 없습니다.' : '아직 본 차가 없습니다.'}
              </p>
            ) : (
              <ul className="overflow-y-auto divide-y divide-slate-50">
                {list.map((car) => (
                  <li key={car.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-violet-50/50">
                    <Link href={`/market/${car.id}`} onClick={() => setPanel(null)} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {car.photo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={car.photo} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{car.title}</p>
                        <p className="text-[11px] font-black text-violet-600">{fmt(car.price)}</p>
                      </div>
                    </Link>
                    {panel === 'favorite' && (
                      <button
                        onClick={() => { removeFavorite(car.id); refresh(); }}
                        className="text-slate-300 hover:text-red-400 text-xs shrink-0"
                        title="찜 해제"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* 데스크톱 — 오른쪽 세로 막대 */}
      <div className="hidden md:flex fixed right-4 top-28 z-[180] flex-col bg-white border border-violet-100 rounded-2xl shadow-sm overflow-hidden w-[4.5rem]">
        <button
          onClick={() => setPanel(panel === 'recent' ? null : 'recent')}
          className="flex flex-col items-center gap-1 py-3.5 hover:bg-violet-50 transition-colors border-b border-slate-100"
        >
          <span className="text-lg">👁</span>
          <span className="text-[10px] font-bold text-slate-500 leading-tight">최근본<br />차량</span>
          {recent.length > 0 && <span className="text-[10px] font-black text-violet-600">{recent.length}</span>}
        </button>
        <button
          onClick={() => setPanel(panel === 'favorite' ? null : 'favorite')}
          className="flex flex-col items-center gap-1 py-3.5 hover:bg-violet-50 transition-colors border-b border-slate-100"
        >
          <span className="text-lg">🛒</span>
          <span className="text-[10px] font-bold text-slate-500">찜</span>
          {favorites.length > 0 && <span className="text-[10px] font-black text-violet-600">{favorites.length}</span>}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="py-3 text-[11px] font-bold text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
        >
          TOP ▲
        </button>
      </div>

      {/* 모바일 — 화면을 가리지 않게 오른쪽 아래 작은 버튼만 */}
      <div className="md:hidden fixed right-4 bottom-5 z-[180] flex flex-col gap-2">
        <button
          onClick={() => setPanel(panel === 'favorite' ? null : 'favorite')}
          className="relative w-12 h-12 rounded-full bg-white border border-violet-100 shadow-lg flex items-center justify-center"
          aria-label="찜한 차량"
        >
          🛒
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
