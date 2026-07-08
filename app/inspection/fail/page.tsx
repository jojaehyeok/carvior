'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailContent() {
  const params = useSearchParams();
  const message = params.get('message');
  const code    = params.get('code');

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-xl font-black text-gray-900 mb-1">결제에 실패했습니다</h1>
      <p className="text-gray-400 text-sm mb-1">{message ?? '결제 처리 중 오류가 발생했습니다.'}</p>
      {code && <p className="text-[11px] text-gray-300 mb-6">오류 코드: {code}</p>}
      {!code && <div className="mb-6" />}

      <div className="flex flex-col gap-2">
        <Link href="/inspection" className="block w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors">
          다시 시도하기
        </Link>
        <Link href="/" className="block w-full border border-gray-200 text-gray-500 font-bold py-3.5 rounded-xl text-sm text-center hover:border-gray-300 transition-colors">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full">
        <Suspense fallback={<div className="h-40" />}>
          <FailContent />
        </Suspense>
      </div>
    </div>
  );
}
