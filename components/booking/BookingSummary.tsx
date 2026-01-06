'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BookingDetails {
    id: string;
    carModel: string;
    address: {
        main: string;
        detail: string;
    };
    date: string;
    time: string;
    evaluator: {
        name: string;
        rating: number;
        fee: number;
    };
    status: string;
    createdAt: string;
}

export default function BookingCompletePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('id');

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 예약 정보 가져오기 (실제로는 API 호출)
        const storedBooking = localStorage.getItem('lastBooking');
        if (storedBooking) {
            const parsedBooking = JSON.parse(storedBooking);
            setBooking(parsedBooking);
        }
        setIsLoading(false);
    }, []);

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
                        href="/booking"
                        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        새 예약하기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* 성공 메시지 */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        예약이 완료되었습니다!
                    </h1>
                    <p className="text-gray-600">
                        평가사가 입력하신 정보를 확인하고 연락드릴 예정입니다.
                    </p>
                    <div className="mt-4 inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        예약번호: {booking.id}
                    </div>
                </div>

                {/* 예약 상세 정보 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">예약 상세 정보</h2>

                    <div className="space-y-6">
                        {/* 차량 정보 */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">차량 정보</h3>
                            <p className="text-gray-800">{booking.carModel}</p>
                        </div>

                        {/* 평가장소 */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">평가장소</h3>
                            <p className="text-gray-800">{booking.address.main}</p>
                            {booking.address.detail && (
                                <p className="text-gray-800 text-sm mt-1">{booking.address.detail}</p>
                            )}
                        </div>

                        {/* 평가일시 */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">평가일시</h3>
                            <p className="text-gray-800">
                                {new Date(booking.date).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long',
                                })}
                            </p>
                            <p className="text-gray-800">{parseInt(booking.time)}시</p>
                        </div>

                        {/* 평가사 정보 */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">담당 평가사</h3>
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="font-medium text-gray-900">{booking.evaluator.name} 평가사</p>
                                    <div className="flex items-center mt-1">
                                        <span className="text-yellow-500">★</span>
                                        <span className="ml-1 text-sm">{booking.evaluator.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 결제 정보 */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">총 결제금액</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {booking.evaluator.fee.toLocaleString()}원
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 안내사항 */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                    <h3 className="font-semibold text-blue-900 mb-3">📋 예약 후 안내사항</h3>
                    <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>평가사가 예약 확정 후 1시간 내로 연락드릴 예정입니다</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>평가일 전날 저녁까지 최종 확인 연락이 갑니다</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>문의사항은 1544-XXXX로 연락주시기 바랍니다</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>예약 취소는 평가일 2시간 전까지 가능합니다</span>
                        </li>
                    </ul>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg text-center hover:bg-gray-50"
                    >
                        홈으로 돌아가기
                    </Link>
                    <Link
                        href="/my-bookings"
                        className="flex-1 py-4 bg-blue-600 text-white font-semibold rounded-lg text-center hover:bg-blue-700"
                    >
                        내 예약 확인하기
                    </Link>
                </div>

                {/* 추가 정보 */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        예약 관련 문의: 1544-XXXX (평일 09:00-18:00)
                    </p>
                </div>
            </div>
        </div>
    );
}
