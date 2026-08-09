'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SaleStageTimeline from '@/components/SaleStageTimeline';

type Status = 'pending' | 'active' | 'sold' | 'hidden';

interface StoreItem {
  id: number;
  titleKo: string;
  carNumber: string;
  year: number;
  mileage: number;
  priceKRW: number;
  status: Status;
  photos: Record<string, string[]>;
  registeredAt: string;
  carHash?: string;
  hasReport?: boolean;
  saleStage?: string;
  ownerAccessToken?: string;
  auctionEndAt?: string;
  transferredRegistrationUrl?: string;
  selfRegistered?: boolean;
  category?: string;
  depositConfirmed?: boolean;
  transportPreferredDateTime?: string | null;
  transportRequestedAt?: string | null;
}

// 낙찰 이후 세부단계(winner_selected/in_transit/transit_done/completed)를
// 사용자 친화적인 4단계 라벨로 매핑 — DB의 saleStage 값 자체는 안 바꾸고 필터 UI에서만 재해석
const STAGE_FILTER_MAP: { key: string; label: string; stage: string }[] = [
  { key: 'need_payment', label: '입력필요',   stage: 'winner_selected' },
  { key: 'paid',         label: '입력완료',   stage: 'in_transit' },
  { key: 'transit',      label: '탁송예정',   stage: 'transit_done' },
  { key: 'done',         label: '거래완료',   stage: 'completed' },
];

const DOMESTIC_BRANDS = ['현대', '기아', '쉐보레', '제네시스', '르노코리아', '르노삼성', 'KG모빌리티', '쌍용', '대우'];

function getBrand(titleKo: string): string {
  return (titleKo || '').split(' ')[0]?.replace(/\(.*\)/, '').trim() || '기타';
}

function isDomestic(titleKo: string): boolean {
  const brand = getBrand(titleKo);
  return DOMESTIC_BRANDS.some(b => brand.includes(b) || b.includes(brand));
}

const STATUS_MAP: Record<Status, { label: string; color: string }> = {
  pending: { label: '검토중',   color: 'bg-yellow-100 text-yellow-700' },
  active:  { label: '판매중',   color: 'bg-green-100 text-green-700'  },
  sold:    { label: '판매완료', color: 'bg-gray-100 text-gray-500'    },
  hidden:  { label: '숨김',     color: 'bg-red-100 text-red-500'      },
};

interface BookingForm {
  address: string;
  detailAddress: string;
  contact: string;
  preferredDateTime: string;
}

interface InspectionBooking {
  id: number;
  carNumber: string;
  carModel?: string;
  address: string;
  preferredDateTime: string;
  status: string;
  amount?: number;
  paymentMethod?: string;
  createdAt: string;
  buyerPurchaseCompleted?: boolean;
  buyerHidden?: boolean;
  refundPreview?: { tier: 'FULL' | 'FEE' | 'NONE'; refundAmount: number; cancelFee: number };
  thumbnailUrl?: string;
  carHash?: string;
}

const BOOKING_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: '배정 대기중', color: 'bg-yellow-100 text-yellow-700' },
  ASSIGNED:  { label: '평가사 배정됨', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: '진단 완료', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: '취소됨', color: 'bg-gray-100 text-gray-500' },
};

