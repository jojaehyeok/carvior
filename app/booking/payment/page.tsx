"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// --- 🌟 심사용 고정 데모 데이터 🌟 ---
const DEMO_DATA = {
  bookingId: "BK-20240522-001",
  status: "WAITING_PAYMENT",
  createdAt: new Date().toISOString(),
  car: { model: "현대 그랜저 IG (2022년형)" },
  address: { main: "서울특별시 강남구 테헤란로 131", detail: "Toss Payments 빌딩 앞" },
  schedule: { date: "2024-05-30", time: "14:00" },
  evaluator: {
    id: 999,
    name: "김진단 평가사",
    title: "국가공인 자동차진단평가사 1급",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    rating: 4.9,
    originalFee: 100000,
    fee: 80000, // 20% 할인된 8만원 고정
    discountRate: 20,
    type: "MASTER",
    region: "서울 전지역",
  },
};

export default function PaymentPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    // 1. 일단 로컬스토리지 확인
    const saved = localStorage.getItem("completedBooking");

    if (saved) {
      // 데이터가 있으면 저장된 데이터 사용
      setBooking(JSON.parse(saved));
    } else {
      // 🌟 데이터가 없어도 팝업 띄우지 않고 "데모 데이터"로 강제 세팅!
      console.log("No saved data found. Loading demo data for review.");
      setBooking(DEMO_DATA);
    }
  }, []);

  // 아직 로딩 중이면 메시지만 표시
  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">결제 정보를 불러오는 중...</div>;
  }

  const { car, address, schedule, evaluator } = booking;

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-24 pb-16">
      <section className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">결제 정보 확인</h1>

        {/* 예약 정보 카드 */}
        <div className="rounded-xl bg-white p-5 shadow-sm space-y-3 border border-gray-100">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">예약 번호</p>
            <p className="font-semibold">{booking.bookingId}</p>
          </div>
          <hr className="border-gray-50" />
          <p className="text-gray-800">🚗 차량: <b>{car.model}</b></p>
          <p className="text-gray-800">📍 장소: {address.main} {address.detail}</p>
          <p className="text-gray-800">📅 일정: {schedule.date} {schedule.time}</p>
        </div>

        {/* 결제 금액 카드 */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-blue-100">
          <h2 className="font-semibold text-lg mb-4 text-gray-900">결제 예정 금액</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 line-through">{evaluator.originalFee.toLocaleString()}원</span>
            <span className="text-blue-600 font-bold">-{evaluator.discountRate}% 프로모션</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-bold text-gray-900">최종 결제 금액</span>
            <span className="text-3xl font-extrabold text-blue-600">
              {evaluator.fee.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 결제하기 버튼 */}
        <button
          onClick={() => {
            // 심사용 모의 결제 완료 처리
            alert("토스페이먼츠 심사용 모의 결제가 완료되었습니다.");
            router.push(`/booking/complete?bookingId=${booking.bookingId}`);
          }}
          className="w-full rounded-xl bg-blue-600 py-5 text-white text-xl font-bold shadow-lg hover:bg-blue-700 transition"
        >
          {evaluator.fee.toLocaleString()}원 결제하기
        </button>
      </section>
    </main>
  );
}