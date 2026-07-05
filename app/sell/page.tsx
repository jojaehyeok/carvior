'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppFooter from '@/components/footermodal';

const STEPS = [
  {
    num: '01',
    icon: '📝',
    title: '차량 정보 입력',
    desc: '차종, 연식, 주행거리, 가격 등 기본 정보를 입력합니다. 5분이면 충분해요.',
  },
  {
    num: '02',
    icon: '📸',
    title: '사진 첨부',
    desc: '외관, 실내, 엔진룸 사진을 등록합니다. 사진이 많을수록 딜러의 신뢰도가 높아져요.',
  },
  {
    num: '03',
    icon: '✅',
    title: '카비어 검토',
    desc: '등록 신청 후 1~2 영업일 내에 카비어가 검토하고 스토어에 등록합니다.',
  },
  {
    num: '04',
    icon: '🤝',
    title: '딜러 연락',
    desc: '스토어에 노출된 매물을 본 딜러들이 직접 연락해 최고가를 제시합니다.',
  },
  {
    num: '05',
    icon: '💰',
    title: '최고가에 판매',
    desc: '가장 좋은 조건을 선택해 판매 완료. 수수료 없이 직접 거래합니다.',
  },
];

const FAQS = [
  {
    q: '수수료가 있나요?',
    a: '셀프 등록은 별도 수수료가 없습니다. 단, 카비어를 통한 딜러 매칭은 합의된 조건으로 진행됩니다.',
  },
  {
    q: '일반인도 등록할 수 있나요?',
    a: '네, 딜러가 아닌 일반 개인도 등록 가능합니다. 카비어 검토 후 스토어에 노출됩니다.',
  },
  {
    q: '수출용 차량도 등록되나요?',
    a: '수출 셀프 등록도 가능합니다. 차량 정보 입력 시 수출 희망 여부를 체크해주세요.',
  },
  {
    q: '사진 없이도 등록할 수 있나요?',
    a: '기본 정보만으로 접수는 가능하나, 사진이 있는 매물이 딜러 관심을 3배 이상 더 받습니다. 가능한 많은 사진을 첨부해주세요.',
  },
  {
    q: '등록 후 수정·삭제할 수 있나요?',
    a: '등록 완료 후 수정·삭제가 필요하면 고객센터(010-2285-6017)로 연락 주세요.',
  },
];

