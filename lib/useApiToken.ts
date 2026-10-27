'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * 채팅·신고에 쓰는 백엔드 토큰을 가져온다.
 *
 * 토큰은 로그인하는 순간에만 세션에 실린다. 채팅이 생기기 전부터 로그인해 있던 사람은
 * 세션에 토큰이 없어서, 그대로 두면 "로그인이 필요합니다"가 계속 뜬다.
 * 그래서 세션에 없으면 서버(/api/mypage/chat-token)에서 한 번 받아온다.
 *
 * 반환값
 *   token  — 쓸 수 있는 토큰(없으면 null)
 *   ready  — 받아오기를 끝냈는지. false 동안에는 "로그인하세요"로 보내면 안 된다.
 *   error  — 로그인은 되어 있는데 토큰을 못 받은 경우의 사유.
 *            ⚠ 이때 로그인 화면으로 보내면 안 된다. 이미 로그인한 사람이라 다시 로그인해도
 *            같은 자리로 돌아오고, 유저 입장에선 "계속 로그인하라고 한다"가 된다.
 */
export function useApiToken() {
  const { data: session, status } = useSession();
  const sessionToken = (session?.user as { apiToken?: string } | undefined)?.apiToken ?? null;
  const [token, setToken] = useState<string | null>(sessionToken);
  const [ready, setReady] = useState(!!sessionToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionToken) {
      setToken(sessionToken);
      setError(null);
      setReady(true);
      return;
    }
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setToken(null);
      setError(null);
      setReady(true);
      return;
    }
    let cancelled = false;
    fetch('/api/mypage/chat-token')
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (cancelled) return;
        if (r.ok && data?.token) {
          setToken(data.token);
          setError(null);
        } else {
          setToken(null);
          setError(data?.reason ?? `http-${r.status}`);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setError('fetch-failed');
        }
      })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [sessionToken, status]);

  return { token, ready, status, error };
}

// 로그인은 되어 있는데 토큰이 없을 때 사람이 읽을 안내. 사유는 관리자가 찾아보기 쉽게 붙여둔다.
export const tokenErrorMessage = (reason: string | null) =>
  `로그인은 되어 있는데 채팅 권한을 받지 못했습니다. 잠시 후 다시 시도해주세요.\n` +
  `계속 안 되면 고객센터에 알려주세요. (사유: ${reason ?? 'unknown'})`;
