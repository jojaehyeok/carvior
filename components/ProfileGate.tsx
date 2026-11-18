'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { GATE_EXEMPT, SKIP_KEY } from '@/lib/profileGate';

/**
 * 빈 칸이 있는 분을 한 번 /welcome 으로 모신다.
 *
 * 소셜로 들어오면 번호가 없고, 카카오는 이메일도 없는 계정이 많다. 그대로 두면
 * 마이페이지에서 자기 검차 신청도 못 보고 우리도 연락할 방법이 없다.
 *
 * ⚠ 여기는 **모두가 지나는 길**이다. 잘못 걸리면 사이트 전체가 막힌다.
 * 그래서 조건을 좁게 잡는다 — 로그인했고, 서버가 needsProfile 을 참으로 내려줬고,
 * 묻지 않기로 한 길이 아니고, 이번 세션에 '나중에'를 누르지 않았을 때만.
 * 세션이 아직 로딩 중이면 아무것도 하지 않는다.
 */
export default function ProfileGate() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;

    const needs = (session?.user as { needsProfile?: boolean } | undefined)?.needsProfile;
    if (needs !== true) return;

    if (GATE_EXEMPT.some(p => pathname?.startsWith(p))) return;

    try {
      if (sessionStorage.getItem(SKIP_KEY) === '1') return;
    } catch {
      // 사생활 보호 모드 등에서 막히면 그냥 여쭌다 — 막아 세우는 쪽보다 낫다
    }

    router.replace('/welcome');
  }, [status, session, pathname, router]);

  return null;
}
