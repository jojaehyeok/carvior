'use client';

// 찜 하트 — 글자 ♥는 폰트마다 모양이 제각각이라 SVG로 그린다.
// 누르면 살짝 튀는 느낌만 주고, 채워진 상태는 색으로 구분한다.

import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite, type GarageCar } from '@/lib/garage';

export default function HeartButton({
  car,
  size = 'md',
  className = '',
}: {
  car: GarageCar;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const [fav, setFav] = useState(false);
  const [pop, setPop] = useState(false);

  // 찜 여부는 브라우저에 있으므로 화면에 붙은 뒤 읽는다(서버 렌더와 어긋나지 않게)
  useEffect(() => {
    setFav(isFavorite(car.id));
    const sync = () => setFav(isFavorite(car.id));
    window.addEventListener('carvior-garage', sync);
    return () => window.removeEventListener('carvior-garage', sync);
  }, [car.id]);

  const box = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const icon = size === 'sm' ? 16 : 20;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavorite(car));
        setPop(true);
        setTimeout(() => setPop(false), 220);
      }}
      aria-label={fav ? '찜 해제' : '찜하기'}
      className={`${box} rounded-full bg-white/90 hover:bg-white border border-slate-200/70 shadow-sm flex items-center justify-center transition-transform ${pop ? 'scale-125' : 'scale-100'} ${className}`}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill={fav ? '#7c3aed' : 'none'}
        stroke={fav ? '#7c3aed' : '#cbd5e1'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
