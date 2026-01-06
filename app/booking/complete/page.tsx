"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CompletedBooking {
  bookingId: string;
  carModel: string;
  address: { main: string; detail: string };
  date: string;
  time: string;
  evaluator: {
    name: string;
    rating: number;
    fee: number;
    specialty: string[];
  };
  status: string;
  createdAt: string;
}

export default function BookingCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState<CompletedBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedBooking = localStorage.getItem('completedBooking');
    if (savedBooking) {
      try {
        const parsedBooking = JSON.parse(savedBooking);

        // ✅ 데이터 구조 검증 및 기본값 설정
        const validatedBooking = {
          ...parsedBooking,
          evaluator: {
            name: parsedBooking.evaluator?.name ?? '선택된 평가사',
            specialty: Array.isArray(parsedBooking.evaluator?.specialty)
              ? parsedBooking.evaluator.specialty
              : [], // 배열이 아니면 빈 배열로 설정
            fee: parsedBooking.evaluator?.fee ?? 0,
            // ... 다른 필드들
          }
        };

        setBooking(validatedBooking);
      } catch (error) {
        console.error('예약 데이터 파싱 오류:', error);
        setBooking(null);
      }
    }
    setIsLoading(false);
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">예약 정보를 찾을 수 없습니다</h2>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 성공 메시지 */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            예약이 완료되었습니다! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            평가사가 입력하신 정보를 확인하고 연락드릴 예정입니다.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full">
            <span className="font-medium">예약번호:</span>
            <span className="font-mono font-bold">{booking.bookingId}</span>
          </div>
        </div>

        {/* 예약 상세 정보 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
            예약 상세 정보
          </h2>

          <div className="space-y-8">
            {/* 차량 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                차량 정보
              </h3>
              <p className="text-xl font-semibold text-gray-900">{booking.carModel}</p>
            </div>

            {/* 평가장소 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                평가장소
              </h3>
              <p className="text-lg font-medium text-gray-900">{booking.address.main}</p>
              {booking.address.detail && (
                <p className="text-gray-700 mt-1">{booking.address.detail}</p>
              )}
            </div>

            {/* 평가일시 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                평가일시
              </h3>
              <p className="text-lg font-medium text-gray-900">
                {new Date(booking.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
              <p className="text-gray-700 mt-1">{parseInt(booking.time)}시</p>
            </div>

            {/* 담당 평가사 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                담당 평가사
              </h3>
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {booking.evaluator.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{booking.evaluator.name} 평가사</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 font-semibold">{booking.evaluator.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {booking.evaluator?.specialty?.join(', ') ?? '다양한 차종'} 전문
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    결제 금액
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {booking.evaluator.fee.toLocaleString()}원
                  </p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-full">
                  결제 완료
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="bg-white rounded-2xl border border-blue-200 p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            예약 후 안내사항
          </h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <span className="mr-3">📞</span>
              <span><strong>평가사 연락:</strong> 예약 후 1시간 이내로 평가사가 직접 연락드립니다</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">⏰</span>
              <span><strong>평가 전 확인:</strong> 평가일 전날 오후 6시까지 최종 확인 연락이 갑니다</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">🚗</span>
              <span><strong>차량 준비:</strong> 평가사 도착 30분 전까지 차량을 준비해주세요</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">❌</span>
              <span><strong>예약 취소:</strong> 평가 2시간 전까지는 무료 취소 가능합니다</span>
            </li>
          </ul>
        </div>

        {/* 연락처 정보 */}
        <div className="text-center p-6 bg-gray-50 rounded-2xl mb-8">
          <p className="text-gray-700 mb-2">
            예약 관련 문의사항이 있으신가요?
          </p>
          <p className="text-2xl font-bold text-blue-600">
            1544-XXXX
          </p>
          <p className="text-sm text-gray-500 mt-2">
            (평일 09:00-18:00, 주말 10:00-17:00)
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-bold rounded-xl text-center hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-4 px-6 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            예약 내역 출력
          </button>
        </div>

        {/* 추가 정보 */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            감사합니다. 안전한 중고차 구매를 위해 최선을 다하겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}