'use client';

import Link from 'next/link';


const SELL_DIAGNOSIS_URL = '/marketing/carvior-inspection';

export default function SellPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">차량 판매</p>
          <h1 className="text-3xl font-black text-white">내 차 팔기</h1>
          <p className="text-zinc-400 text-sm mt-1.5">진단 완료 후 카비어 플랫폼에 매물을 올려드립니다.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* 판매 흐름 안내 */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-2">
          {[
            { step: '1', label: '진단 신청' },
            { step: '2', label: '현장 방문 진단' },
            { step: '3', label: '리포트 발행' },
            { step: '4', label: '카비어 스토어 등록' },
            { step: '5', label: '딜러 매칭 · 판매' },
          ].map((s, i, arr) => (
            <div key={s.step} className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">
                  {s.step}
                </div>
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 h-px bg-gray-200 shrink-0 mb-4" />
              )}
            </div>
          ))}
        </div>

        {/* 판매 옵션 카드 2개 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* 옵션 1: 진단사 방문 신청 */}
          <div className="flex flex-col rounded-2xl border-2 border-black overflow-hidden">
            <div className="bg-black p-6 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div className="inline-block bg-white/10 text-white/60 text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full mb-3">
                일반 판매
              </div>
              <h2 className="text-xl font-black text-white mb-2">진단사 방문 신청</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                공인 진단사가 직접 방문해<br />
                차량을 꼼꼼히 검사합니다.<br />
                허위매물 없는 투명한 판매.
              </p>
            </div>
            <div className="bg-black border-t border-white/10 p-4">
              <ul className="space-y-2 mb-5">
                {['공인 진단서 발급', '딜러 매칭 서비스', '빠른 판매 가능', '무료 시세 산정'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <svg width="14" height="14" fill="none" stroke="#a78bfa" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={SELL_DIAGNOSIS_URL}
                className="block w-full text-center bg-white text-black font-black py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
              >
                진단 신청하기 →
              </Link>
            </div>
          </div>

          {/* 옵션 2: 셀프 등록 (딜러 전용) */}
          <div className="flex flex-col rounded-2xl border-2 border-purple-200 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 flex-1">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <svg width="20" height="20" fill="none" stroke="#7c3aed" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-block bg-purple-100 text-purple-600 text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full">
                  딜러 전용
                </div>
                <div className="inline-block bg-purple-600 text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full">
                  셀프 등록
                </div>
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">셀프 매물 등록</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                딜러 파트너는 직접 매물을<br />
                등록할 수 있습니다.<br />
                딜러 코드가 필요합니다.
              </p>
            </div>
            <div className="bg-white border-t border-purple-100 p-4">
              <ul className="space-y-2 mb-5">
                {['직접 매물 작성', '사진 직접 업로드', '가격 자율 설정', '딜러 배지 노출'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <svg width="14" height="14" fill="none" stroke="#7c3aed" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sell/register"
                className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl text-sm transition-colors"
              >
                셀프 등록하기 →
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            판매 전 꼭 확인하세요
          </h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• 카비어는 진단이 완료된 차량만 스토어에 등록됩니다.</li>
            <li>• 진단 미완료 차량은 매물 등록이 불가합니다.</li>
            <li>• 딜러 셀프 등록은 어드민 검토 후 최종 노출됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
