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
//
// ⚠ 서버 .env에 STORE_ITEMS_INTERNAL_KEY가 있어야 한다. 없으면 백엔드가 403을 주고,
// 로그인한 사람이 계속 로그인 화면으로 돌아간다. 그래서 실패할 때 reason을 같이 내려준다
// (브라우저에서 이 주소를 직접 열면 뭐가 빠졌는지 바로 보인다).
const NEST = process.env.NEST_API_URL ?? 'http://localhost:4000/api';
const INTERNAL_KEY = process.env.STORE_ITEMS_INTERNAL_KEY ?? '';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  const userId = user?.id;
  const email = user?.email;
  if (!userId && !email) {
    return NextResponse.json({ message: '로그인이 필요합니다.', reason: 'no-session' }, { status: 401 });
  }

  // 이미 세션에 토큰이 있으면 그걸 그대로 쓴다(백엔드를 또 부를 필요가 없다)
  const sessionToken = (session?.user as { apiToken?: string } | undefined)?.apiToken;
  if (sessionToken) return NextResponse.json({ token: sessionToken });

  if (!INTERNAL_KEY) {
    console.error('[chat-token] STORE_ITEMS_INTERNAL_KEY 미설정 — 서버 .env 확인 필요');
    return NextResponse.json(
      { message: '서버 설정이 빠져 토큰을 발급할 수 없습니다.', reason: 'missing-internal-key' },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${NEST}/v1/users/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': INTERNAL_KEY },
      // userId가 먼저 — 이메일이 없는 소셜 계정도 있다
      body: JSON.stringify(userId ? { userId } : { email }),
    });
    if (!res.ok) {
      console.error('[chat-token] 백엔드 응답', res.status);
      return NextResponse.json(
        { message: '토큰을 발급하지 못했습니다.', reason: `backend-${res.status}` },
        { status: 502 },
      );
    }
    const data = await res.json().catch(() => null);
    if (!data?.token) {
      return NextResponse.json(
        { message: '계정을 찾을 수 없습니다.', reason: 'user-not-found' },
        { status: 404 },
      );
    }
    return NextResponse.json({ token: data.token });
  } catch (e) {
    console.error('[chat-token] 발급 실패', e);
    return NextResponse.json({ message: '토큰 발급 중 오류가 발생했습니다.', reason: 'fetch-failed' }, { status: 500 });
  }
}
