import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';

async function resolveUserId(session: any): Promise<number | null> {
  let userId = session?.user?.id;
  if (userId && !isNaN(Number(userId))) return Number(userId);

  const email = session?.user?.email;
  if (!email) return null;
  try {
    const res = await fetch(`${NEST}/v1/users/by-email?email=${encodeURIComponent(email)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const u = await res.json();
      return u?.id ?? null;
    }
  } catch {}
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const email = session.user.email;
  if (!email) return NextResponse.json({ marketingConsent: false });

  try {
    const res = await fetch(`${NEST}/v1/users/by-email?email=${encodeURIComponent(email)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return NextResponse.json({ marketingConsent: false });
    const u = await res.json();
    return NextResponse.json({ marketingConsent: !!u?.marketingConsent });
  } catch {
    return NextResponse.json({ marketingConsent: false });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const userId = await resolveUserId(session);
  if (!userId) return NextResponse.json({ error: '유저를 찾을 수 없습니다' }, { status: 404 });

  const { marketingConsent } = await req.json();
  try {
    const res = await fetch(`${NEST}/v1/users/${userId}/marketing-consent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketingConsent: !!marketingConsent }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({ error: '변경 실패' }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
