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
