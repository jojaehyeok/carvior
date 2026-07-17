import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isApprovedDealer } from '@/lib/dealerAccess';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';
const INTERNAL_KEY = process.env.STORE_ITEMS_INTERNAL_KEY ?? '';

// 딜러 세션에서 서버사이드로 뽑아낸 id/name만 신뢰 — 클라이언트가 dealerId를 조작할 수 없게 함
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!isApprovedDealer(session)) {
    return NextResponse.json({ error: '딜러 승인 후 이용 가능한 서비스입니다.' }, { status: 403 });
  }

  const dealerId = (session?.user as any)?.id;
  const dealerName = session?.user?.name ?? '딜러';

  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount < 1_000_000) {
    return NextResponse.json({ error: '100만원 이상 입력해주세요.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${NEST}/v1/external/store-items/${id}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': INTERNAL_KEY },
      body: JSON.stringify({
        dealerId: dealerId ? Number(dealerId) : undefined,
        dealerName,
        amount,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message ?? '입찰에 실패했습니다.' }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '서버와 통신할 수 없습니다.' }, { status: 500 });
  }
}
