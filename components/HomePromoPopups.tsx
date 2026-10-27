'use client';

import InspectionPromoPopup from './InspectionPromoPopup';
import DealerPartnershipPopup from './DealerPartnershipPopup';
import CorporateNoticePopup from './CorporateNoticePopup';

export default function HomePromoPopups() {
  return (
    <div className="hidden sm:flex fixed top-20 left-6 z-[200] items-stretch gap-4">
      {/* 법인전환 안내는 알려야 하는 내용이라 프로모션보다 앞에 둔다 */}
      <CorporateNoticePopup />
      <InspectionPromoPopup />
      <DealerPartnershipPopup />
    </div>
  );
}
