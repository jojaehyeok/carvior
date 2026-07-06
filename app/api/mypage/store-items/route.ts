import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const userId = (session.user as any).id;
  try {
    const res = await fetch(`${NEST}/v1/admin/store-items/my?userId=${userId}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  const body = await req.json();
  try {
    const res = await fetch(`${NEST}/v1/admin/store-items?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({ error: '업데이트 실패' }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
