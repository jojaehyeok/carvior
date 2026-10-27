'use client';

// 홈 하단 "공지사항 / 자주 묻는 질문" — 거래 사이트에서 사람들이 가장 먼저 찾는 두 가지다.
// 공지는 /notice에 쌓이고, 여기엔 최근 것만 제목으로 건다.

import Link from 'next/link';
import { useState } from 'react';

const NOTICES = [
  { title: '카비어 법인전환 안내', date: '2026.10.28', href: '/notice' },
];

const FAQS = [
  {
    tag: '거래',
    q: '중개 수수료가 정말 없나요?',
    a: '네. 개인 간 직거래 연결에는 수수료를 받지 않습니다. 카비어는 차량 진단(검차) 서비스로 운영됩니다.',
  },
  {
    tag: '거래',
    q: '차량 상태는 어떻게 믿나요?',
    a: '개인 매물은 판매자가 올린 정보입니다. 계약 전에 카비어 검차를 받으시면 진단평가사가 직접 방문해 상태를 확인하고 리포트를 드립니다.',
  },
  {
    tag: '판매',
    q: '내 차를 올리려면 어떻게 하나요?',
    a: '차량번호와 사진을 올리면 카비어가 검토한 뒤 매물로 공개됩니다. 등록비는 없습니다.',
  },
  {
    tag: '검차',
    q: '검차 비용은 얼마인가요?',
    a: '국산 99,000원 / 수입 132,000원입니다. 진단평가사가 차량이 있는 곳으로 직접 방문합니다.',
  },
];

export default function NoticeAndFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 공지사항 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <p className="font-black text-gray-900">공지사항</p>
            <Link href="/notice" className="text-xs font-bold text-gray-400 hover:text-violet-600">
              더보기 →
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {NOTICES.map((n) => (
              <li key={n.title}>
                <Link href={n.href} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700 truncate">{n.title}</span>
                  <span className="text-xs text-gray-400 shrink-0">{n.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 자주 묻는 질문 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="font-black text-gray-900">자주 묻는 질문</p>
          </div>
          <ul className="divide-y divide-gray-50">
            {FAQS.map((f, i) => (
              <li key={f.q}>
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-start gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[10px] font-black text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                    {f.tag}
                  </span>
                  <span className="flex-1 text-sm text-gray-700">{f.q}</span>
                  <span className="text-gray-300 shrink-0">{openIdx === i ? '−' : '+'}</span>
                </button>
                {openIdx === i && (
                  <p className="px-6 pb-4 pl-[4.25rem] text-[13px] leading-relaxed text-gray-500">{f.a}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
