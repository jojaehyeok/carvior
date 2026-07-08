import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.TOSS_SECRET_KEY ?? 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount } = await req.json();

  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
