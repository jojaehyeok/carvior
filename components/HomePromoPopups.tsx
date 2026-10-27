'use client';

import InspectionPromoPopup from './InspectionPromoPopup';
import DealerPartnershipPopup from './DealerPartnershipPopup';
// 법인전환 안내는 팝업으로 띄우지 않는다 — 홈 하단 공지사항에서 눌러서 보게 한다.
// (CorporateNoticePopup 컴포넌트는 지우지 않고 남겨둠. 다시 띄울 일이 생기면 여기에 넣으면 된다)

export default function HomePromoPopups() {
  return (
    <div className="hidden sm:flex fixed top-20 left-6 z-[200] items-stretch gap-4">
      <InspectionPromoPopup />
      <DealerPartnershipPopup />
    </div>
  );
}
