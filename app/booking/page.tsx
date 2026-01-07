'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CarInfoSection from '@/components/booking/CarInfoSection';
// import ScheduleSection from '@/components/booking/ScheduleSection';
import AddressSection from '@/components/booking/AddressSelector';
// import UserInfoSection from '@/components/booking/UserInfoSection';
// import RequestSection from '@/components/booking/RequestSection';
// import ServiceSection from '@/components/booking/ServiceSection';
// import PaymentSection from '@/components/booking/PaymentSection';
// import TermsSection from '@/components/booking/TermsSection';

type Props = {
  formData: BookingFormData;
  updateField: <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => void;
  errors: Partial<Record<keyof BookingFormData, string>>;
};

interface BookingFormData {
  // 차량 정보
  carBrand: string;
  carModel: string;
  carYear: string;
  carType: string;
  plateNumber: string;
  noPlateReason: string;
  
  // 일정 정보
  inspectionDate: string;
  inspectionTime: string;
  technicianId: string;
  technicianName: string;
  
  // 주소 정보
  inspectionType: '출장' | '센터방문';
  region: string;
  address: string;
  detailAddress: string;
  
  // 사용자 정보
  userName: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
  
  // 요청사항
  requestNote: string;
  
  // 부가 서비스
  contractAssistance: boolean;
  kabazoCare: boolean;
  
  // 결제 정보
  paymentMethod: '무통장입금' | '카드' | '가상계좌' | '카카오페이' | '토스';
  couponCode: string;
  
  // 약관 동의
  termsAgreed: boolean;
  termsDetail: {
    warrantyExclusion: boolean;
    inspectionLimit: boolean;
    serviceScope: boolean;
    refundPolicy: boolean;
  };
}

export default function BookingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>({
    carBrand: '기아',
    carModel: 'EV4',
    carYear: '25년~현재',
    carType: '스탠다드',
    plateNumber: '',
    noPlateReason: '',
    inspectionDate: '2025-01-05',
    inspectionTime: '20:00',
    technicianId: 'tech-001',
    technicianName: '김중희 정비사',
    inspectionType: '출장',
    region: '서울 강동권역',
    address: '',
    detailAddress: '',
    userName: '',
    phoneNumber: '',
    isPhoneVerified: false,
    requestNote: '정비사님만 현장에 방문해주세요',
    contractAssistance: false,
    kabazoCare: true,
    paymentMethod: '무통장입금',
    couponCode: '',
    termsAgreed: false,
    termsDetail: {
      warrantyExclusion: false,
      inspectionLimit: false,
      serviceScope: false,
      refundPolicy: false,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 가격 계산
  const calculateTotal = () => {
    let total = 120000; // 기본 검수료
    
    // 부가 서비스 추가
    if (formData.contractAssistance) {
      total += 25000;
    }
    
    // VAT 10% 추가
    total = Math.floor(total * 1.1);
    
    return total;
  };
  
  // 필드 업데이트
  const updateField = <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.plateNumber && !formData.noPlateReason) {
      newErrors.plateNumber = '차량 번호를 입력하거나 신차 여부를 선택해주세요';
    }
    
    if (!formData.address) {
      newErrors.address = '상세 주소를 입력해주세요';
    }
    
    if (!formData.userName) {
      newErrors.userName = '이름을 입력해주세요';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = '휴대폰 번호를 입력해주세요';
    } else if (!/^01[0-9]{8,9}$/.test(formData.phoneNumber.replace(/[^0-9]/g, ''))) {
      newErrors.phoneNumber = '올바른 휴대폰 번호를 입력해주세요';
    }
    
    if (!formData.termsAgreed) {
      newErrors.termsAgreed = '약관에 동의해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 예약 제출
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('필수 정보를 모두 입력해주세요');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. 결제 처리 API 호출
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          paymentMethod: formData.paymentMethod,
          bookingData: formData,
        }),
      });
      
      if (!paymentResponse.ok) {
        throw new Error('결제 처리 중 오류가 발생했습니다');
      }
      
      const paymentResult = await paymentResponse.json();
      
      // 2. 예약 생성 API 호출
      const bookingResponse = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          paymentId: paymentResult.paymentId,
          totalAmount: calculateTotal(),
          bookingNumber: `INSP${Date.now()}`,
        }),
      });
      
      if (!bookingResponse.ok) {
        throw new Error('예약 생성 중 오류가 발생했습니다');
      }
      
      const bookingResult = await bookingResponse.json();
      
      // 3. 카카오 알림톡 발송
      await fetch('/api/kakao/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingResult.bookingId,
          phoneNumber: formData.phoneNumber,
          userName: formData.userName,
          technicianName: formData.technicianName,
          inspectionDate: `${formData.inspectionDate} ${formData.inspectionTime}`,
          bookingNumber: bookingResult.bookingNumber,
        }),
      });
      
      // 4. 예약 완료 페이지로 이동
      router.push(`/booking/complete?id=${bookingResult.bookingId}`);
      
    } catch (error) {
      console.error('예약 실패:', error);
      alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">중고차 검수 예약</h1>
          <p className="text-sm text-gray-600 mt-2">
            판매자(딜러)에게 검수 서비스 이용에 대해 미리 안내를 해주셔야 원활한 검수가 가능해요.
          </p>
        </div>
        
        {/* 예약 폼 */}
        {/* <div className="space-y-6">
          <CarInfoSection 
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
          
          <ScheduleSection 
            formData={formData}
            updateField={updateField}
          />
          
          <AddressSection 
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
          
          <UserInfoSection 
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
          
          <RequestSection 
            formData={formData}
            updateField={updateField}
          />
          
          <ServiceSection 
            formData={formData}
            updateField={updateField}
          />
          
          <PaymentSection 
            formData={formData}
            updateField={updateField}
            totalAmount={calculateTotal()}
          />
          
          <TermsSection 
            formData={formData}
            updateField={updateField}
            errors={errors}
          /> */}
          
          {/* 결제 버튼 */}
          <div className="pt-6 border-t border-gray-200">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">총 결제 금액</span>
                <span className="text-2xl font-bold text-blue-600">
                  {calculateTotal().toLocaleString()}원
                </span>
              </div>
              <p className="text-sm text-gray-500">
                검수 전날 18시까지 100% 환불 가능해요
              </p>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  처리 중...
                </span>
              ) : (
                '결제하기'
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              정비사가 예약을 승인하면 정비사의 연락처를 공유드릴게요.
            </p>
          </div>
        </div>
      </div>
  );
}