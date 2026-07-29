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
          <h1 className="text-2xl font-bold text-gray-900">예약 취소 및 환불 규정</h1>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* 1. 기본 원칙 */}
          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-3">01. 기본 원칙</h2>
            <p>
              카비어(Carvior)는 전문 진단평가사의 일정 예약 및 현장 출동 서비스를 제공하므로,
              검수 예약일 기준 취소 시점에 따라 아래와 같은 환불 규정이 적용됩니다.
            </p>
          </section>

          {/* 2. 취소 시점별 환불 기준 */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">02. 취소 시점별 환불 기준</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">검수 예약일 기준 전날 18시 이전 취소</span>
                <span className="font-bold text-green-600">100% 환불</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3 border-gray-200">
                <span className="font-medium text-gray-600">전날 18시 이후 ~ 검수 예약 시간 이전 취소</span>
                <span className="font-bold text-orange-500">취소수수료(30,000원) 차감 후 환불</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3 border-gray-200">
                <span className="font-medium text-red-600">검수 예약 시간 이후 취소</span>
                <span className="font-bold text-red-600 text-lg">사유 불문 환불 불가</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              * 결제 후 1시간 이내 취소 시에는 위 기준과 무관하게 100% 환불 가능합니다.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              * 검수 예약 시간이 30분 지나도 검수를 진행할 수 없는 경우, 예약이 취소될 수 있으며 이 경우 환불이 불가합니다.
            </p>
          </section>

          {/* 3. 예시 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">03. 이해를 돕기 위한 예시</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3 text-sm">
              <p className="text-gray-500">검수 희망일: 10월 20일 12시 · 검수비: 110,000원(국산차 기준)</p>
              <div className="flex justify-between border-t pt-3 border-gray-100">
                <span>10월 19일 18시 이전 취소</span>
                <span className="font-bold text-green-600">100% 환불 (110,000원)</span>
              </div>
              <div className="flex justify-between">
                <span>10월 20일 12시 이전 취소</span>
                <span className="font-bold text-orange-500">취소수수료 차감 후 환불 (80,000원)</span>
              </div>
              <div className="flex justify-between">
                <span>10월 20일 12시 이후 취소</span>
                <span className="font-bold text-red-600">환불 불가</span>
              </div>
            </div>
          </section>

          {/* 4. 환불이 제한되는 경우 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">04. 환불 안내사항</h2>
            <p className="mb-2 text-sm text-gray-500">다음의 경우는 예약 시간 이후 취소로 간주되어 환불이 불가합니다.</p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-gray-500">
              <li>예약 시간 이후 단순 변심 또는 변경</li>
              <li>카비어 이용에 대한 딜러와의 사전 협의 미이행</li>
              <li>그 외 기타 고객 측 사유로 검수를 시작할 수 없는 경우</li>
            </ul>
          </section>

          {/* 5. 진단평가사 및 시스템 귀책 사유 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">05. 진단평가사 및 시스템 귀책 사유</h2>
            <ul className="list-disc ml-5 space-y-2">
              <li>진단평가사의 개인 사정 또는 사고로 인해 검수가 불가능한 경우: <b>100% 전액 환불</b></li>
              <li>예약된 차량이 현장에 없거나(허위 매물 등) 판매자 협조 거부로 검수가 진행되지 못한 경우: <b>결제 금액의 50% 환불 (진단평가사 출동비용 발생)</b></li>
              <li>시스템 오류로 인해 서비스 제공이 정상적으로 이루어지지 않은 경우: <b>100% 전액 환불</b></li>
            </ul>
          </section>

          {/* 6. 환불 절차 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">06. 환불 절차 및 소요 기간</h2>
            <p className="mb-2">
              취소 요청은 앱 내 [예약 내역] 또는 고객센터를 통해 접수할 수 있습니다. 환불은 결제하신
              수단과 동일하게 진행됩니다.
            </p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-gray-500">
              <li>가상계좌 입금: 환불 정보 입력 안내(카카오 알림톡 또는 문자) 후 영업일 기준 2~5일 소요</li>
              <li>카드 결제: 카드 결제 취소(또는 부분 취소)로 진행되며, 승인 취소 소요 기간은 카드사마다 다름</li>
              <li>할부 결제: 일반 카드 결제와 처리 방식이 달라 승인 취소에 영업일 기준 7~15일 가량 소요될 수 있음(정확한 일정은 결제 카드사 문의)</li>
            </ul>
          </section>

          {/* 하단 푸터 */}
          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">본 규정은 2026년 7월 29일부터 시행됩니다.</p>
            <p className="text-sm text-gray-400 font-medium">상호명: 카비어 (Cavior)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
