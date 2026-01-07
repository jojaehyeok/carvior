"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CompletedBooking {
  bookingId: string;
  status: string;
  createdAt: string;
  car: {
    model: string;
  };
  address: {
    main: string;
    detail: string;
  };
  schedule: {
    date: string;
    time: string;
  };
  evaluator: {
    id: number;
    name: string;
    title: string;
    avatar: string;
    rating: number;
    fee: number;
    originalFee: number;
    discountRate?: number;
    type: string;
    region: string;
  };
}

export default function PaymentPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<CompletedBooking | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("completedBooking");

    if (!saved) {
      alert("결제 정보가 없습니다. 다시 예약을 진행해주세요.");
      router.push("/");
      return;
    }

    setBooking(JSON.parse(saved));
  }, [router]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">결제 정보를 불러오는 중...</p>
      </div>
    );
  }

  const { car, address, schedule, evaluator } = booking;

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-24 pb-16">
      <section className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          결제 정보 확인
        </h1>

        {/* 예약 요약 */}
        <div className="rounded-xl bg-white p-5 shadow-sm space-y-3">
          <p className="text-sm text-gray-500">예약 번호</p>
          <p className="font-semibold">{booking.bookingId}</p>

          <hr />

          <p>🚗 차량: <b>{car.model}</b></p>
          <p>📍 장소: {address.main} {address.detail}</p>
          <p>
            📅 일정:{" "}
            {new Date(schedule.date).toLocaleDateString("ko-KR")}{" "}
            {schedule.time}
          </p>
        </div>

        {/* 평가사 정보 */}
        <div className="rounded-xl bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-lg">평가사</h2>
          <p>{evaluator.name}</p>
          <p className="text-sm text-gray-500">{evaluator.type}</p>
          <p className="text-sm text-gray-500">{evaluator.region}</p>
        </div>

        {/* 금액 */}
        <div className="rounded-xl bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-lg">결제 금액</h2>

          {evaluator.discountRate && (
            <p className="text-sm text-gray-400 line-through">
              {evaluator.originalFee.toLocaleString()}원
            </p>
          )}

          <p className="text-2xl font-bold text-blue-600">
            {evaluator.fee.toLocaleString()}원
          </p>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={() => {
            alert("결제가 완료되었습니다 (모의)");
            router.push(`/booking/complete?bookingId=${booking.bookingId}`);
          }}
          className="w-full rounded-xl bg-blue-600 py-4 text-white font-semibold hover:bg-blue-700 transition"
        >
          결제하기
        </button>
      </section>
    </main>
  );
}
