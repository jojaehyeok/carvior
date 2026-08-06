'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STEPS = ['매칭실패 매물', '카비어 스마트옥션', '추가 매입 기회'];

const FEATURES = [
  { icon: '💰', label: '추가 수익 창출' },
  { icon: '🇰🇷', label: '전국 딜러 참여' },
  { icon: '🔗', label: '간편한 연동' },
  { icon: '🔒', label: '투명한 거래' },
];

export default function DealerPartnershipPopup() {
  const [visible, setVisible] = useState(false);

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

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] sm:left-6 sm:right-auto sm:w-96">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl shrink-0">🔨</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-base leading-tight">딜러 제휴 파트너십</p>
            <p className="text-purple-200 text-xs mt-0.5">매칭되지 않은 매물, 새로운 가치로 만드세요</p>
          </div>
          <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white transition-colors shrink-0 text-xl leading-none">×</button>
        </div>

        {/* 내용 */}
        <div className="px-5 py-4">
          {/* 3단계 플로우 */}
          <div className="flex items-center justify-between gap-1 mb-4 bg-white/5 border border-white/10 rounded-xl px-3 py-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white/70 text-center leading-tight flex-1">{s}</p>
                {i < STEPS.length - 1 && (
                  <span className="text-purple-400 text-xs shrink-0 mx-0.5">→</span>
                )}
              </div>
            ))}
          </div>

          {/* 기능 2x2 그리드 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2">
                <span className="text-base shrink-0">{f.icon}</span>
                <span className="text-[11px] font-bold text-white/80 leading-tight">{f.label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/auction"
            onClick={() => setVisible(false)}
            className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors mb-2 shadow-lg shadow-purple-900/40"
          >
            제휴 문의하기 →
          </Link>

          <div className="flex items-center justify-center gap-3">
            <button onClick={dismissForDay} className="text-xs text-white/30 hover:text-white/60 transition-colors">
              하루간 보지않기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
