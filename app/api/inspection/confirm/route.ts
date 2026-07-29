import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.TOSS_SECRET_KEY ?? 'live_gsk_EP59LybZ8BlWyb9jXnmkV6GYo7pR';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    paymentKey, orderId, amount, carNumber, carOwner, contact, address, preferredDateTime, email,
    dealerName, dealerContact, listingUrl, carOrigin,
  } = body;

  // 1. 토스 결제 확인
  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await tossRes.json();

  // 2. 결제 성공 시 백엔드 저장 + 관리자 알림 (fire-and-forget)
  if (data.status === 'DONE') {
    const orderPayload = {
      source:            'CARVIOR_INSPECTION',
      carNumber:         carNumber  ?? '',
      carOwner:          carOwner   ?? '',
      contact:           contact    ?? '',
      address:           address    ?? '',
      preferredDateTime: preferredDateTime ?? '',
      paymentMethod:     'TOSS_TRANSFER',
      amount,
      carOrigin:         carOrigin ?? null,
      paymentKey,
      orderId,
      email:             email ?? '',
      dealerName:        dealerName ?? '',
      dealerContact:     dealerContact ?? '',
      listingUrl:        listingUrl ?? '',
    };

    // 백엔드 저장
    fetch('https://carvior.store/api/v1/external/request', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(orderPayload),
    }).catch(() => {});

    // 관리자 알림 (기존 SMS 채널)
    fetch('https://carvior.store/api/v1/admin/notify/inspection-paid', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        orderId,
        carNumber: carNumber ?? '-',
        carOwner:  carOwner  ?? '-',
        contact:   contact   ?? '-',
        amount,
      }),
    }).catch(() => {});
  }

  return NextResponse.json(data, { status: tossRes.status });
}
