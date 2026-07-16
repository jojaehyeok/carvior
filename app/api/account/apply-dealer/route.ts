import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';
const INTERNAL_KEY = process.env.STORE_ITEMS_INTERNAL_KEY ?? '';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.dealerLicenseUrl) {
    return NextResponse.json({ error: '자동차 매매종사원증을 업로드해주세요.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${NEST}/v1/users/${userId}/apply-dealer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': INTERNAL_KEY },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message ?? '신청 실패' }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '서버와 통신할 수 없습니다.' }, { status: 500 });
  }
}
