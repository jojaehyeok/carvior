'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InspectionPromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('inspection_popup_dismissed_at');
    if (!stored) { setVisible(true); return; }
    const daysSince = (Date.now() - Number(stored)) / 86400000;
    if (daysSince >= 1) setVisible(true);
  }, []);

  const dismissForWeek = () => {
    localStorage.setItem('inspection_popup_dismissed_at', String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[200] sm:left-6 sm:right-auto sm:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">🔍</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-base leading-tight">검차받고 빠르게 팔자</p>
            <p className="text-violet-200 text-xs mt-0.5">공인진단 매물은 3배 빠르게 판매됩니다</p>
          </div>
          <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white transition-colors shrink-0 text-xl leading-none">×</button>
        </div>

        {/* 내용 */}
        <div className="px-5 py-4">
          <div className="space-y-2.5 mb-4">
            {[
              '공인 평가사 직접 방문 점검',
              '100+ 항목 진단 · 디지털 리포트',
              '해외 바이어 신뢰도 3배 상승',
            ].map(text => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-amber-500 font-black shrink-0">✦</span>
                {text}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 bg-gray-50 rounded-xl px-3 py-3 mb-4">
            <span className="text-sm font-bold text-gray-600">검차 서비스 요금</span>
            <span className="font-black text-violet-600 text-base whitespace-nowrap">
              110,000원~ <span className="text-xs font-normal text-gray-400">VAT 포함 · 차종별 상이</span>
            </span>
          </div>

          <Link
            href="/inspection"
            onClick={() => setVisible(false)}
            className="block w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors mb-2"
          >
            지금 검차 신청하기 →
          </Link>
          <Link
            href="/marketing/carvior-inspection"
            onClick={() => setVisible(false)}
            className="block w-full text-center text-xs text-gray-400 hover:text-violet-500 transition-colors mb-3"
          >
            서비스 자세히 보기
          </Link>

          <div className="flex items-center justify-center gap-3">
            <button onClick={dismissForWeek} className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
              하루간 보지않기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
