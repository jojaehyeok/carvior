'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderMeta {
  carNumber?: string;
  carOwner?: string;
  contact?: string;
  address?: string;
  preferredDateTime?: string;
  email?: string;
  dealerName?: string;
  dealerContact?: string;
  listingUrl?: string;
  carOrigin?: 'DOMESTIC' | 'IMPORTED';
  amount?: number;
}

const CAR_ORIGIN_LABEL: Record<string, string> = { DOMESTIC: '국산차', IMPORTED: '수입차' };

function NaverPayReturnContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [meta, setMeta] = useState<OrderMeta>({});

  useEffect(() => {
    const resultCode    = params.get('resultCode');
    const resultMessage = params.get('resultMessage');
    const paymentId     = params.get('paymentId');
    const merchantPayKey = params.get('merchantPayKey');

    if (!merchantPayKey) { setStatus('error'); setErrorMessage('주문 정보를 찾을 수 없습니다.'); return; }

    const raw = sessionStorage.getItem(`order_${merchantPayKey}`);
    const order: OrderMeta = raw ? JSON.parse(raw) : {};
    setMeta(order);

    // 사용자가 결제창에서 취소했거나 실패한 경우 — 승인 API 호출 없이 바로 실패 처리
    if (resultCode !== 'Success') {
      setStatus('error');
      setErrorMessage(resultMessage || '결제가 완료되지 않았습니다.');
      return;
    }
    if (!paymentId) { setStatus('error'); setErrorMessage('결제 정보를 확인할 수 없습니다.'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/external/inspection-payments/confirm-naverpay`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ paymentId, merchantPayKey, ...order }),
    })
      .then(r => r.json())
      .then(d => {
        if (d?.code === 'Success') {
          setStatus('ok');
          sessionStorage.removeItem(`order_${merchantPayKey}`);
        } else {
          setStatus('error');
          setErrorMessage(d?.message || '결제 승인에 실패했습니다.');
        }
      })
      .catch(() => { setStatus('error'); setErrorMessage('결제 확인 중 오류가 발생했습니다.'); });
  }, [params]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">결제 확인 중...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">❌</div>
        <h1 className="text-xl font-black text-gray-900 mb-2">결제 확인 실패</h1>
        <p className="text-gray-400 text-sm mb-6">{errorMessage || '결제 처리 중 오류가 발생했습니다.'}</p>
        <Link href="/inspection" className="inline-block bg-green-500 text-white font-bold px-6 py-3 rounded-xl text-sm">
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
      <h1 className="text-xl font-black text-gray-900 mb-1">결제 완료!</h1>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        검차 신청이 접수되었습니다.<br />
        담당자가 <strong className="text-gray-700">24시간 내</strong>에 연락드립니다.
      </p>

      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2.5 mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">결제 정보</p>
        <Row label="주문번호" value={<span className="font-mono text-xs">{params.get('merchantPayKey')}</span>} />
        <Row label="결제금액" value={meta.amount ? `${meta.amount.toLocaleString()}원` : '-'} />
        <Row label="결제수단" value="네이버페이" />
      </div>

      {(meta.carOwner || meta.carNumber) && (
        <div className="bg-blue-50 rounded-xl p-4 text-left space-y-2 mb-6 border border-blue-100">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-3">신청 정보</p>
          {meta.carOwner    && <Row label="신청자"   value={meta.carOwner} />}
          {meta.contact     && <Row label="연락처"   value={meta.contact} />}
          {meta.carOrigin   && <Row label="차량 구분" value={CAR_ORIGIN_LABEL[meta.carOrigin] ?? meta.carOrigin} />}
          {meta.carNumber   && <Row label="차량번호" value={meta.carNumber} />}
          {meta.dealerName  && <Row label="딜러 이름" value={meta.dealerName} />}
          {meta.dealerContact && <Row label="딜러 연락처" value={meta.dealerContact} />}
          {meta.listingUrl  && <Row label="매물 링크" value={<span className="text-right break-all">{meta.listingUrl}</span>} />}
          {meta.address     && <Row label="검차 주소" value={<span className="text-right">{meta.address}</span>} />}
          {meta.preferredDateTime && (
            <Row label="희망 일시" value={new Date(meta.preferredDateTime).toLocaleString('ko-KR', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit',
            })} />
          )}
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-3.5 mb-6 text-left border border-amber-100">
        <p className="text-xs font-bold text-amber-800 mb-1.5">📌 다음 단계</p>
        <ul className="space-y-1">
          {[
            '담당자가 연락드려 검차 일정을 확정합니다.',
            '평가사가 지정 장소로 방문합니다.',
            '100+ 항목 점검 후 디지털 리포트를 발송합니다.',
            '검차 전날 18시까지 100% 환불 가능합니다.',
          ].map(t => (
            <li key={t} className="flex items-start gap-1.5 text-xs text-amber-700">
              <span className="shrink-0 mt-0.5">•</span>{t}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/" className="block w-full bg-gray-900 hover:bg-gray-700 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors">
        홈으로 돌아가기
      </Link>
      <Link href="/inspection/cancel" className="block w-full text-center text-xs text-violet-600 hover:text-violet-500 mt-3 underline">
        예약 조회 · 취소하기
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-bold text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function NaverPayReturnPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">결제 확인 중...</p>
          </div>
        }>
          <NaverPayReturnContent />
        </Suspense>
      </div>
    </div>
  );
}
