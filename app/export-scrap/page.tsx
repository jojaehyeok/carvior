'use client';

import { useState } from 'react';

const REASONS = [
  { icon: '🌏', title: '수출업자에게 직접 연결', desc: '해외 바이어 네트워크를 보유한 수출업자에게 차량 정보를 전달, 국내 시세보다 높은 매입가를 받을 수 있어요.' },
  { icon: '♻️', title: '폐차도 제값 받고', desc: '단순 폐차가 아니라 부품·고철 시세까지 반영한 매입 견적을 여러 폐차업체로부터 비교받아요.' },
  { icon: '⚡', title: '빠른 견적 · 무료', desc: '차량 정보만 남기면 영업일 1~2일 내 담당자가 연락드려요. 신청 비용은 전혀 없습니다.' },
];

const TYPE_OPTIONS = ['수출', '폐차', '둘 다 상관없이 높은 곳으로'];

export default function ExportScrapPage() {
  const [form, setForm] = useState({
    name: '', contact: '', carModel: '', year: '', mileage: '', region: '', type: TYPE_OPTIONS[2], memo: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact || !form.carModel) {
      alert('이름, 연락처, 차종은 필수입니다.');
      return;
    }
    setLoading(true);
    try {
      await fetch('https://carvior.store/api/v1/external/buyer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'EXPORT_SCRAP_QUOTE',
          carOwner: form.name,
          address: form.region,
          preferredDateTime: '-',
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
          <span className="font-bold text-white">{form.name}</span>님, 접수가 완료됐습니다.
        </p>
        <p className="text-zinc-400 text-sm">수출업자·폐차업체 견적을 취합해 영업일 기준 1~2일 내 연락드립니다.</p>
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
            수출 · 폐차 견적 무료 신청
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight">
            안 팔리는 내 차,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">
              수출 · 폐차 견적
            </span>
            으로 받아보세요
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            연식이 오래됐거나 국내 판매가 어려운 차량도 괜찮아요.<br />
            카비어 네트워크의 수출업자 · 폐차업체가 직접 견적을 드립니다.
          </p>
          <a
            href="#apply"
            className="inline-block bg-violet-600 text-white font-black px-10 py-4 rounded-2xl text-base hover:bg-violet-700 transition-all active:scale-[0.98] shadow-2xl shadow-violet-900/40"
          >
            무료 견적 신청하기
          </a>
        </div>
      </section>

      {/* 이유 */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">왜 카비어인가요</p>
          <h2 className="text-2xl font-black text-white mb-10">중고차 시장에서 안 팔려도<br />여전히 가치가 있어요</h2>
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
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">견적 신청</p>
            <h2 className="text-2xl font-black text-white mb-2">차량 정보를 남겨주세요</h2>
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
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">
                  차종 <span className="text-red-400">*</span>
                </label>
                <input
                  required name="carModel" value={form.carModel} onChange={handleChange}
                  placeholder="예: 쏘나타 뉴라이즈"
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-bold mb-1.5 block">연식</label>
                  <input
                    name="year" value={form.year} onChange={handleChange}
                    placeholder="예: 2015년"
                    className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-bold mb-1.5 block">주행거리</label>
                  <input
                    name="mileage" value={form.mileage} onChange={handleChange}
                    placeholder="예: 12만km"
                    className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">차량 소재지</label>
                <input
                  name="region" value={form.region} onChange={handleChange}
                  placeholder="예: 경기도 안산시"
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold placeholder:text-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">희망 유형</label>
                <select
                  name="type" value={form.type} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold transition-colors"
                >
                  {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">추가 전달사항</label>
                <textarea
                  name="memo" value={form.memo} onChange={handleChange}
                  rows={3}
                  placeholder="사고이력, 침수여부 등 참고할 내용이 있으면 적어주세요"
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl outline-none text-white resize-none text-sm placeholder:text-zinc-600 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl text-base font-black transition-all bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-violet-900/30"
            >
              {loading ? '제출 중...' : '무료 견적 신청하기 →'}
            </button>
            <p className="text-center text-zinc-600 text-[11px]">상담 무료 · 영업일 1~2일 내 연락 · 010-2285-6017</p>
          </form>
        </div>
      </section>

    </main>
  );
}
