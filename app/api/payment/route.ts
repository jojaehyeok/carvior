import { NextRequest, NextResponse } from 'next/server';

// 가상의 결제 처리 (실제로는 PG사 API 연동 필요)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, bookingData } = body;
    
    // 결제 방식에 따른 처리
    let paymentResult;
    
    switch (paymentMethod) {
      case '무통장입금':
        // 무통장입금 정보 생성
        const virtualAccount = {
          bank: '카카오뱅크',
          accountNumber: `1234-5678-${Date.now().toString().slice(-4)}`,
          accountHolder: '카바조',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 만료
        };
        paymentResult = {
          method: '무통장입금',
          status: 'PENDING',
          virtualAccount,
          paymentId: `VIRT${Date.now()}`,
        };
        break;
        
      case '카드':
        // 카드 결제 시뮬레이션
        paymentResult = {
          method: '카드',
          status: 'COMPLETED',
          paymentId: `CARD${Date.now()}`,
          approvedAt: new Date().toISOString(),
        };
        break;
        
      case '가상계좌':
        paymentResult = {
          method: '가상계좌',
          status: 'PENDING',
          paymentId: `VACC${Date.now()}`,
        };
        break;
        
      default:
        throw new Error('지원하지 않는 결제 방식입니다');
    }
    
    return NextResponse.json({
      success: true,
      ...paymentResult,
      amount,
      bookingData: {
        carInfo: `${bookingData.carBrand} ${bookingData.carModel}`,
        inspectionDate: bookingData.inspectionDate,
      },
    });
    
  } catch (error) {
    console.error('결제 처리 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}