export default function SellPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ── HERO ── */}
      <section className="bg-zinc-950 text-white">
        <div className="max-w-xl mx-auto px-6 pt-12 pb-10">
          <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-bold text-violet-300 tracking-wider">CARVIOR SELF REGISTER</span>
          </div>

          <h1 className="text-[2.2rem] font-black leading-[1.2] mb-4 tracking-tight">
            직접 등록하고<br />
            <span className="text-violet-400">더 많이 받아가세요</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            중간 수수료 없이 카비어 스토어에 직접 등록.<br />
            딜러들이 경쟁해서 최고가를 제시합니다.
          </p>

          {/* 가격 비교 */}
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-8">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">예상 수령액 차이 (예시 차량 기준)</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="text-sm font-bold text-white">카비어 셀프 등록</span>
                </div>
                <span className="text-lg font-black text-violet-400 tabular-nums">+200만원</span>
              </div>
              <div className="w-full bg-violet-600 rounded-full h-2.5" />

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <span className="text-sm text-zinc-500">일반 중고차 매입</span>
                </div>
                <span className="text-sm text-zinc-500 tabular-nums">기준가</span>
              </div>
              <div className="w-4/5 bg-zinc-700 rounded-full h-2.5" />
            </div>
            <p className="text-zinc-600 text-[10px] mt-4">* 수수료 절약 + 딜러 경쟁 입찰 효과 (차량 상태·시세에 따라 다를 수 있음)</p>
          </div>

          <Link
            href="/sell/register"
            className="block w-full text-center py-4 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-extrabold text-base rounded-2xl transition-all shadow-lg shadow-violet-900/40"
          >
            셀프 등록하기 →
          </Link>
          <p className="text-center text-zinc-600 text-[11px] mt-2.5">무료 등록 · 일반인·딜러 모두 가능 · 수출 차량 OK</p>
        </div>
      </section>

      {/* ── 왜 셀프 등록인가 ── */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">WHY SELF REGISTER</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-8 leading-tight">더 받을 수 있는 이유</h2>

          <div className="space-y-3">
            {[
              { icon: '💸', title: '수수료 0원', desc: '중간 수수료 없이 딜러와 직접 거래. 수령액이 그대로 내 몫입니다.' },
              { icon: '🏆', title: '딜러 경쟁 입찰', desc: '카비어 네트워크의 딜러들이 내 차를 보고 경쟁적으로 최고가를 제시합니다.' },
              { icon: '🌏', title: '수출 딜러 포함', desc: '국내뿐 아니라 수출 전문 딜러도 참여. 더 넓은 시장에서 최고가를 찾습니다.' },
              { icon: '🔒', title: '안전한 거래', desc: '카비어가 검토한 매물만 등록. 사기·허위매물 없는 신뢰 거래 환경입니다.' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="w-11 h-11 bg-zinc-900 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
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
      <section className="bg-violet-600 py-10 px-6">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <p className="text-violet-200 text-sm font-bold">지금 바로 시작하세요</p>
          <p className="text-white text-2xl font-black leading-tight">
            5분 입력으로<br />더 높은 가격에 팔기
          </p>
          <Link
            href="/sell/register"
            className="inline-block px-10 py-4 bg-white text-violet-700 font-extrabold text-base rounded-2xl hover:bg-violet-50 active:scale-95 transition-all shadow-lg"
          >
            무료로 셀프 등록하기 →
          </Link>
        </div>
      </section>

      {/* ── 이용 방법 ── */}
      <section className="bg-zinc-50 py-14 px-6">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">HOW IT WORKS</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-2 leading-tight">이용방법, 어렵지 않아요!</h2>
          <p className="text-zinc-400 text-sm text-center mb-10">5단계, 5분이면 완료</p>

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 flex-shrink-0 z-10 ${
                    i === 0 ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-zinc-200 text-zinc-400'
                  }`}>
                    {step.num}
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 w-px my-1 bg-zinc-200" style={{ minHeight: '32px' }} />}
                </div>
                <div className="pb-8 pt-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{step.icon}</span>
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
      <section className="bg-white py-14 px-6">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">REVIEWS</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-8">실제 판매자 후기</h2>
          <div className="space-y-4">
            {[
              { name: '김*준', car: '기아 쏘렌토 2021', stars: 5, text: '딜러한테 직접 팔았을 때보다 230만원 더 받았어요. 카비어에 올리니까 딜러들이 먼저 연락 오더라고요.' },
              { name: '이*영', car: '현대 투싼 2020', stars: 5, text: '수출 딜러까지 포함해서 입찰이 들어오니까 생각보다 훨씬 좋은 가격 받았습니다. 강추요!' },
              { name: '박*수', car: '기아 K5 2019', stars: 5, text: '등록하고 3일 만에 연락 왔어요. 검토도 빠르고 딜러 매칭도 쉬웠습니다.' },
            ].map(r => (
              <div key={r.name} className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50">
                <div className="flex items-center justify-between mb-3">
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
      <section className="bg-zinc-50 py-14 px-6">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">FAQ</p>
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-8">자주 묻는 질문</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-extrabold text-zinc-900">Q. {faq.q}</span>
                  <span className={`text-zinc-400 text-lg font-bold transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-zinc-500 leading-relaxed border-t border-zinc-100 pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section className="bg-zinc-950 py-14 px-6">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">지금 시작하세요</p>
          <h2 className="text-2xl font-black text-white leading-tight">
            내 차, 직접 등록하고<br />
            <span className="text-violet-400">최고가에 판매</span>하세요
          </h2>
          <p className="text-zinc-400 text-sm">일반인·딜러·수출 차량 모두 등록 가능 · 검토 후 스토어 노출</p>
          <Link
            href="/sell/register"
            className="inline-block w-full max-w-xs py-4 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-extrabold text-base rounded-2xl transition-all"
          >
            셀프 등록하기 →
          </Link>
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs mb-2">등록 문의</p>
            <a href="tel:01022856017" className="text-zinc-400 text-sm font-bold hover:text-white transition-colors">
              📞 010-2285-6017
            </a>
            <p className="text-zinc-700 text-[10px] mt-1">평일 09:00 – 18:00</p>
          </div>
        </div>
      </section>

      <AppFooter />

    </div>
  );
}
