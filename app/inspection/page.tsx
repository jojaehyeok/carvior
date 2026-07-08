'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StoreNav from '@/components/StoreNav';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const AMOUNT = 80_000;

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
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if ((window as any).TossPayments) { setSdkReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.onload = () => setSdkReady(true);
    document.head.appendChild(script);
  }, []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const pay = async () => {
    if (!form.name || !form.phone || !form.carNumber || !form.address || !form.preferredDate) {
      alert('필수 항목을 모두 입력해주세요.'); return;
    }
    if (!agreed) { alert('결제 동의가 필요합니다.'); return; }
    setLoading(true);
    try {
      const toss = (window as any).TossPayments(TOSS_CLIENT_KEY);
      const orderId = `CARVIOR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      await toss.requestPayment('카드', {
        amount: AMOUNT,
        orderId,
        orderName: '카비어 공인 검차 서비스',
        customerName: form.name,
        customerEmail: form.email || undefined,
        customerMobilePhone: form.phone.replace(/-/g, ''),
        successUrl: `${window.location.origin}/inspection/success`,
        failUrl: `${window.location.origin}/inspection/fail`,
      });
    } catch (e: any) {
      if (e?.code !== 'USER_CANCEL') alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

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
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">공인 평가사 방문 · 30개 항목 점검 · 디지털 리포트</p>
                  <p className="font-black text-gray-900 text-base mt-2">80,000원</p>
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-black text-gray-900 text-sm mb-4">주문 요약</h2>

              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">검차 서비스</span>
                  <span className="font-semibold text-gray-900">80,000원</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-black text-gray-900">총 결제금액</span>
                  <span className="font-black text-violet-600 text-xl">80,000원</span>
                </div>
              </div>

              {/* 결제수단 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">결제수단</p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-white border-2 border-violet-500 rounded-lg px-3 py-2 text-sm font-bold text-violet-600">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    신용카드
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400">
                    무통장입금
                  </div>
                </div>
              </div>

              {/* 동의 */}
              <label className="flex items-start gap-2.5 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-violet-600"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  구매조건 확인 및 결제진행에 동의합니다.
                </span>
              </label>

              <button
                onClick={pay}
                disabled={loading || !sdkReady}
                className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm transition-colors mb-3"
              >
                {loading ? '결제 처리 중...' : '결제하기'}
              </button>

              <div className="flex items-center justify-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-gray-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth={1.5}/>
                </svg>
                <p className="text-center text-[10px] text-gray-400">
                  토스페이먼츠 보안 결제
                </p>
              </div>
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
