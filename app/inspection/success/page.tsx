'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const paymentKey = params.get('paymentKey');
    const orderId    = params.get('orderId');
    const amount     = params.get('amount');
    if (!paymentKey || !orderId || !amount) { setStatus('error'); return; }

    fetch('/api/inspection/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then(r => r.json())
      .then(d => { setData(d); setStatus(d.status === 'DONE' ? 'ok' : 'error'); })
      .catch(() => setStatus('error'));
  }, [params]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">결제 확인 중...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">❌</div>
        <h1 className="text-xl font-black text-gray-900 mb-2">결제 확인 실패</h1>
        <p className="text-gray-400 text-sm mb-6">결제 처리 중 오류가 발생했습니다.</p>
        <Link href="/inspection" className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl text-sm">
          다시 시도하기
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-xl font-black text-gray-900 mb-1">결제가 완료되었습니다!</h1>
      <p className="text-gray-400 text-sm mb-6">검차 신청이 접수되었습니다. 담당자가 곧 연락드릴 예정입니다.</p>

      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2.5 mb-6">
        <Row label="주문번호" value={<span className="font-mono text-xs">{params.get('orderId')}</span>} />
        <Row label="결제금액" value="80,000원" />
        <Row label="결제수단" value={data?.method ?? '카드'} />
      </div>

      <Link href="/" className="block w-full bg-gray-900 text-white font-black py-3.5 rounded-xl text-sm text-center">
        홈으로 돌아가기
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">결제 확인 중...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
