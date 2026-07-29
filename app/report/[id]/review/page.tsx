"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ReviewTargetData {
  bookingId?: number;
  driverName?: string | null;
  assignedDriverId?: string | null;
  isConsumerBooking?: boolean;
  car_info: { number: string };
}

export default function ReportReviewPage() {
  const { id } = useParams();

  const [data, setData] = useState<ReviewTargetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "duplicate" | "error">("idle");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    fetch(`https://carvior.store/api/v1/external/inspection/report/by-hash/${id}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch((err) => { if (err.name !== "AbortError") setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  const submit = async () => {
    if (!data?.bookingId || rating === 0 || submitting) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("bookingId", String(data.bookingId));
      if (data.assignedDriverId) form.append("driverId", data.assignedDriverId);
      if (data.driverName) form.append("driverName", data.driverName);
      form.append("carNumber", data.car_info.number);
      form.append("rating", String(rating));
      form.append("comment", comment);
      photos.forEach((f) => form.append("photos", f));

      const res = await fetch("https://carvior.store/api/v1/reviews", { method: "POST", body: form });
      if (res.status === 409) setStatus("duplicate");
      else if (!res.ok) throw new Error();
      else setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2 bg-gray-50">
        <p className="text-2xl">😥</p>
        <p className="text-gray-600">리포트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!data.isConsumerBooking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2 bg-gray-50 px-6 text-center">
        <p className="text-2xl">🙏</p>
        <p className="text-gray-600">이 리포트는 후기 작성 대상이 아니에요.</p>
        <Link href={`/report/${id}`} className="mt-4 text-sm font-semibold text-blue-600 underline">리포트로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-5 py-10">
        <Link href={`/report/${id}`} className="text-xs text-gray-400 hover:text-gray-600">← 리포트 보기</Link>

        <div className="mt-6 mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center text-2xl">🔍</div>
          <h1 className="text-xl font-black text-gray-900">
            {data.driverName ? `${data.driverName} 평가사님,` : "검차는"}
            <br />어떠셨나요?
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {data.car_info.number} 차량 검차 서비스는 어떠셨나요? 남겨주신 후기는 다른 고객분들께 큰 도움이 됩니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {status === "done" ? (
            <p className="py-10 text-sm text-center text-gray-500">소중한 후기 감사합니다! 🙏</p>
          ) : status === "duplicate" ? (
            <p className="py-10 text-sm text-center text-gray-500">이미 후기를 남겨주셨어요. 감사합니다!</p>
          ) : (
            <>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`text-4xl leading-none transition-colors ${n <= rating ? "text-amber-400" : "text-gray-200"}`}
                    aria-label={`${n}점`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="후기를 남겨주세요 (선택)"
                rows={4}
                className="w-full p-3 mb-3 text-sm border rounded-xl border-gray-200 focus:outline-none focus:border-blue-400"
              />
              <label className="block mb-4">
                <span className="block mb-1.5 text-xs font-bold text-gray-500">사진 첨부 (선택, 최대 3장)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, 3))}
                  className="text-xs text-gray-400"
                />
              </label>
              {status === "error" && (
                <p className="mb-3 text-xs text-red-500">후기 등록 중 오류가 발생했습니다. 다시 시도해주세요.</p>
              )}
              <button
                onClick={submit}
                disabled={rating === 0 || submitting}
                className="w-full py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl disabled:bg-gray-200 disabled:text-gray-400"
              >
                {submitting ? "등록 중..." : "후기 등록하기"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
