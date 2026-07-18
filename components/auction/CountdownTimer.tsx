'use client';

import { useEffect, useState } from 'react';

// 48h~72h 사이를 흘러가는 실시간 카운트다운 — 초 단위로 직접 업데이트
export default function CountdownTimer({ endAt, size = 32 }: { endAt?: string; size?: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!endAt) return <span className="text-xs font-bold text-gray-400">마감</span>;

  const diff = new Date(endAt).getTime() - now;
  if (diff <= 0) return <span className="text-xs font-bold text-gray-400">마감</span>;

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const parts = [
    days > 0 ? { value: String(days), unit: '일' } : null,
    { value: days > 0 ? pad(hours) : String(hours), unit: '시간' },
    { value: pad(minutes), unit: '분' },
    { value: pad(seconds), unit: '초' },
  ].filter(Boolean) as { value: string; unit: string }[];

  return (
    <span className="inline-flex items-baseline gap-1.5 flex-wrap tabular-nums">
      {parts.map(p => (
        <span key={p.unit} className="inline-flex items-baseline gap-0.5">
          <span style={{ fontSize: size, lineHeight: 1 }} className="font-black text-violet-600">
            {p.value}
          </span>
          <span className="text-xs font-bold text-gray-400">{p.unit}</span>
        </span>
      ))}
    </span>
  );
}
