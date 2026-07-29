"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BookingLookupResult {
  id: number;
  carNumber: string;
  carModel: string | null;
  address: string;
  preferredDateTime: string;
  status: "PENDING" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  amount: number | null;
  paymentMethod: string | null;
  depositConfirmed: boolean;
  createdAt: string;
  refundPreview: { tier: "FULL" | "FEE" | "NONE"; refundAmount: number; cancelFee: number };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  ASSIGNED: "배정완료",
  COMPLETED: "진단완료",
  CANCELLED: "취소됨",
};

const TIER_LABEL: Record<string, string> = {
  FULL: "전액 환불 대상이에요",
  FEE: "취소수수료(30,000원) 차감 후 환불 대상이에요",
  NONE: "환불이 불가한 시점이에요",
};

export default function InspectionCancelPage() {
  const router = useRouter();

  const [bookingId, setBookingId] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingLookupResult | null>(null);

  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState<{ refundAmount: number } | null>(null);

  const handleLookup = async () => {
    if (!bookingId.trim() || !contact.trim()) {
      setError("예약번호와 연락처를 모두 입력해주세요.");
      return;
    }
    setError(null);
    setBooking(null);
    setCancelDone(null);
    setLoading(true);
    try {
      const res = await fetch(
        `https://carvior.store/api/v1/external/request/${encodeURIComponent(bookingId.trim())}/lookup?contact=${encodeURIComponent(contact.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "예약 정보를 찾을 수 없습니다.");
      setBooking(data);
    } catch (e: any) {
      setError(e.message || "예약 정보를 찾을 수 없습니다. 예약번호와 연락처를 다시 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (!window.confirm("정말 취소하시겠어요? 취소 후에는 되돌릴 수 없어요.")) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(
        `https://carvior.store/api/v1/external/request/${booking.id}/self-cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: contact.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "취소 처리 중 오류가 발생했습니다.");
      setCancelDone({ refundAmount: data.refund.refundAmount });
    } catch (e: any) {
      setError(e.message || "취소 처리 중 오류가 발생했습니다.");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = booking && booking.status !== "COMPLETED" && booking.status !== "CANCELLED";

  return (
    <main className="min-h-screen bg-white px-6 pt-20 pb-16">
      <div className="mx-auto max-w-md">
        <div className="flex items-center mb-8">
          <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">예약 조회 · 취소</h1>
        </div>

        {cancelDone ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center space-y-3">
            <p className="text-2xl">✅</p>
            <p className="font-bold text-gray-900">취소가 완료됐어요.</p>
            <p className="text-sm text-gray-600">
              {cancelDone.refundAmount > 0
                ? `${cancelDone.refundAmount.toLocaleString()}원이 결제하신 수단으로 환불될 예정이에요. 처리에 영업일 기준 며칠 소요될 수 있어요.`
                : "환불 규정상 이번 취소 건은 환불 대상이 아니에요."}
            </p>
            <Link href="/" className="inline-block mt-2 text-sm text-violet-600 underline font-semibold">
              홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="예약번호"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="tel"
                placeholder="연락처 (신청 시 입력한 번호)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleLookup}
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? "조회 중..." : "예약 조회하기"}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            {booking && (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">차량</span>
                  <span className="font-bold text-gray-900">{booking.carModel || "-"} ({booking.carNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">방문 예정</span>
                  <span className="font-bold text-gray-900">{booking.preferredDateTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">주소</span>
                  <span className="font-bold text-gray-900 text-right">{booking.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 금액</span>
                  <span className="font-bold text-gray-900">{(booking.amount ?? 0).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-500">현재 상태</span>
                  <span className="font-bold text-violet-600">{STATUS_LABEL[booking.status] || booking.status}</span>
                </div>

                {canCancel && (
                  <div className="pt-3 mt-1 border-t border-gray-200">
                    <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                      {TIER_LABEL[booking.refundPreview.tier]}
                      {booking.refundPreview.refundAmount > 0 && (
                        <> — 예상 환불액 {booking.refundPreview.refundAmount.toLocaleString()}원</>
                      )}
                    </p>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="w-full bg-red-500 hover:bg-red-400 disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm transition-colors"
                    >
                      {cancelling ? "취소 처리 중..." : "예약 취소하기"}
                    </button>
                  </div>
                )}

                {!canCancel && (
                  <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                    {booking.status === "COMPLETED" ? "이미 진단이 완료된 건이라 취소할 수 없어요." : "이미 취소된 예약이에요."}
                  </p>
                )}
              </div>
            )}

            <p className="text-center text-[11px] text-gray-400">
              <Link href="/policy/refund" target="_blank" className="underline">환불 규정 보기</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
