'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InspectionPromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('inspection_popup_dismissed_at');
    if (!stored) { setVisible(true); return; }
    const daysSince = (Date.now() - Number(stored)) / 86400000;
    if (daysSince >= 7) setVisible(true);
  }, []);

  const dismissForWeek = () => {
    localStorage.setItem('inspection_popup_dismissed_at', String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setVisible(false)} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 to-violet-900 px-6 pt-8 pb-12 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-violet-200 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">카비어 공인 서비스</p>
          <h2 className="text-white font-black text-2xl leading-tight">
            내 차 상태<br />확실히 알고 팔자
          </h2>
        </div>

        <div className="relative -mt-6 bg-white rounded-t-3xl px-6 pt-6 pb-6">
          <div className="space-y-2.5 mb-5">
            {[
              '공인 평가사 직접 방문 점검',
              '30개 항목 정밀 진단 리포트',
              '해외 바이어 신뢰도 상승',
            ].map(text => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-violet-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 mb-5">
            <span className="text-sm font-bold text-gray-700">검차 서비스 요금</span>
            <span className="font-black text-violet-600 text-lg">80,000원</span>
          </div>

          <Link
            href="/inspection"
            onClick={() => setVisible(false)}
            className="block w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-xl text-sm text-center transition-colors mb-3"
          >
            지금 검차 신청하기 →
          </Link>

          <div className="flex items-center justify-center gap-4">
            <button onClick={dismissForWeek} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              일주일간 보지않기
            </button>
            <span className="text-gray-200">|</span>
            <button onClick={() => setVisible(false)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
