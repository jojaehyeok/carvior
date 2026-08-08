'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppFooter from '@/components/footermodal';

const STEPS = [
  { num: '01', icon: '📝', title: '차량 정보 입력', desc: '차종, 연식, 주행거리, 가격 등 기본 정보를 입력합니다. 5분이면 충분해요.' },
  { num: '02', icon: '📸', title: '사진 첨부', desc: '외관, 실내, 엔진룸 사진을 등록합니다. 사진이 많을수록 딜러의 신뢰도가 높아져요.' },
  { num: '03', icon: '✅', title: '카비어 검토', desc: '등록 신청 후 1~2 영업일 내에 카비어가 검토하고 스토어에 등록합니다.' },
  { num: '04', icon: '🤝', title: '딜러 연락', desc: '스토어에 노출된 매물을 본 딜러들이 직접 연락해 최고가를 제시합니다.' },
  { num: '05', icon: '💰', title: '최고가에 판매', desc: '가장 좋은 조건을 선택해 판매 완료. 수수료 없이 직접 거래합니다.' },
];

const FAQS = [
  { q: '등록 비용이 있나요?', a: '등록비는 없습니다. 딜러와 직접 거래 시에도 별도 수수료는 없습니다.' },
  { q: '일반인도 등록할 수 있나요?', a: '네, 딜러가 아닌 일반 개인도 등록 가능합니다. 카비어 검토 후 스토어에 노출됩니다.' },
  { q: '수출용 차량도 등록되나요?', a: '수출 셀프 등록도 가능합니다. 차량 정보 입력 시 수출 희망 여부를 체크해주세요.' },
  { q: '사진 없이도 등록할 수 있나요?', a: '기본 정보만으로 접수는 가능하나, 사진이 있는 매물이 딜러 관심을 3배 이상 더 받습니다.' },
  { q: '등록 후 수정·삭제할 수 있나요?', a: '등록 완료 후 수정·삭제가 필요하면 고객센터(010-2285-6017)로 연락 주세요.' },
];


