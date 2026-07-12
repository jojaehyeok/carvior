'use client';

import Link from 'next/link';


const ROADMAP = [
  { label: '보험개발원 API 연동',   desc: '국내 자동차 보험 통계 데이터 기반 시세 산출',  status: 'wip' },
  { label: '실거래가 빅데이터 분석', desc: '최근 3개월 실거래 데이터 반영 시세 모델',      status: 'planned' },
  { label: '진단 리포트 연동 시세',  desc: '카비어 진단 데이터 기반 실시간 감가 반영',     status: 'planned' },
  { label: '딜러 입찰가 반영',       desc: '실제 딜러 입찰 데이터 기반 시세 보정',         status: 'planned' },
];

const STATUS_MAP = {
  wip:     { label: '개발중',  cls: 'bg-amber-100 text-amber-700' },
  planned: { label: '예정',    cls: 'bg-gray-100 text-gray-500'   },
  done:    { label: '완료',    cls: 'bg-green-100 text-green-700'  },
};

export default function PricePage() {
  return (
    <div className="min-h-screen bg-white">


      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        {/* 아이콘 */}
        <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-8">
          <svg width="36" height="36" fill="none" stroke="#6b7280" strokeWidth={1.5} viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>

        {/* 타이틀 */}
        <div className="inline-block bg-amber-100 text-amber-700 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-5">
          준비중
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">내 차 시세 조회</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-10">
          보험개발원 API 연동을 진행 중입니다.<br />
          실거래가 기반 중고차 시세 조회 서비스가 곧 제공됩니다.
        </p>

        {/* 로드맵 */}
        <div className="text-left bg-gray-50 border border-gray-100 rounded-2xl divide-y divide-gray-100 mb-10">
          {ROADMAP.map(item => {
            const s = STATUS_MAP[item.status as keyof typeof STATUS_MAP];
            return (
              <div key={item.label} className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* 임시 대안 */}
        <div className="bg-black text-white rounded-2xl p-6 text-left">
          <p className="text-xs font-black tracking-widest uppercase text-white/40 mb-2">지금 바로</p>
          <h2 className="text-lg font-black mb-1.5">무료 시세 산정 받기</h2>
          <p className="text-white/50 text-sm mb-5">
            진단사가 직접 방문해 차량을 확인하고<br />
            정확한 시세를 알려드립니다.
          </p>
          <Link
            href="/marketing/carvior-inspection"
            className="inline-block bg-white text-black font-black px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
          >
            무료 시세 산정 신청 →
          </Link>
        </div>

        <p className="text-gray-400 text-xs mt-8">
          서비스 출시 알림을 원하신다면{' '}
          <a href="mailto:info@carvior.store" className="text-gray-600 underline underline-offset-2">
            info@carvior.store
          </a>
          로 문의해 주세요.
        </p>
      </div>
    </div>
  );
}
