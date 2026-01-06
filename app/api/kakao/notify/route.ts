import { NextRequest, NextResponse } from 'next/server';

// 카카오 알림톡 발송 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      phoneNumber,
      userName,
      technicianName,
      inspectionDate,
      bookingNumber,
    } = body;
    
    // 실제 카카오 알림톡 API 엔드포인트와 API 키 (환경변수에서 관리)
    const KAKAO_API_URL = 'https://kakaoapi.example.com/alimtalk/v2/send';
    const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
    
    // 알림톡 템플릿 메시지 구성
    const messages = [
      // 1. 고객에게 발송
      {
        to: phoneNumber,
        templateCode: 'BOOKING_CONFIRMATION_CUSTOMER',
        variables: {
          '#{고객명}': userName,
          '#{예약번호}': bookingNumber,
          '#{정비사}': technicianName,
          '#{검수일시}': inspectionDate,
          '#{차량정보}': '기아 EV4',
        },
      },
      // 2. 정비사에게 발송 (딜러 번호 필요)
      {
        to: process.env.TECHNICIAN_PHONE, // 정비사 전화번호
        templateCode: 'BOOKING_ASSIGNED_TECH',
        variables: {
          '#{정비사명}': technicianName,
          '#{고객명}': userName,
          '#{고객연락처}': phoneNumber,
          '#{검수일시}': inspectionDate,
          '#{검수장소}': body.address || '출장 검수',
        },
      },
    ];
    
    // 실제 카카오 API 호출 (시뮬레이션)
    const response = await fetch(KAKAO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KAKAO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        senderKey: process.env.KAKAO_SENDER_KEY,
      }),
    });
    
    if (!response.ok) {
      throw new Error('카카오 알림톡 발송 실패');
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: '알림톡이 발송되었습니다',
      result,
    });
    
  } catch (error) {
    console.error('카카오 알림톡 오류:', error);
    
    // 에러 발생시에도 예약은 진행되도록 (알림톡 실패는 치명적이지 않음)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알림톡 발송 중 오류',
      note: '예약은 정상 처리되었으나 알림 발송에 실패했습니다',
    });
  }
}