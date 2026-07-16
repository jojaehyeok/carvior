import type { Session } from 'next-auth';

// 항상 통과시키는 계정 (운영자 본인 테스트/관리용)
const SUPER_ACCOUNTS = ['jjhst2285@naver.com'];

export function isApprovedDealer(session: Session | null): boolean {
  const u = session?.user as any;
  if (!u) return false;
  if (u.email && SUPER_ACCOUNTS.includes(u.email)) return true;
  return u.role === 'dealer' && u.dealerStatus === 'approved';
}
