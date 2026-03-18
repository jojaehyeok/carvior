// app/api/kakao/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SolapiMessageService } from 'solapi';

// 솔라피 서비스 초기화 (환경변수에 키 저장 권장)
const messageService = new SolapiMessageService(
  "NCSKIUSGBTJ4SHP4",
  "IEQPZD37Q7RM4XCLN90ABWZXCL1PYY9G"
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealerName, contact, carNumber, preferredDateTime } = body;

    console.log(`[실제 발송 시도] 대상: ${dealerName}(${contact})`);

    // ✅ 우선 알림톡 승인 전이므로 SMS로 테스트 발송합니다.
    // ✅ 수정 후 (예시: 본인 인증받은 번호가 010-1234-5678 이라면)
    const result = await messageService.sendOne({
      to: contact,
      from: "01022856017", // 숫자만 입력 (문자열 형태)
      text: `[차바타] 신청확인\n${dealerName}님, ${carNumber}차량 진단이 ${preferredDateTime}에 접수되었습니다.`,
      type: "SMS"
    });

    console.log('[발송 결과]', result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('솔라피 발송 에러:', error);
    return NextResponse.json({ success: false, error: '발송 실패' }, { status: 500 });
  }
}