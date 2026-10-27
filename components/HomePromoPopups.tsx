'use client';

import DealerPartnershipPopup from './DealerPartnershipPopup';
// 홈에 띄우던 팝업을 걷어내는 중이다.
// - 법인전환 안내: 홈 하단 공지사항에서 눌러 보게 함
// - 검차 프로모션: 내림(히어로와 검차 안내 띠에 같은 내용이 이미 있다)
// 컴포넌트는 지우지 않고 남겨둔다 — 다시 띄울 일이 생기면 여기에 한 줄 넣으면 된다.

export default function HomePromoPopups() {
  return (
    <div className="hidden sm:flex fixed top-20 left-6 z-[200] items-stretch gap-4">
      <DealerPartnershipPopup />
    </div>
  );
}
