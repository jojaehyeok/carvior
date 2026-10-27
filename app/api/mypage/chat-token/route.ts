import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 로그인한 사람에게 채팅용 토큰을 내어준다.
//
// 토큰은 로그인하는 순간에만 세션에 실리기 때문에, 채팅이 생기기 전부터 로그인해 있던
// 사람은 토큰이 없다. 그 사람들에게 "다시 로그인하세요"라고 하지 않으려고 이 경로를 둔다.
// 세션을 서버에서 확인한 뒤에만 발급하고, 백엔드 호출은 내부키로 한다.
//
// ⚠ 경로를 바꾸지 말 것 — Apache가 /api/mypage 아래만 Next로 넘겨준다.
// 다른 경로로 만들면 백엔드로 새서 404가 난다.
const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';
const INTERNAL_KEY = process.env.STORE_ITEMS_INTERNAL_KEY ?? '';

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const res = await fetch(`${NEST}/v1/users/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': INTERNAL_KEY },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      return NextResponse.json({ message: '토큰을 발급하지 못했습니다.' }, { status: 502 });
    }
    const data = await res.json();
    if (!data?.token) {
      return NextResponse.json({ message: '계정을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ token: data.token });
  } catch {
    return NextResponse.json({ message: '토큰 발급 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
