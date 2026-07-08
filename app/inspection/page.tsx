'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StoreNav from '@/components/StoreNav';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const AMOUNT      = 88_000;
const AMOUNT_BASE = 80_000;

const BANK_INFO = {
  bank:   '카카오뱅크',
  number: '3333-35-1997303',
  holder: '(주)카비어',
};

type PayMethod = 'toss' | 'direct';

interface Form {
  name: string;
  email: string;
  phone: string;
  carNumber: string;
  address: string;
  addressDetail: string;
  preferredDate: string;
}

export default function InspectionCheckoutPage() {
  const [form, setForm] = useState<Form>({
    name: '', email: '', phone: '', carNumber: '',
    address: '', addressDetail: '', preferredDate: '',
  });
  const [payMethod, setPayMethod] = useState<PayMethod>('toss');
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [sdkReady, setSdkReady]   = useState(false);
  const [transferDone, setTransferDone] = useState(false);

  useEffect(() => {
    if ((window as any).TossPayments) { setSdkReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.onload = () => setSdkReady(true);
    document.head.appendChild(script);
  }, []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (!form.name || !form.phone || !form.carNumber || !form.address || !form.preferredDate) {
      alert('필수 항목을 모두 입력해주세요.'); return false;
    }
    if (!agreed) { alert('결제 동의가 필요합니다.'); return false; }
    return true;
  };

  const payByToss = async (method: '계좌이체') => {
    if (!validate()) return;
    setLoading(true);
    try {
      const toss = (window as any).TossPayments(TOSS_CLIENT_KEY);
      const orderId = `CARVIOR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      await toss.requestPayment(method, {
        amount: AMOUNT,
        orderId,
        orderName: '카비어 공인 검차 서비스 (VAT 포함)',
        customerName: form.name,
        customerEmail: form.email || undefined,
        customerMobilePhone: form.phone.replace(/-/g, ''),
        successUrl: `${window.location.origin}/inspection/success`,
        failUrl:    `${window.location.origin}/inspection/fail`,
      });
    } catch (e: any) {
      if (e?.code !== 'USER_CANCEL') alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const submitTransfer = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await fetch('https://carvior.store/api/v1/external/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'CARVIOR_INSPECTION',
          carNumber: form.carNumber,
          carOwner: form.name,
          contact: form.phone.replace(/-/g, ''),
          address: `${form.address} ${form.addressDetail}`.trim(),
          preferredDateTime: form.preferredDate,
          paymentMethod: 'BANK_TRANSFER',
          amount: AMOUNT,
        }),
      });
      setTransferDone(true);
    } catch {
      alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (transferDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏦</div>
          <h1 className="text-xl font-black text-gray-900 mb-1">입금 신청이 완료되었습니다</h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            아래 계좌로 <strong className="text-gray-700">88,000원</strong>을 이체해 주세요.<br />
            입금 확인 후 담당자가 연락드립니다.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <p className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-wider">입금 계좌</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">은행</span>
                <span className="font-bold text-gray-900">{BANK_INFO.bank}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">계좌번호</span>
                <span className="font-mono font-bold text-gray-900">{BANK_INFO.number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">예금주</span>
                <span className="font-bold text-gray-900">{BANK_INFO.holder}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
                <span className="text-gray-400">입금액</span>
                <span className="font-black text-violet-600">88,000원</span>
              </div>
            </div>
          </div>
          <Link href="/" className="block w-full bg-gray-900 text-white font-black py-3.5 rounded-xl text-sm text-center">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreNav />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <nav className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span>›</span>
            <Link href="/marketing/carvior-inspection" className="hover:text-gray-600 transition-colors">검차 서비스</Link>
            <span>›</span>
            <span className="text-gray-700 font-semibold">결제</span>
          </nav>
          <h1 className="text-2xl font-black text-gray-900">검차 신청 결제</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* 왼쪽: 주문 정보 */}
          <div className="lg:col-span-3 space-y-4">

            {/* 주문 상품 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">주문 상품 정보</h2>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">🔍</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">카비어 공인 검차 서비스</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">공인 평가사 방문 · 100+ 항목 점검 · 디지털 리포트</p>
                  <p className="font-black text-gray-900 text-base mt-2">
                    80,000원 <span className="text-xs text-gray-400 font-normal">(VAT 별도)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 주문자 정보 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">주문자 정보</h2>
              <div className="space-y-3">
                <Field label="이름" required>
                  <input value={form.name} onChange={set('name')} placeholder="홍길동" className={inputCls} />
                </Field>
                <Field label="연락처" required>
                  <input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" className={inputCls} />
                </Field>
                <Field label="이메일" optional>
                  <input value={form.email} onChange={set('email')} placeholder="example@email.com" type="email" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* 검차 정보 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">검차 정보</h2>
              <div className="space-y-3">
                <Field label="차량번호" required>
                  <input value={form.carNumber} onChange={set('carNumber')} placeholder="12가 3456" className={inputCls} />
                </Field>
                <Field label="검차 주소" required>
                  <input value={form.address} onChange={set('address')} placeholder="서울시 강남구 테헤란로 123" className={`${inputCls} mb-2`} />
                  <input value={form.addressDetail} onChange={set('addressDetail')} placeholder="상세 주소 (동호수, 건물명 등)" className={inputCls} />
                </Field>
                <Field label="희망 일시" required>
                  <input value={form.preferredDate} onChange={set('preferredDate')} type="datetime-local" className={inputCls} />
                </Field>
              </div>
            </div>
          </div>

          {/* 오른쪽: 주문 요약 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-5">

              {/* ── 결제 방법 ── */}
              <div>
                <p className="text-sm font-black text-gray-900 mb-3">
                  결제 방법 <span className="text-red-500">*</span>
                </p>

                {/* 토스 퀵계좌이체 */}
                <button
                  onClick={() => setPayMethod('toss')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all mb-2 ${
                    payMethod === 'toss'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-blue-500 shrink-0">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth={1.8}/>
                    <path d="M2 10h20" stroke="currentColor" strokeWidth={1.8}/>
                    <path d="M6 15h4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"/>
                  </svg>
                  <div className="text-left">
                    <p className={`text-sm font-black ${payMethod === 'toss' ? 'text-blue-700' : 'text-gray-700'}`}>
                      토스 퀵계좌이체
                    </p>
                    <p className="text-[10px] text-gray-400">토스페이먼츠 실시간 계좌이체</p>
                  </div>
                  {payMethod === 'toss' && (
                    <span className="ml-auto text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">추천</span>
                  )}
                </button>

                {/* 직접 계좌이체 */}
                <button
                  onClick={() => setPayMethod('direct')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all ${
                    payMethod === 'direct'
                      ? 'border-gray-700 bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500 shrink-0">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth={1.8}/>
                    <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth={1.8}/>
                  </svg>
                  <div className="text-left">
                    <p className={`text-sm font-black ${payMethod === 'direct' ? 'text-gray-900' : 'text-gray-600'}`}>
                      직접 계좌이체
                    </p>
                    <p className="text-[10px] text-gray-400">카비어 계좌로 직접 입금</p>
                  </div>
                </button>

                {/* 직접 계좌이체 안내 */}
                {payMethod === 'direct' && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">입금 계좌</p>
                    {[
                      ['은행',     BANK_INFO.bank],
                      ['계좌번호', BANK_INFO.number],
                      ['예금주',   BANK_INFO.holder],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-xs">
                        <span className="text-gray-400">{l}</span>
                        <span className="font-bold text-gray-800 font-mono">{v}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-xs">
                      <span className="text-gray-400">입금액</span>
                      <span className="font-black text-gray-900">88,000원</span>
                    </div>
                  </div>
                )}

                {/* 안내 문구 */}
                <div className="mt-2.5 space-y-1">
                  <p className="text-[11px] text-gray-400 flex items-start gap-1">
                    <span className="shrink-0">•</span>
                    {payMethod === 'direct'
                      ? '입금 확인 후 담당자가 24시간 내 연락드립니다.'
                      : '결제 후 담당자가 일정을 확인하여 안내드립니다.'}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-start gap-1">
                    <span className="shrink-0">•</span>
                    검차 전날 18시까지 100% 환불 가능합니다.
                  </p>
                </div>
              </div>

              {/* ── 결제 금액 ── */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm font-black text-gray-900 mb-3">결제 금액</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">카비어 검차 서비스</span>
                    <span className="font-semibold text-gray-700">{AMOUNT_BASE.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">카비오 안심케어</span>
                    <span className="font-semibold text-gray-400">무료</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm font-black text-gray-900">
                    총 결제 금액 <span className="text-[10px] text-gray-400 font-normal">(VAT 10% 포함)</span>
                  </span>
                  <span className="font-black text-blue-600 text-lg">{AMOUNT.toLocaleString()}원</span>
                </div>
                <p className="text-[10px] text-gray-400 text-right mt-1">검차 전날 18시까지 100% 환불 가능해요</p>
              </div>

              {/* ── 약관 동의 ── */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm font-black text-gray-900 mb-3">
                  약관 동의 <span className="text-red-500">*</span>
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-gray-700">약관에 모두 동의합니다.</span>
                </label>
                <div className="space-y-1.5">
                  {['(필수) 검수 범위 및 책임고지 동의', '(필수) 서비스 보증범위 동의', '(필수) 환불규정 동의'].map(t => (
                    <p key={t} className="text-[11px] text-gray-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {t}
                      </span>
                      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </p>
                  ))}
                </div>
              </div>

              {/* ── 결제 버튼 ── */}
              {payMethod === 'direct' ? (
                <button
                  onClick={submitTransfer}
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm transition-colors"
                >
                  {loading ? '신청 중...' : '직접 계좌이체 신청하기'}
                </button>
              ) : (
                <button
                  onClick={() => payByToss('계좌이체')}
                  disabled={loading || !sdkReady}
                  className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm transition-colors"
                >
                  {loading ? '결제 처리 중...' : '토스 퀵계좌이체로 결제하기'}
                </button>
              )}

              <p className="text-center text-[10px] text-gray-400">
                • 정비사가 예약을 승인하면 정비사의 연락처를 공유드릴게요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors placeholder:text-gray-300';

function Field({ label, required, optional, children }: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-600 mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {optional && <span className="text-gray-300 font-normal ml-1">(선택)</span>}
      </label>
      {children}
    </div>
  );
}
