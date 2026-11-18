/**
 * SNS 로그인 버튼에 쓰는 브랜드 마크.
 *
 * 아이콘 꾸러미를 둘 때문에 더 받을 이유가 없어서 경로만 떼어 와 직접 그린다.
 * 비즈(biz.carvior.store) 로그인과 같은 파일을 쓴다 — 두 화면이 같은 회사로 보여야 한다.
 */

interface MarkProps {
  className?: string;
}

export function KakaoMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3Z" />
    </svg>
  );
}

export function NaverMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" />
    </svg>
  );
}

/* ── 유저 구분 탭에 쓰는 작은 표시 ──
   이 사이트에는 아이콘 꾸러미가 없다. 셋 때문에 하나를 더 받을 이유가 없어서 직접 그린다. */

export function UserIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function StoreIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 9 4.5 4h15L21 9" />
      <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

export function BuildingIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 22V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v18" />
      <path d="M15 9h3a1 1 0 0 1 1 1v12" />
      <path d="M3 22h18" />
      <path d="M9.5 7h2M9.5 11h2M9.5 15h2" />
    </svg>
  );
}
