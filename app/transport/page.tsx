'use client';

import { useState } from 'react';

const REASONS = [
  { icon: '🚚', title: '전국 탁송 네트워크', desc: '출발지·도착지 어디든 검증된 탁송 기사님이 안전하게 이동해드려요.' },
  { icon: '📋', title: '차량 상태 인계 확인', desc: '출발 전·도착 후 차량 상태를 확인해서 분쟁 없이 인계해드려요.' },
  { icon: '⚡', title: '빠른 견적 · 무료 상담', desc: '차량·출발지·도착지만 남기면 영업일 1~2일 내 담당자가 연락드려요.' },
];

export default function TransportPage() {
  const [form, setForm] = useState({
    name: '', contact: '', carNumber: '', origin: '', destination: '', preferredDateTime: '', memo: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact || !form.origin || !form.destination) {
      alert('이름, 연락처, 출발지, 도착지는 필수입니다.');
      return;
    }
    setLoading(true);
    try {
      const memoLines = [
        form.carNumber ? `차량번호: ${form.carNumber}` : null,
        `도착지: ${form.destination}`,
        form.memo ? `전달사항: ${form.memo}` : null,
      ].filter(Boolean).join(' / ');

      await fetch('https://carvior.store/api/v1/external/buyer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'CARVIOR_TRANSPORT',
          buyerName: form.name,
          contact: form.contact,
          address: form.origin,
          preferredDateTime: form.preferredDateTime || '미정',
          additionalMemo: memoLines,
          privacyAgreed: true,
        }),
      });
      setSubmitted(true);
    } catch {
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-2xl mb-6">✓</div>
        <h2 className="text-2xl font-black text-white mb-3">신청 완료</h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-2">
          <span className="font-bold text-white">{form.name}</span>님, 탁송 신청이 접수됐습니다.
        </p>
        <p className="text-zinc-400 text-sm">담당자가 영업일 기준 1~2일 내 연락드려 일정과 비용을 안내해드려요.</p>
        <p className="text-xs text-zinc-600 mt-8">문의 · 010-2285-6017</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* 히어로 */}
      <section className="relative px-6 pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-zinc-700 rounded-full px-4 py-1.5 text-[11px] font-bold text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            탁송 상담 무료 신청
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight">
            내 차 이동,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">
              탁송
            </span>
            으로 편하게
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            출발지·도착지·희망일만 남겨주시면<br />
            담당자가 확인 후 일정과 비용을 안내해드려요.
          </p>
          <a
            href="#apply"
            className="inline-block bg-violet-600 text-white font-black px-10 py-4 rounded-2xl text-base hover:bg-violet-700 transition-all active:scale-[0.98] shadow-2xl shadow-violet-900/40"
          >
            탁송 신청하기
          </a>
        </div>
      </section>

      {/* 이유 */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">왜 카비어 탁송인가요</p>
          <h2 className="text-2xl font-black text-white mb-10">차량 이동, 믿고 맡길 수 있어요</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REASONS.map(r => (
              <div key={r.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <span className="text-2xl mb-3 block">{r.icon}</span>
                <h3 className="text-sm font-black text-white mb-1.5">{r.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 신청 폼 */}
      <section id="apply" className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">탁송 신청</p>
            <h2 className="text-2xl font-black text-white mb-2">출발지·도착지를 남겨주세요</h2>
            <p className="text-zinc-500 text-sm">상담 무료 · 영업일 1~2일 내 연락</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">신청자 정보</p>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">
                  이름 <span className="text-red-400">*</span>
                </label>
                <input
                  required name="name" value={form.name} onChange={handleChange}
                  placeholder="홍길동"
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">
                  연락처 <span className="text-red-400">*</span>
                </label>
                <input
                  required name="contact" value={form.contact} onChange={handleChange}
                  placeholder="010-0000-0000" type="tel"
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">차량번호</label>
                <input
                  name="carNumber" value={form.carNumber} onChange={handleChange}
                  placeholder="예: 12가3456"
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">
                  출발지 <span className="text-red-400">*</span>
                </label>
                <input
                  required name="origin" value={form.origin} onChange={handleChange}
                  placeholder="예: 경기도 안산시 단원구 ..."
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">
                  도착지 <span className="text-red-400">*</span>
                </label>
                <input
                  required name="destination" value={form.destination} onChange={handleChange}
                  placeholder="예: 서울특별시 강남구 ..."
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">희망 일시</label>
                <input
                  name="preferredDateTime" value={form.preferredDateTime} onChange={handleChange}
                  placeholder="예: 2026-08-15 오전 중"
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">추가 전달사항</label>
                <textarea
                  name="memo" value={form.memo} onChange={handleChange}
                  rows={3}
                  placeholder="차량 상태, 주차 위치 등 참고할 내용이 있으면 적어주세요"
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl outline-none text-white resize-none text-sm placeholder:text-zinc-600 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl text-base font-black transition-all bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-violet-900/30"
            >
              {loading ? '제출 중...' : '탁송 신청하기 →'}
            </button>
            <p className="text-center text-zinc-600 text-[11px]">상담 무료 · 영업일 1~2일 내 연락 · 010-2285-6017</p>
          </form>
        </div>
      </section>

    </main>
  );
}
