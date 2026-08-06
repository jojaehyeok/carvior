'use client';

import InspectionPromoPopup from './InspectionPromoPopup';
import DealerPartnershipPopup from './DealerPartnershipPopup';

export default function HomePromoPopups() {
  return (
    <div className="hidden sm:flex fixed top-20 left-6 z-[200] items-stretch gap-4">
      <InspectionPromoPopup />
      <DealerPartnershipPopup />
    </div>
  );
}
