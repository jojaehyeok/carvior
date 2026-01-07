// app/types/booking.ts
export interface BookingFormData {
  carBrand: string;
  carModel: string;
  carYear: string;
  carType: string;
  plateNumber: string;
  noPlateReason: string;
  inspectionDate: string;
  inspectionTime: string;
  technicianId: string;
  technicianName: string;
  inspectionType: '출장' | '센터방문';
  region: string;
  address: string;
  detailAddress: string;
  userName: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
  requestNote: string;
  contractAssistance: boolean;
  kabazoCare: boolean;
  paymentMethod: '무통장입금' | '카드' | '가상계좌' | '카카오페이' | '토스';
  couponCode: string;
  termsAgreed: boolean;
  termsDetail: {
    warrantyExclusion: boolean;
    inspectionLimit: boolean;
    serviceScope: boolean;
    refundPolicy: boolean;
  };
}
