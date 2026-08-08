import { NextRequest, NextResponse } from 'next/server';

// 가맹점 승인 완료 후 이메일로 발급받는 진짜 값으로 .env에서 채워야 실결제가 됨.
// 승인 전엔 CLIENT_SECRET이 없어 아래 fetch가 401로 실패하므로, 가짜 성공 처리는 불가능함(의도된 안전장치).
const NAVERPAY_CLIENT_ID     = process.env.NEXT_PUBLIC_NAVERPAY_CLIENT_ID ?? 'HN3GGCMDdTgGUfl0kFCo';
const NAVERPAY_CLIENT_SECRET = process.env.NAVERPAY_CLIENT_SECRET ?? '';
const NAVERPAY_PARTNER_ID    = process.env.NAVERPAY_PARTNER_ID ?? '';
const NAVERPAY_CHAIN_ID      = process.env.NEXT_PUBLIC_NAVERPAY_CHAIN_ID ?? '';
const NAVERPAY_MODE          = process.env.NEXT_PUBLIC_NAVERPAY_MODE ?? 'development';

// 개발(dev.apis.naver.com) / 운영(apis.naver.com) 엔드포인트 — partnerId는 가맹점 승인 시 함께 발급됨
function approveUrl(paymentId: string) {
  const host = NAVERPAY_MODE === 'production' ? 'apis.naver.com' : 'dev.apis.naver.com';
  return `https://${host}/${NAVERPAY_PARTNER_ID}/naverpay/payments/v2.2/apply/payment?paymentId=${encodeURIComponent(paymentId)}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    paymentId, merchantPayKey, amount,
    carNumber, carOwner, contact, address, preferredDateTime, email,
    dealerName, dealerContact, listingUrl, carOrigin,
  } = body;

  if (!paymentId || !merchantPayKey) {
    return NextResponse.json({ code: 'Fail', message: 'paymentId/merchantPayKey가 없습니다.' }, { status: 400 });
  }
  if (!NAVERPAY_CLIENT_SECRET || !NAVERPAY_PARTNER_ID) {
    // 가맹점 승인 전(아직 진짜 키가 없는 상태) — 여기서 실패시켜 "결제 안 됐는데 접수된" 사고를 막는다.
    return NextResponse.json({ code: 'Fail', message: '네이버페이 가맹점 승인이 아직 완료되지 않았습니다.' }, { status: 501 });
  }

  // 1. 네이버페이 결제 승인
  const npRes = await fetch(approveUrl(paymentId), {
    method: 'POST',
    headers: {
      'X-Naver-Client-Id': NAVERPAY_CLIENT_ID,
      'X-Naver-Client-Secret': NAVERPAY_CLIENT_SECRET,
      ...(NAVERPAY_CHAIN_ID ? { 'X-NaverPay-Chain-Id': NAVERPAY_CHAIN_ID } : {}),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // paymentId를 쿼리·바디 둘 다에 실어서 보냄 — 정식 문서를 아직 확인 못해 어느 쪽을 보는지
    // 불확실하니 양쪽 다 채워서 가맹점 승인 후 실제 응답으로 검증할 때까지의 리스크를 줄임.
    body: new URLSearchParams({ paymentId }).toString(),
  });
  const data = await npRes.json();
  const ok = npRes.ok && data?.code === 'Success';

  // 2. 승인 성공 시 백엔드 저장 + 관리자 알림 (fire-and-forget) — 토스 결제 확인 라우트와 동일 패턴
  if (ok) {
    const orderPayload = {
      source:            'CARVIOR_INSPECTION',
      carNumber:         carNumber  ?? '',
      carOwner:          carOwner   ?? '',
      contact:           contact    ?? '',
      address:           address    ?? '',
      preferredDateTime: preferredDateTime ?? '',
      paymentMethod:     'NAVERPAY',
      amount,
      carOrigin:         carOrigin ?? null,
      paymentKey:        paymentId,
      orderId:           merchantPayKey,
      email:             email ?? '',
      dealerName:        dealerName ?? '',
      dealerContact:     dealerContact ?? '',
      listingUrl:        listingUrl ?? '',
    };

    fetch('https://carvior.store/api/v1/external/request', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(orderPayload),
    }).catch(() => {});

    fetch('https://carvior.store/api/v1/admin/notify/inspection-paid', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        orderId: merchantPayKey,
        carNumber: carNumber ?? '-',
        carOwner:  carOwner  ?? '-',
        contact:   contact   ?? '-',
        amount,
      }),
    }).catch(() => {});
  }

  return NextResponse.json(data, { status: ok ? 200 : (npRes.status || 400) });
}
