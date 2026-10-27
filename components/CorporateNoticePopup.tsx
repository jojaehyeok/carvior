'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 법인전환 안내 — 검차 프로모션·딜러 제휴 팝업과 같은 틀(상단 헤더 / 내용 / 하단 바)을 쓴다.
// 사업자 정보가 바뀐 건 거래 상대방이 알아야 하는 내용이라 당분간 홈에 띄워둔다.
const INFO = [
  { label: '법인명', value: '카비어 주식회사' },
  { label: '영문명', value: 'CarVior Corp.' },
  { label: '사업자등록번호', value: '889-81-03879' },
];

export default function CorporateNoticePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('corporate_notice_dismissed_at');
    if (!stored) { setVisible(true); return; }
    const daysSince = (Date.now() - Number(stored)) / 86400000;
    if (daysSince >= 1) setVisible(true);
  }, []);

  const dismissForDay = () => {
    localStorage.setItem('corporate_notice_dismissed_at', String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-80 shrink-0 bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col">
      {/* 상단 헤더 */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl shrink-0">🏢</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base leading-tight">카비어 법인전환 안내</p>
          <p className="text-blue-200 text-xs mt-0.5">사업자 정보가 아래와 같이 변경되었습니다</p>
        </div>
      </div>

      {/* 내용 */}
      <div className="px-5 py-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[13px] leading-relaxed text-gray-600 mb-3">
            카비어를 이용해 주시는 고객 여러분께 감사드립니다.<br />
            카비어가 법인으로 전환되어 사업자 정보를 안내드립니다.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 space-y-2">
            {INFO.map((row) => (
              <div key={row.label} className="flex items-baseline gap-3">
                <span className="text-[11px] font-bold text-blue-700 w-24 shrink-0">{row.label}</span>
                <span className="text-[13px] font-black text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>

          <p className="text-[12px] leading-relaxed text-gray-500 mb-4">
            서비스 이용 방법과 기존 계약·예약은 전과 동일하게 유지됩니다.
            변함없는 관심과 성원 부탁드립니다.
          </p>
        </div>

        <Link
          href="/notice"
          onClick={() => setVisible(false)}
          className="block w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors shadow-lg shadow-blue-900/30"
        >
          공지 자세히 보기 →
        </Link>
      </div>

      {/* 하단 바: 오늘 하루 보지 않기 | 닫기 */}
      <div className="flex items-stretch border-t border-gray-100">
        <button onClick={dismissForDay} className="flex-1 text-xs font-bold text-gray-400 hover:text-gray-600 py-2.5 transition-colors">
          오늘 하루 보지 않기
        </button>
        <button onClick={() => setVisible(false)} className="w-11 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors text-base">
          ×
        </button>
      </div>
    </div>
  );
}
