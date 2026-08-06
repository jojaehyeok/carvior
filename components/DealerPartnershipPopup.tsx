'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const STEPS = ['매칭실패 매물', '카비어 스마트옥션', '추가 매입 기회'];

const FEATURES = [
  { icon: '💰', label: '추가 수익' },
  { icon: '🇰🇷', label: '전국 딜러' },
  { icon: '🔗', label: '간편 연동' },
  { icon: '🔒', label: '투명 거래' },
];

export default function DealerPartnershipPopup() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dealer_popup_dismissed_at');
    if (!stored) { setVisible(true); return; }
    const daysSince = (Date.now() - Number(stored)) / 86400000;
    if (daysSince >= 1) setVisible(true);
  }, []);

  const dismissForDay = () => {
    localStorage.setItem('dealer_popup_dismissed_at', String(Date.now()));
    setVisible(false);
  };

  const clamp = (x: number, y: number) => {
    const el = cardRef.current;
    if (!el) return { x, y };
    const rect = el.getBoundingClientRect();
    const baseLeft = rect.left - x;
    const baseTop = rect.top - y;
    const minX = -baseLeft + 8;
    const maxX = window.innerWidth - baseLeft - rect.width - 8;
    const minY = -baseTop + 8;
    const maxY = window.innerHeight - baseTop - rect.height - 8;
    return { x: Math.min(Math.max(x, minX), maxX), y: Math.min(Math.max(y, minY), maxY) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos(clamp(dragRef.current.origX + dx, dragRef.current.origY + dy));
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setDragging(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed z-[200] left-4 right-4 bottom-4 sm:left-6 sm:right-auto sm:bottom-6 sm:w-[560px]"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div
        ref={cardRef}
        className="bg-zinc-900 rounded-xl shadow-2xl border border-purple-500/20 overflow-hidden select-none"
      >
        {/* 창 타이틀바 (드래그 핸들) */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`flex items-center gap-2 px-3.5 py-2.5 bg-white/5 border-b border-white/10 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <p className="flex-1 text-center text-[11px] font-bold text-white/40 truncate">carvior.store/auction</p>
          <button onClick={() => setVisible(false)} className="text-white/40 hover:text-white transition-colors shrink-0 text-base leading-none px-1">×</button>
        </div>

        {/* 내용: 가로형 */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-xl shrink-0">🔨</div>

          <div className="shrink-0 max-w-[150px]">
            <p className="text-white font-black text-sm leading-tight">딜러 제휴 파트너십</p>
            <p className="text-white/40 text-[11px] mt-0.5 leading-tight">매칭실패 매물, 새 가치로</p>
          </div>

          {/* 3단계 플로우 */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center min-w-0">
                <span className="text-[10px] font-bold text-white/70 whitespace-nowrap">{s}</span>
                {i < STEPS.length - 1 && <span className="text-purple-400 text-xs shrink-0 mx-1.5">→</span>}
              </div>
            ))}
          </div>

          {/* 기능 아이콘 */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {FEATURES.map(f => (
              <span key={f.label} title={f.label} className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-sm">
                {f.icon}
              </span>
            ))}
          </div>

          <Link
            href="/auction"
            onClick={() => setVisible(false)}
            className="shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-2.5 px-4 rounded-lg text-xs text-center transition-colors shadow-lg shadow-purple-900/40 whitespace-nowrap"
          >
            제휴 문의 →
          </Link>
        </div>

        <div className="flex items-center justify-center pb-2.5">
          <button onClick={dismissForDay} className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
            하루간 보지않기
          </button>
        </div>
      </div>
    </div>
  );
}
