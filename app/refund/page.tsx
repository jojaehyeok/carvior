"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white px-6 pt-20 pb-16">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">취소 및 환불 규정</h1>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          {/* 1. 기본 원칙 */}
          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-3">01. 기본 원칙</h2>
            <p>
              차바타(Chavatar)는 전문 진단사의 일정 예약 및 현장 출동 서비스를 제공하므로, 
              예약 확정 후 취소 시점에 따라 아래와 같은 환불 규정이 적용됩니다.
            </p>
          </section>

          {/* 2. 고객 변심에 의한 취소 */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">02. 고객 변심에 의한 취소</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">검수 시작 24시간 전</span>
                <span className="font-bold text-green-600">100% 환불</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">검수 시작 12~24시간 전</span>
                <span className="font-bold text-orange-500">90% 환불</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">검수 시작 3~12시간 전</span>
                <span className="font-bold text-orange-600">50% 환불</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3 border-gray-200">
                <span className="font-medium text-red-600">검수 시작 3시간 이내</span>
                <span className="font-bold text-red-600 text-lg">환불 불가</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              * 검수 시작 3시간 이내는 진단사의 이동이 시작된 시점으로 간주되어 환불이 제한됩니다.
            </p>
          </section>

          {/* 3. 진단사 귀책 사유 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">03. 진단사 및 시스템 귀책 사유</h2>
            <ul className="list-disc ml-5 space-y-2">
              <li>진단사의 개인 사정 또는 사고로 인해 검수가 불가능한 경우: <b>100% 전액 환불</b></li>
              <li>예약된 차량이 현장에 없거나(허위 매물 등) 판매자 협조 거부로 검수가 진행되지 못한 경우: <b>결제 금액의 50% 환불 (진단사 출동비용 발생)</b></li>
              <li>시스템 오류로 인해 서비스 제공이 정상적으로 이루어지지 않은 경우: <b>100% 전액 환불</b></li>
            </ul>
          </section>

          {/* 4. 환불 절차 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">04. 환불 절차 및 소요 기간</h2>
            <p className="mb-2">
              취소 요청은 앱 내 [예약 내역] 또는 고객센터를 통해 접수할 수 있습니다.
            </p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-gray-500">
              <li>신용카드: 카드사 영업일 기준 3~5일 소요</li>
              <li>체크카드: 카드사 영업일 기준 2~3일 소요</li>
              <li>계좌이체: 즉시 또는 익일 입금</li>
            </ul>
          </section>

          {/* 하단 푸터 */}
          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">본 규정은 2024년 05월 22일부터 시행됩니다.</p>
            <p className="text-sm text-gray-400 font-medium">상호명: 카비어 (Cavior)</p>
          </div>
        </div>
      </div>
    </main>
  );
}