'use client';

import { useState } from 'react';

const BENEFITS = [
  { icon: '💰', title: '건당 수익 정산', desc: '진단 1건당 수익 직접 정산. 많이 할수록 많이 버는 구조.' },
  { icon: '📅', title: '자유로운 일정', desc: '원하는 날, 원하는 시간에 직접 예약을 수락. 부업으로도 가능.' },
  { icon: '📱', title: '전용 앱 제공', desc: '예약 관리, 진단 리포트 작성, 정산 확인을 앱 하나로 처리.' },
  { icon: '🧑‍🏫', title: '카비어 교육 지원', desc: '리포트 작성법, 고객 응대, 검차 기준까지 온보딩 교육 제공.' },
  { icon: '📊', title: '실적 기반 등급제', desc: '누적 진단 건수와 평점에 따라 우선 배정 및 인센티브 지급.' },
  { icon: '🤝', title: '전속 아닌 파트너', desc: '다른 플랫폼과 병행 가능. 전속 계약 없이 자유롭게 활동.' },
];

const STEPS = [
  { num: '01', title: '신청서 제출', desc: '아래 폼을 작성해 제출해주세요. 자격증 없어도 신청 가능합니다.' },
  { num: '02', title: '서류 검토 & 연락', desc: '담당자가 영업일 1~2일 내 검토 후 연락드립니다.' },
  { num: '03', title: '온보딩 교육', desc: '카비어 진단 기준, 리포트 작성법, 앱 사용법을 교육받습니다.' },
  { num: '04', title: '활동 시작', desc: '교육 수료 후 바로 예약을 수락하고 진단 활동을 시작합니다.' },
];

const FAQS = [
  { q: '자동차 관련 자격증이 없어도 지원할 수 있나요?', a: '네, 자격증이 없어도 지원 가능합니다. 자동차 관련 경험(정비, 딜러, 경매 등)이 있다면 우대합니다. 자격증 보유자도 환영합니다.' },
  { q: '전업이 아닌 부업으로도 가능한가요?', a: '네. 카비어는 전속 계약을 요구하지 않습니다. 현재 하시는 일과 병행해 주말이나 공강 시간에 자유롭게 활동하실 수 있습니다.' },
  { q: '수익은 얼마나 되나요?', a: '진단 1건당 기본 수익은 활동 등급과 지역에 따라 달라집니다. 온보딩 시 구체적인 수익 구조를 안내드립니다. 월 20건 이상 진단하시는 파트너분들도 계십니다.' },
  { q: '어느 지역에서 활동할 수 있나요?', a: '현재 경기도(수원, 안산, 고양, 화성 등)와 인천 지역을 중심으로 파트너를 모집 중입니다. 서울 및 기타 지역도 순차적으로 확대할 예정입니다.' },
  { q: '진단 장비는 직접 구매해야 하나요?', a: '기본 진단에 필요한 앱은 무료로 제공됩니다. 전자식 스캐너 등 장비 보유 시 더 다양한 진단이 가능하며, 장비 구매 지원 프로그램도 운영 중입니다.' },
];

