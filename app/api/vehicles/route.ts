import { NextResponse } from 'next/server';

const NEST_BASE = 'http://localhost:4000/api/v1/external/store-items';
const INTERNAL_KEY = process.env.STORE_ITEMS_INTERNAL_KEY ?? '';

// 홈페이지 "검차 차량 보기" — 로그인/딜러승인 없이 누구나 볼 수 있는 공개 매물 목록.
// 민감정보(adminMemo, sellerContact)가 이미 빠져있는 v1/external/store-items를 그대로 프록시한다.
export async function GET() {
  try {
    const res = await fetch(NEST_BASE, {
      headers: { 'x-internal-key': INTERNAL_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
