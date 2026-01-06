'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressSelector from './AddressSelector';
import DateTimeSelector from './DateSelector';
import EvaluatorSelector from '../EvaluatorSelector';
import BookingSummary from './BookingSummary';

interface BookingData {
  step: number;
  carModel: string;
  address: {
    main: string;
    detail: string;
  };
  date: string;
  time: string;
  evaluator: any;
}

export default function BookingFlow() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData>({
    step: 1,
    carModel: '',
    address: { main: '', detail: '' },
    date: '',
    time: '',
    evaluator: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 차량 모델 설정
  const handleCarModelSelect = (model: string) => {
    setBookingData(prev => ({ ...prev, carModel: model }));
  };

  // 주소 설정
  const handleAddressSelect = (main: string, detail: string) => {
    setBookingData(prev => ({ 
      ...prev, 
      address: { main, detail } 
    }));
  };

  // 날짜/시간 설정
  const handleDateTimeSelect = (date: string, time: string) => {
    setBookingData(prev => ({ ...prev, date, time }));
  };

  // 평가사 선택
  const handleEvaluatorSelect = (evaluator: any) => {
    setBookingData(prev => ({ ...prev, evaluator }));
  };

  // 다음 단계로 이동
  const nextStep = () => {
    if (bookingData.step < 4) {
      setBookingData(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  // 이전 단계로 이동
  const prevStep = () => {
    if (bookingData.step > 1) {
      setBookingData(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  // 예약 확정
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 예약 데이터 저장 (실제로는 API 호출)
      const bookingId = `booking-${Date.now()}`;
      localStorage.setItem('lastBooking', JSON.stringify({
        ...bookingData,
        id: bookingId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));
      
      // 예약 완료 페이지로 이동
      router.push(`/booking/complete?id=${bookingId}`);
      
    } catch (error) {
      console.error('예약 실패:', error);
      alert('예약 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 단계별 렌더링
  const renderStep = () => {
    switch (bookingData.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">1. 차량 정보 입력</h3>
              <input
                type="text"
                value={bookingData.carModel}
                onChange={(e) => handleCarModelSelect(e.target.value)}
                placeholder="예: 아반떼 2023년식"
                className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={nextStep}
              disabled={!bookingData.carModel}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              다음 단계
            </button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">2. 평가장소 선택</h3>
              <AddressSelector onAddressSelect={handleAddressSelect} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={nextStep}
                disabled={!bookingData.address.main}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                다음 단계
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">3. 평가일시 선택</h3>
              <DateTimeSelector onDateTimeSelect={handleDateTimeSelect} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">4. 평가사 선택</h3>
              <EvaluatorSelector onSelect={handleEvaluatorSelect} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={nextStep}
                disabled={!bookingData.date || !bookingData.time || !bookingData.evaluator}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                예약 확인
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <BookingSummary
            carModel={bookingData.carModel}
            address={bookingData.address}
            date={bookingData.date}
            time={bookingData.time}
            evaluator={bookingData.evaluator}
            onConfirm={handleConfirmBooking}
            isLoading={isSubmitting}
          />
        );
      
      default:
        return null;
    }
  };

  // 진행 상황 표시
  const steps = [
    { number: 1, title: '차량정보' },
    { number: 2, title: '평가장소' },
    { number: 3, title: '일시/평가사' },
    { number: 4, title: '예약확정' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 진행 상태 바 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                ${bookingData.step >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {step.number}
              </div>
              <span className="text-xs mt-2 text-gray-600">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((bookingData.step - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* 현재 단계 내용 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
}