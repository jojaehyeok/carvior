'use client';

import React from 'react';

interface BookingSummaryProps {
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
    specialty: string[];
  };
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function BookingSummary({
  carModel,
  address,
  date,
  time,
  evaluator,
  onConfirm,
  isLoading = false,
}: BookingSummaryProps) {
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const calculateTotal = () => {
    return evaluator.fee;
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          예약 정보 확인
        </h3>
        
        <div className="space-y-4">
          {/* 차량 정보 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">차량 정보</h4>
            <p className="text-gray-800">{carModel}</p>
          </div>
          
          {/* 평가장소 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">평가장소</h4>
            <p className="text-gray-800">{address.main}</p>
            {address.detail && (
              <p className="text-gray-800 text-sm mt-1">{address.detail}</p>
            )}
          </div>
          
          {/* 평가일시 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">평가일시</h4>
            <p className="text-gray-800">{formatDate(date)}</p>
            <p className="text-gray-800">{parseInt(time)}시</p>
          </div>
          
          {/* 평가사 정보 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">선택한 평가사</h4>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{evaluator.name} 평가사</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-sm">{evaluator.rating}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({evaluator.specialty.join(', ')} 전문)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  {evaluator.fee.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>
          
          {/* 결제 정보 */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">평가비용</span>
              <span className="font-medium">{evaluator.fee.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-300 pt-2">
              <span className="font-semibold text-gray-900">총 결제금액</span>
              <span className="text-xl font-bold text-blue-600">
                {calculateTotal().toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 주의사항 */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 평가사 도착 30분 전까지 차량을 준비해주세요</li>
          <li>• 취소는 예약시간 2시간 전까지 가능합니다</li>
          <li>• 날씨나 교통상황에 따라 약간의 지연이 있을 수 있습니다</li>
        </ul>
      </div>
      
      {/* 확인 버튼 */}
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="
          w-full
          py-4
          bg-blue-600 text-white
          font-semibold
          rounded-lg
          hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition
        "
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            처리 중...
          </span>
        ) : (
          '예약 확정하기'
        )}
      </button>
    </div>
  );
}