export default function RecruitPage() {
  const [form, setForm] = useState({
    name: '', contact: '', region: '', career: '', license: '', memo: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact || !form.region) {
      alert('이름, 연락처, 활동 희망 지역은 필수입니다.');
      return;
    }
    setLoading(true);
    try {
      await fetch('https://carvior.store/api/v1/external/buyer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'EVALUATOR_RECRUIT',
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
        <p className="text-zinc-400 text-sm">담당자가 영업일 기준 1~2일 내 연락드립니다.</p>
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
            진단 평가사 파트너 모집 중
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight">
            자동차를 좋아한다면<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">
              카비어 진단 평가사
            </span>
            로 활동하세요
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            경험만 있으면 됩니다. 자격증 없어도 지원 가능.<br />
            진단하고, 수익 받고, 자유롭게 일합니다.
          </p>
          <a
            href="#apply"
            className="inline-block bg-violet-600 text-white font-black px-10 py-4 rounded-2xl text-base hover:bg-violet-700 transition-all active:scale-[0.98] shadow-2xl shadow-violet-900/40"
          >
            지금 신청하기
          </a>
        </div>
      </section>

      {/* 숫자 */}
      <section className="border-y border-zinc-800 py-10">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { value: '건당', sub: '수익 직접 정산' },
            { value: '자유', sub: '일정 직접 조율' },
            { value: '전속 없음', sub: '병행 활동 가능' },
          ].map(item => (
            <div key={item.value}>
              <p className="text-xl font-black text-white mb-1">{item.value}</p>
              <p className="text-[11px] text-zinc-500 font-bold">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 혜택 */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">파트너 혜택</p>
          <h2 className="text-2xl font-black text-white mb-10">카비어 진단 평가사로<br />활동하면 이런 점이 좋아요</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <span className="text-2xl mb-3 block">{b.icon}</span>
                <h3 className="text-sm font-black text-white mb-1.5">{b.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 활동 과정 */}
      <section className="py-16 px-6 bg-zinc-900/50">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">활동 과정</p>
          <h2 className="text-2xl font-black text-white mb-10">이렇게 시작합니다</h2>
          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                    {s.num}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-zinc-800 my-1.5 min-h-[20px]" />}
                </div>
                <div className="pb-1">
                  <h3 className="text-sm font-black text-white mb-1">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 지원 자격 */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">지원 자격</p>
          <h2 className="text-2xl font-black text-white mb-8">이런 분이라면 지원하세요</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            {[
              { ok: true,  text: '자동차 관련 경험이 있는 분 (정비, 딜러, 경매, 튜닝 등)' },
              { ok: true,  text: '자동차 진단 관련 자격증 보유자 (우대)' },
              { ok: true,  text: '스마트폰 앱을 능숙하게 사용할 수 있는 분' },
              { ok: true,  text: '고객 응대가 가능하고 책임감 있게 활동할 수 있는 분' },
              { ok: false, text: '자동차 매매업(딜러) 현직 종사자는 이해충돌로 제한됩니다' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${item.ok ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {item.ok ? '✓' : '✕'}
                </span>
                <p className={`text-sm leading-relaxed ${item.ok ? 'text-zinc-200' : 'text-zinc-500'}`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-zinc-900/50">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-2xl font-black text-white mb-8">자주 묻는 질문</h2>
          <div className="space-y-2">
            {FAQS.map((f, i) => (
              <details key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl group">
                <summary className="flex items-center justify-between px-5 py-4 list-none cursor-pointer">
                  <p className="text-sm font-bold text-zinc-200 pr-4">{f.q}</p>
                  <span className="flex-shrink-0 text-zinc-600 transition-transform duration-200 group-open:rotate-180">▼</span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 신청 폼 */}
      <section id="apply" className="py-20 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">파트너 신청</p>
            <h2 className="text-2xl font-black text-white mb-2">지금 신청하세요</h2>
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
                  활동 희망 지역 <span className="text-red-400">*</span>
                </label>
                <select
                  required name="region" value={form.region} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold transition-colors"
                >
                  <option value="">지역 선택</option>
                  <option>경기도 수원시</option>
                  <option>경기도 안산시</option>
                  <option>경기도 고양시</option>
                  <option>경기도 화성시</option>
                  <option>경기도 용인시</option>
                  <option>경기도 파주시</option>
                  <option>인천광역시</option>
                  <option>서울특별시</option>
                  <option>기타 (직접 입력)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">자동차 관련 경력</label>
                <select
                  name="career" value={form.career} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white font-bold transition-colors"
                >
                  <option value="">선택 (선택사항)</option>
                  <option>자동차 정비 (1년 미만)</option>
                  <option>자동차 정비 (1~3년)</option>
                  <option>자동차 정비 (3년 이상)</option>
                  <option>중고차 경매 종사</option>
                  <option>자동차 부품/튜닝</option>
                  <option>차량 관련 경험 있음 (기타)</option>
                  <option>차량 관련 경험 없음</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">보유 자격증</label>
                <input
                  name="license" value={form.license} onChange={handleChange}
                  placeholder="예: 자동차 진단평가사 2급, 자동차 정비 기능사 등"
                  className="w-full p-3 bg-transparent border-b-2 border-zinc-700 focus:border-violet-500 outline-none text-white placeholder:text-zinc-600 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1.5 block">추가 전달사항</label>
                <textarea
                  name="memo" value={form.memo} onChange={handleChange}
                  rows={3}
                  placeholder="하고 싶은 말이 있으면 자유롭게 적어주세요"
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl outline-none text-white resize-none text-sm placeholder:text-zinc-600 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl text-base font-black transition-all bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-violet-900/30"
            >
              {loading ? '제출 중...' : '진단 평가사 파트너 신청하기 →'}
            </button>
            <p className="text-center text-zinc-600 text-[11px]">상담 무료 · 영업일 1~2일 내 연락 · 010-2285-6017</p>
          </form>
        </div>
      </section>

    </main>
  );
}