export default function MypagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ item: StoreItem; type: 'inspection' } | null>(null);
  const [form, setForm] = useState<BookingForm>({ address: '', detailAddress: '', contact: '', preferredDateTime: '' });
  const [submitting, setSubmitting] = useState(false);
  const [soldRating, setSoldRating] = useState<Record<number, number>>(() => {
    try { return JSON.parse(localStorage.getItem('soldRating') ?? '{}'); } catch { return {}; }
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusTab, setStatusTab] = useState<'all' | Status | 'buying' | 'bought'>('all');
  const [serviceFilter, setServiceFilter] = useState<Set<'inspection' | 'self'>>(new Set<'inspection' | 'self'>(['inspection', 'self']));
  const [stageFilter, setStageFilter] = useState<Set<string>>(new Set(STAGE_FILTER_MAP.map(s => s.key)));
  const [originFilter, setOriginFilter] = useState<'all' | 'domestic' | 'import'>('all');
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [bookings, setBookings] = useState<InspectionBooking[]>([]);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [togglingBuyerId, setTogglingBuyerId] = useState<number | null>(null);
  const [transportDateTime, setTransportDateTime] = useState<Record<number, string>>({});
  const [requestingTransportId, setRequestingTransportId] = useState<number | null>(null);
  const [partnerAppStatus, setPartnerAppStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [listingModal, setListingModal] = useState<InspectionBooking | null>(null);
  const [listingForm, setListingForm] = useState({ price: '', contact: '' });
  const [listingSubmitting, setListingSubmitting] = useState(false);

  const user = session?.user as any;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // bookings(검차 예약) 테이블엔 userId 컬럼이 없어서(비회원도 신청 가능한 예전 테이블),
  // 로그인 회원과 연결할 방법이 가입 시 등록한 휴대폰번호뿐이라 그걸로 조회함.
  // /api/v1/*는 항상 백엔드로 보장 라우팅되는 경로라(Apache 화이트리스트 이슈 없음) 프론트에서 직접 호출.
  useEffect(() => {
    if (status !== 'authenticated' || !user?.email) return;
    const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
    (async () => {
      try {
        const uRes = await fetch(`${API}/users/by-email?email=${encodeURIComponent(user.email)}`);
        if (!uRes.ok) return;
        const u = await uRes.json();
        if (!u?.phone) return;

        const bRes = await fetch(`${API}/external/request/lookup-by-name?contact=${encodeURIComponent(u.phone)}`);
        const bData = bRes.ok ? await bRes.json() : [];
        setBookings(Array.isArray(bData) ? bData : []);

        const pRes = await fetch(`${API}/external/partner-applications/by-phone?phone=${encodeURIComponent(u.phone)}`);
        if (pRes.ok) {
          const app = await pRes.json();
          setPartnerAppStatus(app?.status ?? null);
        }
      } catch {
        setBookings([]);
      }
    })();
  }, [status, user?.email]);

  const cancelBooking = async (booking: InspectionBooking) => {
    if (!window.confirm('정말 취소하시겠어요? 취소 후에는 되돌릴 수 없어요.')) return;
    setCancellingBookingId(booking.id);
    try {
      const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const uRes = await fetch(`${API}/users/by-email?email=${encodeURIComponent(user.email)}`);
      const u = await uRes.json();
      if (!u?.phone) throw new Error();
      const res = await fetch(`${API}/external/request/${booking.id}/self-cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: u.phone }),
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'CANCELLED' } : b));
    } catch {
      alert('취소 처리 중 오류가 발생했습니다.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  // 검차 신청은 대부분 남의 차를 사려고 신청한 거라, 신청자 본인이 마이페이지에서
  // "구매완료" 여부를 셀프로 표시/해제(검증 수단 없는 자기신고, StoreItem 판매완료와 동일 패턴)
  const toggleBuyerPurchaseCompleted = async (booking: InspectionBooking) => {
    const next = !booking.buyerPurchaseCompleted;
    setTogglingBuyerId(booking.id);
    try {
      const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const uRes = await fetch(`${API}/users/by-email?email=${encodeURIComponent(user.email)}`);
      const u = await uRes.json();
      if (!u?.phone) throw new Error();
      const res = await fetch(`${API}/external/request/${booking.id}/buyer-purchase-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: u.phone, completed: next }),
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, buyerPurchaseCompleted: next } : b));
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setTogglingBuyerId(null);
    }
  };

  // 완전히 구매해서 본인 상사(딜러)에서 따로 팔 예정이라 카비어에 낼 의사가 없는 건 —
  // 마이페이지 목록에서 아예 숨김(되돌리기 UI 없는 단방향 동작).
  const hideBooking = async (booking: InspectionBooking) => {
    if (!window.confirm('이 차량을 목록에서 숨길까요? 다시 표시할 수 없어요.')) return;
    setTogglingBuyerId(booking.id);
    try {
      const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const uRes = await fetch(`${API}/users/by-email?email=${encodeURIComponent(user.email)}`);
      const u = await uRes.json();
      if (!u?.phone) throw new Error();
      const res = await fetch(`${API}/external/request/${booking.id}/buyer-hidden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: u.phone, hidden: true }),
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.filter(b => b.id !== booking.id));
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setTogglingBuyerId(null);
    }
  };

  // 이미 카비어 검차리포트가 있는 차량이라 판매가만 받아서 바로 차량판매중개 시스템
  // (Vehicle → SaleListing)으로 즉시 출품 — 차종/주행거리/사진은 검차리포트를 그대로 참조
  // (복사 안 함). 기존 스마트옥션(StoreItem)으로 출품하던 걸 이 시스템으로 대체(2026-08-09 결정,
  // 스마트옥션 쪽 실사용 데이터가 없어서 안전하게 전환).
  const openListingModal = async (booking: InspectionBooking) => {
    setListingModal(booking);
    setListingForm({ price: '', contact: '' });
    try {
      const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const uRes = await fetch(`${API}/users/by-email?email=${encodeURIComponent(user.email)}`);
      const u = await uRes.json();
      if (u?.phone) setListingForm(f => ({ ...f, contact: u.phone }));
    } catch {}
  };

  const submitListing = async () => {
    if (!listingModal) return;
    const price = Number(listingForm.price);
    if (!price || price <= 0) { alert('판매가를 입력해주세요.'); return; }
    if (!listingForm.contact.trim()) { alert('연락처를 입력해주세요.'); return; }

    setListingSubmitting(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const res = await fetch(`${API}/external/sale-listings/self-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '' },
        body: JSON.stringify({
          carNumber: listingModal.carNumber,
          ownerName: user?.name ?? listingModal.carModel ?? '',
          ownerContact: listingForm.contact,
          askingPrice: price * 10000,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message ?? '출품 중 오류가 발생했습니다.');
        return;
      }
      // 출품 완료된 건은 더 이상 "내 검차 신청" 목록에 남겨둘 필요가 없어서 숨김 처리(기존 숨기기 기능 재사용)
      const uRes = await fetch(`${API}/users/by-email?email=${encodeURIComponent(user.email)}`);
      const u = await uRes.json();
      if (u?.phone) {
        await fetch(`${API}/external/request/${listingModal.id}/buyer-hidden`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: u.phone, hidden: true }),
        }).catch(() => {});
      }
      setBookings(prev => prev.filter(b => b.id !== listingModal.id));
      setListingModal(null);
      alert('스마트옥션에 바로 출품됐어요! 딜러 입찰이 시작되면 거래관리에서 진행상황을 확인할 수 있어요.');
    } catch {
      alert('출품 중 오류가 발생했습니다.');
    } finally {
      setListingSubmitting(false);
    }
  };

  const refreshItems = () => {
    fetch('/api/mypage/store-items')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    refreshItems();
  }, [status]);

  const markSold = async (item: StoreItem) => {
    // 판매완료 누르면 진행상황(saleStage)도 같이 낙찰 단계로 넘겨서 타임라인이 멈춰있지 않게 함.
    // 이 버튼은 status==='active'일 때만 보이는데, 실제 경매로 낙찰된 매물은 이미 selectWinner()에서
    // status를 'sold'로 바꿔버려서 이 버튼 자체가 안 뜨니 — 진행 중인 진짜 경매를 덮어쓸 위험은 없음.
    const res = await fetch(`/api/mypage/store-items?id=${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sold', saleStage: 'winner_selected' }),
    });
    if (res.ok) setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'sold', saleStage: 'winner_selected' } : i));
  };

  // 차대금 입금확인(depositConfirmed) 이후 차주가 탁송 희망 일시를 신청 — ownerAccessToken으로
  // 본인 인증(로그인 계정과 별개로 매물마다 발급된 토큰, /my-listing 페이지와 동일한 방식)
  const requestTransport = async (item: StoreItem) => {
    const dt = transportDateTime[item.id];
    if (!dt) { alert('탁송 희망 일시를 입력해주세요.'); return; }
    if (!item.ownerAccessToken) return;
    setRequestingTransportId(item.id);
    try {
      const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const res = await fetch(`${API}/external/my-listing/${item.ownerAccessToken}/request-transport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredDateTime: dt }),
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.map(i => i.id === item.id
        ? { ...i, transportPreferredDateTime: dt, transportRequestedAt: new Date().toISOString() }
        : i));
    } catch {
      alert('탁송 신청 중 오류가 발생했습니다.');
    } finally {
      setRequestingTransportId(null);
    }
  };

  const submitRating = (item: StoreItem, stars: number) => {
    setSoldRating(prev => {
      const next = { ...prev, [item.id]: stars };
      try { localStorage.setItem('soldRating', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('https://carvior.store/api/v1/admin/notify/seller-rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carNumber: item.carNumber, title: item.titleKo, stars }),
    }).catch(() => {});
  };

  const submitBooking = async () => {
    if (!modal) return;
    setSubmitting(true);
    try {
      await fetch('/api/v1/external/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carNumber: modal.item.carNumber,
          carOwner: user?.name,
          contact: form.contact,
          address: form.address,
          detailAddress: form.detailAddress,
          preferredDateTime: form.preferredDateTime,
          source: 'INSPECTION',
        }),
      });
      setModal(null);
      alert('신청이 완료되었습니다. 담당자가 연락드릴 예정입니다.');
    } catch {
      alert('신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 새 탭 대신 화면 왼쪽 1/3 크기의 작은 팝업창으로 입찰현황 페이지를 띄움
  const openMyListingPopup = (token: string) => {
    const w = Math.round(window.screen.availWidth / 3);
    const h = window.screen.availHeight;
    window.open(
      `/my-listing/${token}`,
      'my-listing',
      `width=${w},height=${h},left=0,top=0,scrollbars=yes,resizable=yes`
    );
  };

  // 검차 신청 카드 — /auction/market 스타일(사진+정보 상세)로 검차리포트를 보여줌
  const openCarReportPopup = (hash: string) => {
    const w = Math.round(window.screen.availWidth / 3);
    const h = window.screen.availHeight;
    window.open(
      `/car-report/${hash}`,
      'car-report',
      `width=${w},height=${h},left=0,top=0,scrollbars=yes,resizable=yes`
    );
  };

  const thumb = (item: StoreItem) => {
    return (item.photos as any)?.exterior?.[0]
      ?? Object.values(item.photos ?? {}).flat()[0]
      ?? null;
  };

  const toggleInSet = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value); else next.add(value);
    setter(next);
  };

  // 필터 카운트 (전체 items 기준 — 다른 필터와 무관하게 각 옵션의 총 개수를 보여줌)
  // "진단"은 검차 신청(대부분 남의 차를 사려고 신청한 것) + 진단 기반으로 등록된 매물을 합친 것
  const serviceCounts = {
    inspection: bookings.length + items.filter(i => !i.selfRegistered).length,
    self: items.filter(i => i.selfRegistered).length,
  };
  const stageCounts = Object.fromEntries(
    STAGE_FILTER_MAP.map(s => [s.key, items.filter(i => (i.saleStage ?? 'bidding') === s.stage).length])
  );
  const domesticCount = items.filter(i => isDomestic(i.titleKo)).length;
  const importCount = items.length - domesticCount;
  const brandCounts = items.reduce<Record<string, number>>((acc, i) => {
    const b = getBrand(i.titleKo);
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {});

  const filteredItems = items.filter(item => {
    // 구매중/구매완료 탭은 검차 신청(bookings) 전용 — 매물(items)은 그 탭에서 안 보임
    if (statusTab === 'buying' || statusTab === 'bought') return false;
    if (statusTab !== 'all' && item.status !== statusTab) return false;

    const svc = item.selfRegistered ? 'self' : 'inspection';
    if (!serviceFilter.has(svc)) return false;

    // 낙찰 이후 단계인 매물만 진행상태 필터 대상 — 검토중/판매중(입찰중) 매물은 필터와 무관하게 항상 표시
    if (item.status === 'sold' || (item.saleStage && item.saleStage !== 'bidding')) {
      const stageEntry = STAGE_FILTER_MAP.find(s => s.stage === (item.saleStage ?? 'winner_selected'));
      if (stageEntry && !stageFilter.has(stageEntry.key)) return false;
    }

    if (originFilter !== 'all') {
      const domestic = isDomestic(item.titleKo);
      if (originFilter === 'domestic' && !domestic) return false;
      if (originFilter === 'import' && domestic) return false;
    }

    if (brandFilter.size > 0 && !brandFilter.has(getBrand(item.titleKo))) return false;

    return true;
  });

  // 검차 신청(대부분 남의 차를 사려고 신청한 것) — 판매쪽 탭/브랜드·진행상태 필터는
  // 이 도메인과 안 맞아서 서비스 필터(진단)와 구매중/구매완료 탭만 적용함.
  const filteredBookings = bookings.filter(b => {
    if (!serviceFilter.has('inspection')) return false;
    if (statusTab === 'buying') return !!b.buyerPurchaseCompleted === false;
    if (statusTab === 'bought') return !!b.buyerPurchaseCompleted === true;
    if (statusTab !== 'all') return false; // 판매 관련 탭에서는 검차신청 카드 숨김
    return true;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 타이틀 — 프로필/로그아웃은 상단 네비 프로필 드롭다운에 이미 있어서 여기선 중복 노출 안 함 */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl font-black text-gray-900">내 차량 관리하기</h1>
      </div>

      {/* 제휴 검차 서비스 유도 배너 — 딜러 전용(매입 전 검차 수요가 잦은 건 딜러라서) */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {user?.role === 'dealer' && (
          <Link
            href="/inspection?promo=member"
            className="flex items-center justify-between gap-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-5 py-4 hover:from-violet-500 hover:to-indigo-500 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">🤝</span>
              <div className="min-w-0">
                <p className="text-white font-black text-sm">제휴 검차 서비스, 딜러 전용가로 받아보세요</p>
                <p className="text-violet-200 text-xs mt-0.5">국산 88,000원 · 수입 121,000원 (VAT 포함)</p>
              </div>
            </div>
            <span className="text-white text-xs font-bold shrink-0">신청하기 →</span>
          </Link>
        )}

        {/* 파트너패널 — 보조 기능이라 큰 배너 대신 작은 버튼으로 */}
        <div className="flex gap-2 mt-3">
          {partnerAppStatus === 'approved' ? (
            <a
              href="https://carvior.store/admin/login"
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 hover:bg-emerald-100 transition-colors"
            >
              🔑 파트너패널 바로가기
            </a>
          ) : partnerAppStatus === 'pending' ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              🔑 파트너패널 신청완료
            </div>
          ) : (
            <Link
              href="/marketing/partner-panel"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              🔑 파트너패널
            </Link>
          )}
        </div>
      </div>

      {/* 내 매물 */}
      <div id="my-vehicles" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gray-900">내 매물</h2>
          <button
            onClick={() => router.push('/sell/register')}
            className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
          >
            + 차량 등록
          </button>
        </div>

        {(items.length > 0 || bookings.length > 0) && (
          <div className="flex gap-2 mb-5 overflow-x-auto">
            {[
              { key: 'all' as const, label: '전체', count: items.length + bookings.length },
              { key: 'active' as const, label: '판매중', count: items.filter(i => i.status === 'active').length },
              { key: 'pending' as const, label: '판매대기', count: items.filter(i => i.status === 'pending').length },
              { key: 'sold' as const, label: '판매완료', count: items.filter(i => i.status === 'sold').length },
              { key: 'buying' as const, label: '구매중', count: bookings.filter(b => !b.buyerPurchaseCompleted).length },
              { key: 'bought' as const, label: '구매완료', count: bookings.filter(b => b.buyerPurchaseCompleted).length },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setStatusTab(t.key)}
                className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors ${statusTab === t.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
              >
                {t.label} {t.count}
              </button>
            ))}
          </div>
        )}

        {items.length === 0 && bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-4xl mb-3">🚗</div>
            <p className="text-gray-400 text-sm font-semibold">등록된 매물이 없습니다</p>
            <button
              onClick={() => router.push('/sell/register')}
              className="mt-4 text-xs font-bold text-violet-600 underline"
            >
              지금 등록하기
            </button>
          </div>
        ) : (
          <div className="flex gap-6 items-start">
            {/* 좌측 필터 */}
            <aside className="w-52 shrink-0 hidden md:block space-y-6 sticky top-6">
              <div>
                <p className="text-xs font-black text-gray-900 mb-2.5">카비어 서비스</p>
                <div className="space-y-1.5">
                  {[{ key: 'inspection' as const, label: '진단' }, { key: 'self' as const, label: '셀프' }].map(o => (
                    <label key={o.key} className="flex items-center justify-between gap-2 cursor-pointer select-none text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={serviceFilter.has(o.key)}
                          onChange={() => toggleInSet(serviceFilter, o.key, setServiceFilter)}
                          className="accent-violet-600"
                        />
                        <span className="text-gray-700">{o.label}</span>
                      </span>
                      <span className="text-gray-300 text-xs">{serviceCounts[o.key]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-black text-gray-900 mb-2.5">진행상태</p>
                <div className="space-y-1.5">
                  {STAGE_FILTER_MAP.map(o => (
                    <label key={o.key} className="flex items-center justify-between gap-2 cursor-pointer select-none text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={stageFilter.has(o.key)}
                          onChange={() => toggleInSet(stageFilter, o.key, setStageFilter)}
                          className="accent-violet-600"
                        />
                        <span className="text-gray-700">{o.label}</span>
                      </span>
                      <span className="text-gray-300 text-xs">{stageCounts[o.key] ?? 0}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-black text-gray-900 mb-2.5">제조사 · 모델</p>
                <div className="flex gap-1.5 mb-3">
                  {[
                    { key: 'all' as const, label: '전체' },
                    { key: 'domestic' as const, label: '국산' },
                    { key: 'import' as const, label: '수입' },
                  ].map(o => (
                    <button
                      key={o.key}
                      onClick={() => setOriginFilter(o.key)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${originFilter === o.key ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {Object.entries(brandCounts)
                    .filter(([brand]) => originFilter === 'all' || isDomestic(brand) === (originFilter === 'domestic'))
                    .sort((a, b) => b[1] - a[1])
                    .map(([brand, count]) => (
                      <label key={brand} className="flex items-center justify-between gap-2 cursor-pointer select-none text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={brandFilter.has(brand)}
                            onChange={() => toggleInSet(brandFilter, brand, setBrandFilter)}
                            className="accent-violet-600 shrink-0"
                          />
                          <span className="text-gray-700 truncate">{brand}</span>
                        </span>
                        <span className="text-gray-300 text-xs shrink-0">{count}</span>
                      </label>
                    ))}
                </div>
              </div>
            </aside>

            {/* 우측 그리드 */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0 items-start">
              {filteredItems.length === 0 && filteredBookings.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">
                  선택한 조건에 맞는 항목이 없습니다
                </div>
              )}
              {filteredItems.map(item => {
                const s = STATUS_MAP[item.status] ?? STATUS_MAP.hidden;
                const img = thumb(item);
                return (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col min-h-[392px]">
                    {/* 썸네일 — 누르면 입찰 내역 상세보기로 이동 */}
                    <button
                      type="button"
                      onClick={() => item.ownerAccessToken && openMyListingPopup(item.ownerAccessToken)}
                      disabled={!item.ownerAccessToken}
                      className="aspect-[4/3] bg-gray-100 relative block w-full text-left disabled:cursor-default"
                    >
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🚗</div>
                      )}
                      <span className={`absolute top-2 right-2 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${s.color}`}>{s.label}</span>
                    </button>

                    {/* 정보 */}
                    <div className="flex-1 px-4 py-3 min-w-0 flex flex-col gap-2">
                      <div className="min-w-0 min-h-[74px]">
                        <p className="font-bold text-sm text-gray-900 line-clamp-1 leading-snug">{item.titleKo}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                          {item.carNumber} · {item.year}년 · {item.mileage?.toLocaleString()}km
                        </p>
                        <p className="text-base font-black text-violet-600 mt-1 leading-none">
                          {item.priceKRW ? `${Math.round(Number(item.priceKRW) / 10000).toLocaleString()}만원` : '가격 미정'}
                        </p>
                      </div>

                      {/* 버튼 + 상태 메시지 */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {(item.status === 'pending' || item.status === 'active' || item.status === 'sold') && !item.hasReport && (
                            <a
                              href="/inspection"
                              className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-amber-400 text-amber-900 hover:bg-amber-300 transition-colors"
                            >
                              ✦ 검차 신청
                            </a>
                          )}
                          {item.status === 'active' && (
                            <button
                              onClick={() => markSold(item)}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                              판매완료
                            </button>
                          )}
                          {item.status === 'sold' && item.saleStage === 'completed' && (
                            <div className="w-full space-y-2 mt-1">
                              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                                <p className="text-xs font-black text-green-800">🎉 거래완료!</p>
                                <p className="text-[10px] text-green-600 mt-0.5">카비어를 이용해주셔서 감사합니다</p>
                              </div>
                              {!soldRating[item.id] ? (
                                <div>
                                  <p className="text-[10px] text-gray-400 mb-1">이용 경험을 평가해주세요</p>
                                  <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => (
                                      <button key={s} onClick={() => submitRating(item, s)}
                                        className="text-xl text-gray-200 hover:text-amber-400 transition-colors leading-none">★</button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[11px] text-amber-500 font-bold">
                                  {'★'.repeat(soldRating[item.id])}{'☆'.repeat(5 - soldRating[item.id])} 감사합니다!
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {item.status === 'pending' && (
                          <p className="text-[10px] text-yellow-600 leading-relaxed">
                            관리자 검토 후 활성화됩니다<br />
                            <span className="text-zinc-400">검차 완료 시 즉시 게시됩니다</span>
                          </p>
                        )}

                        {(item.status === 'active' || item.status === 'pending') && (
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                            <span className="text-amber-500 text-[10px]">💡</span>
                            <p className="text-[10px] text-amber-700 font-semibold">
                              검차받은 매물은 평균 <strong>3배 빠르게</strong> 판매됩니다
                            </p>
                          </div>
                        )}

                        {(item.status === 'active' || item.status === 'sold') && (
                          <button
                            onClick={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                            className="text-[11px] font-bold text-gray-400 hover:text-violet-600 transition-colors"
                          >
                            {expandedId === item.id ? '진행상황 접기 ▲' : '진행상황 보기 ▼'}
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedId === item.id && (item.status === 'active' || item.status === 'sold') && (
                      <div className="border-t border-gray-100 px-4 py-5 bg-gray-50/50">
                        <SaleStageTimeline
                          status={item.status}
                          saleStage={item.saleStage}
                          auctionEndAt={item.auctionEndAt}
                          transferredRegistrationUrl={item.transferredRegistrationUrl}
                        />

                        {(item.depositConfirmed || item.status === 'sold') && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            {item.transportRequestedAt ? (
                              <p className="text-xs font-bold text-violet-600">
                                🚚 탁송 신청 완료 · 희망일시: {new Date(item.transportPreferredDateTime!).toLocaleString('ko-KR', {
                                  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-700">차대금 입금이 확인됐어요. 탁송 희망 일시를 알려주세요.</p>
                                <input
                                  type="datetime-local"
                                  value={transportDateTime[item.id] ?? ''}
                                  onChange={e => setTransportDateTime(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                                />
                                <button
                                  onClick={() => requestTransport(item)}
                                  disabled={requestingTransportId === item.id}
                                  className="w-full py-2 text-xs font-bold rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
                                >
                                  {requestingTransportId === item.id ? '신청 중...' : '🚚 탁송 신청하기'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-center gap-4 mt-4">
                          {(item.status === 'active' || item.status === 'sold') && item.ownerAccessToken && (
                            <button
                              onClick={() => openMyListingPopup(item.ownerAccessToken!)}
                              className="text-xs font-bold text-violet-600 underline hover:text-violet-700"
                            >
                              입찰 내역 상세보기 →
                            </button>
                          )}
                          {item.carHash && (
                            <button
                              onClick={() => openCarReportPopup(item.carHash!)}
                              className="text-xs font-bold text-gray-500 underline hover:text-gray-700"
                            >
                              검차 리포트 보기 →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredBookings.map(booking => {
                const bs = BOOKING_STATUS_MAP[booking.status] ?? BOOKING_STATUS_MAP.PENDING;
                const cancellable = booking.status === 'PENDING' || booking.status === 'ASSIGNED';
                // 진단완료 후 구매완료 표시 없이 2주가 지나면 목록에서 자동 제외되므로,
                // 며칠 안 남았을 때 미리 구매완료 표시를 유도
                const daysLeft = booking.status === 'COMPLETED' && !booking.buyerPurchaseCompleted
                  ? 14 - Math.floor((Date.now() - new Date(booking.createdAt).getTime()) / (24 * 60 * 60 * 1000))
                  : null;
                return (
                  <div key={`booking-${booking.id}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col min-h-[392px]">
                    {/* 썸네일 — 진단완료 건은 검차사진 첫 장, 아니면 카비어 로고. 누르면 상세 리포트 팝업 */}
                    <button
                      type="button"
                      onClick={() => booking.carHash && openCarReportPopup(booking.carHash)}
                      disabled={!booking.carHash}
                      className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center w-full text-left disabled:cursor-default"
                    >
                      {booking.thumbnailUrl ? (
                        <img src={booking.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <img src="/logo-icon.svg" alt="" className="w-16 h-16 opacity-20" />
                      )}
                      <span className={`absolute top-2 right-2 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${bs.color}`}>{bs.label}</span>
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${booking.buyerPurchaseCompleted ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                        {booking.buyerPurchaseCompleted ? '구매완료' : '구매중'}
                      </span>
                    </button>

                    <div className="flex-1 px-4 py-3 min-w-0 flex flex-col gap-2">
                      <div className="min-w-0 min-h-[74px]">
                        <p className="font-bold text-sm text-gray-900 line-clamp-1 leading-snug">{booking.carModel || '검차 신청 차량'}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                          {booking.carNumber} · {booking.address}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                          희망일시: {new Date(booking.preferredDateTime).toLocaleString('ko-KR', {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        {typeof booking.amount === 'number' && (
                          <p className="text-base font-black text-violet-600 mt-1 leading-none">
                            {booking.amount.toLocaleString()}원
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        {daysLeft !== null && daysLeft <= 5 && (
                          <p className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                            ⏳ {daysLeft > 0 ? `${daysLeft}일 후` : '곧'} 목록에서 자동으로 제외돼요. 구매하셨다면 지금 표시해주세요.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {/* 구매완료 표시는 진단이 실제로 끝난 건에만 의미가 있음(취소/대기중은 진단 자체를 못 봄) */}
                          {booking.status === 'COMPLETED' && (
                            <button
                              onClick={() => toggleBuyerPurchaseCompleted(booking)}
                              disabled={togglingBuyerId === booking.id}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                              {togglingBuyerId === booking.id
                                ? '처리 중...'
                                : booking.buyerPurchaseCompleted ? '구매중으로 되돌리기' : '구매완료로 표시'}
                            </button>
                          )}
                          {booking.status === 'COMPLETED' && booking.buyerPurchaseCompleted && (
                            <button
                              onClick={() => hideBooking(booking)}
                              disabled={togglingBuyerId === booking.id}
                              title="본인 상사에서 따로 팔 예정이라 카비어에 낼 의사 없는 차량"
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                              숨기기
                            </button>
                          )}
                          {cancellable && (
                            <button
                              onClick={() => cancelBooking(booking)}
                              disabled={cancellingBookingId === booking.id}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                              {cancellingBookingId === booking.id ? '취소 중...' : '신청 취소'}
                            </button>
                          )}
                          {booking.status === 'CANCELLED' && (
                            <a
                              href="/inspection"
                              className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                            >
                              ✦ 날짜 바꿔서 재신청하기
                            </a>
                          )}
                        </div>

                        {booking.status === 'CANCELLED' && (
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            취소된 신청은 1주일 후 목록에서 자동으로 제외돼요.
                          </p>
                        )}

                        {booking.status === 'COMPLETED' && booking.buyerPurchaseCompleted && (
                          <button
                            onClick={() => openListingModal(booking)}
                            className="block w-full text-center text-[11px] font-black px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                          >
                            🚀 스마트옥션에 출품하기
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 검차 신청 모달 */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="font-black text-gray-900 text-lg">검차 신청</h3>
              <p className="text-xs text-gray-400 mt-1">{modal.item.titleKo} ({modal.item.carNumber})</p>
            </div>

            <div className="space-y-3">
              <input
                type="text" placeholder="주소"
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="text" placeholder="상세주소"
                value={form.detailAddress} onChange={e => setForm(f => ({ ...f, detailAddress: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="tel" placeholder="연락처"
                value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="datetime-local"
                value={form.preferredDateTime} onChange={e => setForm(f => ({ ...f, preferredDateTime: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
              >
                취소
              </button>
              <button
                onClick={submitBooking}
                disabled={submitting || !form.address || !form.contact || !form.preferredDateTime}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-violet-700 transition-colors"
              >
                {submitting ? '신청 중…' : '신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 차량판매중개 즉시 출품 모달 — 검차리포트가 이미 연결돼있어서 판매가·연락처만 받고
          Vehicle→SaleListing으로 바로 전환(관리자 승인 없이 즉시 딜러 입찰 가능) */}
      {listingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="font-black text-gray-900 text-lg">스마트옥션에 출품하기</h3>
              <p className="text-xs text-gray-400 mt-1">{listingModal.carModel} ({listingModal.carNumber}) · 검차사진 자동 반영</p>
            </div>

            <div className="space-y-3">
              <input
                type="number" placeholder="판매가 (만원)"
                value={listingForm.price} onChange={e => setListingForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="tel" placeholder="연락처"
                value={listingForm.contact} onChange={e => setListingForm(f => ({ ...f, contact: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setListingModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
              >
                취소
              </button>
              <button
                onClick={submitListing}
                disabled={listingSubmitting || !listingForm.price || !listingForm.contact}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-violet-700 transition-colors"
              >
                {listingSubmitting ? '출품 중…' : '바로 출품하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
