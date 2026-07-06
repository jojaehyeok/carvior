import { NextRequest, NextResponse } from 'next/server';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${NEST}/v1/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : res.status });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const itemId = req.nextUrl.searchParams.get('itemId');
  try {
    const res = await fetch(`${NEST}/v1/proposals/count?itemId=${itemId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return NextResponse.json({ count: 0 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
