import { NextRequest, NextResponse } from 'next/server';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${NEST}/v1/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message ?? '회원가입 실패' }, { status: res.status });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
