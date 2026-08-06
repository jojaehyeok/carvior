'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const FEATURES = [
  { icon: '📋', label: '100+ 항목 점검' },
  { icon: '🚗', label: '사고·누유·하부 확인' },
  { icon: '📄', label: '사진·PDF 리포트' },
  { icon: '📍', label: '매물 위치로 방문' },
];

export default function InspectionPromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('inspection_popup_dismissed_at');
    if (!stored) { setVisible(true); return; }
    const daysSince = (Date.now() - Number(stored)) / 86400000;
    if (daysSince >= 1) setVisible(true);
  }, []);

  const dismissForDay = () => {
    localStorage.setItem('inspection_popup_dismissed_at', String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="hidden sm:block fixed top-20 left-6 z-[200] w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">🔍</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-base leading-tight">중고차 구매 전, 전문가 출장검차</p>
            <p className="text-violet-200 text-xs mt-0.5">한 번의 진단으로 큰 손해를 막으세요</p>
          </div>
        </div>

        {/* 내용 */}
        <div className="px-5 py-4">
          {/* 기능 2x2 그리드 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-center gap-2 bg-violet-50 rounded-lg px-2.5 py-2">
                <span className="text-base shrink-0">{f.icon}</span>
                <span className="text-[11px] font-bold text-gray-700 leading-tight">{f.label}</span>
              </div>
            ))}
          </div>

          {/* 프로모션 가격 */}
          <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-b from-violet-50 to-white px-3 py-3 mb-4">
            <p className="text-center text-[11px] font-black text-violet-600 mb-2">🎉 지금이 기회! 프로모션 가격</p>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 text-center">
                <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1">국산차</span>
                <p className="text-xl font-black text-gray-900 leading-none">99,000<span className="text-xs font-bold">원</span></p>
                <p className="text-[10px] text-gray-400 mt-0.5">VAT 포함</p>
              </div>
              <div className="w-px bg-violet-100" />
              <div className="flex-1 text-center">
                <span className="inline-block text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mb-1">수입차</span>
                <p className="text-xl font-black text-gray-900 leading-none">132,000<span className="text-xs font-bold">원</span></p>
                <p className="text-[10px] text-gray-400 mt-0.5">VAT 포함</p>
              </div>
            </div>
          </div>

          <Link
            href="/inspection"
            onClick={() => setVisible(false)}
            className="block w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors mb-2 shadow-lg shadow-violet-200"
          >
            지금 검차 신청하기 →
          </Link>
          <Link
            href="/marketing/carvior-inspection"
            onClick={() => setVisible(false)}
            className="block w-full text-center text-xs text-gray-400 hover:text-violet-500 transition-colors"
          >
            서비스 자세히 보기
          </Link>
        </div>

        {/* 하단 바: 다시 보지 않기 | 닫기 */}
        <div className="flex items-stretch border-t border-gray-100">
          <button onClick={dismissForDay} className="flex-1 text-xs font-bold text-gray-400 hover:text-gray-600 py-2.5 transition-colors">
            다시 보지 않기
          </button>
          <button onClick={() => setVisible(false)} className="w-11 flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white/70 hover:text-white transition-colors text-base">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