export default function SellPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ── HERO ── */}
      <section className="bg-zinc-950 text-white">
        <div className="max-w-xl mx-auto px-5 pt-10 pb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-bold text-green-300 tracking-wider">수수료 0원 · 딜러 직거래</span>
          </div>

          <h1 className="text-[1.9rem] sm:text-[2.2rem] font-black leading-[1.2] mb-3 tracking-tight">
            내 차를 등록하고<br />
            <span className="text-violet-400">더 많이 받아가세요</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            등록비 0원 · 수수료 0원 · 5분이면 완료.<br />
            딜러들이 경쟁해서 최고가를 제시합니다.
          </p>

          {/* 가격 비교 */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 mb-6">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">예상 수령액 차이 (예시)</p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-sm font-bold text-white">카비어 셀프 등록</span>
                  </div>
                  <span className="text-base font-black text-violet-400 tabular-nums">+200만원</span>
                </div>
                <div className="w-full bg-violet-600 rounded-full h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    <span className="text-sm text-zinc-500">일반 중고차 매입</span>
                  </div>
                  <span className="text-sm text-zinc-500 tabular-nums">기준가</span>
                </div>
                <div className="w-4/5 bg-zinc-700 rounded-full h-2" />
              </div>
            </div>
            <p className="text-zinc-600 text-[10px] mt-3">* 차량 상태·시세에 따라 다를 수 있음</p>
          </div>

          {/* 무료 뱃지 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5">
              <span className="text-[11px] text-green-400 font-bold">등록비</span>
              <span className="text-sm font-black text-green-300">0원</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <span className="text-[11px] text-zinc-400">딜러 수수료</span>
              <span className="text-sm font-black text-violet-400">0원</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/sell/register')}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-extrabold text-base rounded-2xl transition-all shadow-lg shadow-violet-900/40"
          >
            등록하기 →
          </button>
          <p className="text-center text-zinc-600 text-[11px] mt-2">일반인·딜러·수출 차량 모두 가능 · 지금 바로 시작</p>
        </div>
      </section>

      {/* ── 왜 셀프 등록인가 ── */}
      <section className="bg-white py-12 px-5">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-1.5">WHY SELF REGISTER</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-6 leading-tight">더 받을 수 있는 이유</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '💸', title: '수수료 0원', desc: '딜러와 직접 거래. 수령액이 그대로 내 몫' },
              { icon: '🏆', title: '딜러 경쟁 입찰', desc: '검증된 딜러 네트워크에서 최고가 제시' },
              { icon: '🌏', title: '수출 딜러 포함', desc: '국내 + 수출 전문 딜러 모두 참여' },
              { icon: '🔒', title: '안전한 거래', desc: '카비어 검토 매물만 등록. 허위매물 없음' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-extrabold text-zinc-900 text-sm mb-0.5">{item.title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 중간 CTA ── */}
      <section className="bg-violet-600 py-10 px-5">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-violet-200 text-sm font-bold mb-2">등록비 0원 · 수수료 0원</p>
          <p className="text-white text-xl font-black leading-tight mb-5">
            5분 입력으로<br />더 높은 가격에 팔기
          </p>
          <button
            onClick={() => router.push('/sell/register')}
            className="inline-block px-10 py-3.5 bg-white text-violet-700 font-extrabold text-sm rounded-2xl hover:bg-violet-50 active:scale-95 transition-all shadow-lg"
          >
            지금 시작하기 →
          </button>
        </div>
      </section>

      {/* ── 이용 방법 ── */}
      <section className="bg-zinc-50 py-12 px-5">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-1.5">HOW IT WORKS</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-2 leading-tight">이용방법, 어렵지 않아요!</h2>
          <p className="text-zinc-400 text-sm text-center mb-8">5단계, 5분이면 완료</p>

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border-2 flex-shrink-0 z-10 ${
                    i === 0 ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-zinc-200 text-zinc-400'
                  }`}>
                    {step.num}
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 w-px my-1 bg-zinc-200" style={{ minHeight: '28px' }} />}
                </div>
                <div className="pb-7 pt-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{step.icon}</span>
                    <p className={`font-extrabold text-sm ${i === 0 ? 'text-violet-700' : 'text-zinc-700'}`}>{step.title}</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 후기 ── */}
      <section className="bg-white py-12 px-5">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-1.5">REVIEWS</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-6">실제 판매자 후기</h2>
          <div className="space-y-3">
            {[
              { name: '김*준', car: '기아 쏘렌토 2021', stars: 5, text: '딜러한테 직접 팔았을 때보다 230만원 더 받았어요. 카비어에 올리니까 딜러들이 먼저 연락 오더라고요.' },
              { name: '이*영', car: '현대 투싼 2020', stars: 5, text: '수출 딜러까지 포함해서 입찰이 들어오니까 생각보다 훨씬 좋은 가격 받았습니다. 강추요!' },
              { name: '박*수', car: '기아 K5 2019', stars: 5, text: '등록하고 3일 만에 연락 왔어요. 검토도 빠르고 딜러 매칭도 쉬웠습니다.' },
            ].map(r => (
              <div key={r.name} className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-extrabold text-zinc-900 text-sm">{r.name}</p>
                    <p className="text-xs text-zinc-400">{r.car}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <span key={i} className="text-violet-500 text-sm">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-zinc-50 py-12 px-5">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-1.5">FAQ</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-6">자주 묻는 질문</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left gap-3"
                >
                  <span className="text-sm font-extrabold text-zinc-900">Q. {faq.q}</span>
                  <span className={`text-zinc-400 text-xl font-bold flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-zinc-500 leading-relaxed border-t border-zinc-100 pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section className="bg-zinc-950 py-12 px-5">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">지금 시작하세요</p>
          <h2 className="text-xl font-black text-white leading-tight">
            내 차, 직접 등록하고<br />
            <span className="text-violet-400">최고가에 판매</span>하세요
          </h2>
          <p className="text-zinc-500 text-xs">일반인·딜러·수출 차량 모두 · 검토 후 스토어 노출</p>
          <button
            onClick={() => router.push('/sell/register')}
            className="w-full max-w-xs py-4 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-extrabold text-base rounded-2xl transition-all mx-auto block"
          >
            등록하기 →
          </button>
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs mb-1.5">등록 문의</p>
            <a href="tel:01022856017" className="text-zinc-400 text-sm font-bold hover:text-white transition-colors">
              📞 010-2285-6017
            </a>
            <p className="text-zinc-700 text-[10px] mt-1">평일 09:00 – 18:00</p>
          </div>
        </div>
      </section>

      <AppFooter />

      {/* ── 플로팅 CTA ── */}
      <div className={`fixed bottom-5 left-0 right-0 px-4 z-40 transition-all duration-300 ${
        scrolled ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}>
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => router.push('/sell/register')}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-extrabold text-base rounded-2xl shadow-2xl shadow-violet-900/50 transition-all flex items-center justify-center gap-3 border border-violet-500/30"
          >
            <span>등록하기</span>
            <span className="bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-black">0원</span>
          </button>
        </div>
      </div>

    </div>
  );
}
