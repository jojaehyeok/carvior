'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * 채팅에 쓰는 백엔드 토큰을 가져온다.
 *
 * 토큰은 로그인하는 순간에만 세션에 실린다. 채팅이 생기기 전부터 로그인해 있던 사람은
 * 세션에 토큰이 없어서, 그대로 두면 "로그인이 필요합니다"가 계속 뜬다.
 * 그래서 세션에 없으면 서버(/api/mypage/chat-token)에서 한 번 받아온다.
 *
 * 반환값
 *   token  — 쓸 수 있는 토큰(없으면 null)
 *   ready  — 받아오기를 끝냈는지. false 동안에는 "로그인하세요"로 보내면 안 된다.
 */
export function useApiToken() {
  const { data: session, status } = useSession();
  const sessionToken = (session?.user as { apiToken?: string } | undefined)?.apiToken ?? null;
  const [token, setToken] = useState<string | null>(sessionToken);
  const [ready, setReady] = useState(!!sessionToken);

  useEffect(() => {
    if (sessionToken) {
      setToken(sessionToken);
      setReady(true);
      return;
    }
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setToken(null);
      setReady(true);
      return;
    }
    let cancelled = false;
    fetch('/api/mypage/chat-token')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setToken(d?.token ?? null); })
      .catch(() => { if (!cancelled) setToken(null); })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [sessionToken, status]);

  return { token, ready, status };
}
