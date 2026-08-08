'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CHANNEL_BUTTON_VISIBILITY_EVENT } from '@/components/ChannelTalk';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? 'live_gck_Gv6LjeKD8ajb9274j6mw3wYxAdXy';
const BANK_INFO   = { bank: '카카오뱅크', number: '3333-35-1997303', holder: '(주)카비어' };

// 네이버페이 — 가맹점 승인 전까지는 개발가이드 샘플 값으로 폴백(실결제 불가, 결제창 자체가 안 열림).
// 승인 완료 후 발급받는 진짜 Client ID/Chain ID를 .env에 넣으면 그대로 적용됨.
const NAVERPAY_CLIENT_ID = process.env.NEXT_PUBLIC_NAVERPAY_CLIENT_ID ?? 'HN3GGCMDdTgGUfl0kFCo';
const NAVERPAY_CHAIN_ID  = process.env.NEXT_PUBLIC_NAVERPAY_CHAIN_ID ?? 'bXJhWkw4dEhmRkw';
const NAVERPAY_MODE      = (process.env.NEXT_PUBLIC_NAVERPAY_MODE as 'development' | 'production') || 'development';

// 국산차/수입차 구매동행 프로모션 가격 (VAT 포함, 최종 결제 금액 기준)
type CarOrigin = 'DOMESTIC' | 'IMPORTED';
const CAR_TYPE_PRICING: Record<CarOrigin, { label: string; original: number; amount: number }> = {
  DOMESTIC: { label: '국산차', original: 139_000, amount: 99_000 },
  IMPORTED: { label: '수입차', original: 172_000, amount: 132_000 },
};

// 마이페이지 "제휴 검차 서비스" 배너(?promo=member)로 들어왔을 때 적용되는 회원 전용가
const MEMBER_PRICING: Record<CarOrigin, { label: string; original: number; amount: number }> = {
  DOMESTIC: { label: '국산차', original: 99_000, amount: 88_000 },
  IMPORTED: { label: '수입차', original: 132_000, amount: 110_000 },
};

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

type PayMethod = 'widget' | 'direct' | 'naverpay';

interface Form {
  carNumber:     string;
  ownerName:     string;
  phone:         string;
  email:         string;
  address:       string;
  addressDetail: string;
  dealerName:    string;
  dealerContact: string;
  listingUrl:    string;
}

function getAvailableDays() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

export default function InspectionCheckoutPage() {
  const [form, setForm] = useState<Form>({
    carNumber: '', ownerName: '', phone: '', email: '',
    address: '', addressDetail: '',
    dealerName: '', dealerContact: '', listingUrl: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [carOrigin, setCarOrigin]       = useState<CarOrigin>('DOMESTIC');
  const [isMemberPromo, setIsMemberPromo] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('promo') === 'member') setIsMemberPromo(true);
  }, []);
  const pricingTable = isMemberPromo ? MEMBER_PRICING : CAR_TYPE_PRICING;
  const pricing = pricingTable[carOrigin];
  const [payMethod, setPayMethod]       = useState<PayMethod>('widget');
  const [loading, setLoading]           = useState(false);
  const [widgetReady, setWidgetReady]   = useState(false);
  const [transferDone, setTransferDone] = useState(false);
  const widgetsRef = useRef<any>(null);
  const [naverPayReady, setNaverPayReady] = useState(false);
  const naverPayRef = useRef<any>(null);

  // 방문 주소+날짜 기준 "실제 그 시간대에 뛸 수 있는 평가사가 있는지" 조회 —
  // 헤이딜러처럼 미리 안 되는 시간을 걸러서, 아무도 배정 못 받는 시간에 결제부터
  // 받아버리는 사고를 막는다. 주소나 날짜가 아직 없으면 null(조회 전 상태).
  const [availableSlots, setAvailableSlots] = useState<Record<string, boolean> | null>(null);
  const [regionCovered, setRegionCovered]   = useState<boolean | null>(null);
  // 신청 지역에 실제로 활동 중인 평가사 — "활성 평가사님이 기다리고 있어요" 카드에 표시.
  // rating은 실제 리뷰 평균(리뷰 없으면 5점 기본), highlight는 축약된 실제 후기 한 줄.
  const [activeDrivers, setActiveDrivers] = useState<{ name: string; rating: number; reviewCount: number; highlight: string | null; photoUrl: string | null; completedCount: number }[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultDone, setConsultDone]       = useState(false);

  const days = getAvailableDays();

  useEffect(() => {
    setConsultDone(false);
    if (!form.address || !selectedDate) { setAvailableSlots(null); setRegionCovered(null); setActiveDrivers([]); return; }
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`https://carvior.store/api/v1/external/request/available-slots?address=${encodeURIComponent(form.address)}&date=${selectedDate}`)
      .then(res => res.json())
      .then((data: {
        regionCovered: boolean;
        slots: { time: string; available: boolean }[];
        activeDrivers?: { name: string; rating: number; reviewCount: number; highlight: string | null; photoUrl: string | null; completedCount: number }[];
      }) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        (Array.isArray(data?.slots) ? data.slots : []).forEach(s => { map[s.time] = s.available; });
        setAvailableSlots(map);
        setRegionCovered(data?.regionCovered ?? true);
        setActiveDrivers(Array.isArray(data?.activeDrivers) ? data.activeDrivers : []);
        // 이미 골라둔 시간이 새 조회 결과에서 불가능하면 선택 해제
        if (selectedTime && map[selectedTime] === false) setSelectedTime('');
      })
      .catch(() => { if (!cancelled) { setAvailableSlots(null); setRegionCovered(null); setActiveDrivers([]); } })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.address, selectedDate]);

  const consultationNeeded = !loadingSlots && !!selectedDate && (
    regionCovered === false ||
    (regionCovered === true && !!availableSlots && Object.values(availableSlots).every(v => !v))
  );

  // 결제 페이지에서 플로팅 채팅 버튼이 결제 버튼 등을 가려서 방해가 된다는 피드백으로,
  // 상담 폴백이 뜨는 경우(채팅으로 바로 문의 유도)를 제외하곤 이 페이지에서는 숨긴다.
  // 페이지를 벗어나면 다른 페이지에 영향 없도록 다시 보이게 복원.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(CHANNEL_BUTTON_VISIBILITY_EVENT, { detail: consultationNeeded }));
  }, [consultationNeeded]);
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent(CHANNEL_BUTTON_VISIBILITY_EVENT, { detail: true }));
    };
  }, []);

  // 방문 가능한 시간을 실제로 골라야만 나머지(신청자 정보/결제)를 보여준다 —
  // 어차피 못 잡을 시간대인데 개인정보부터 입력하게 하면 다 쓰고 나서 막히는 허무함이 큼
  const showRestOfForm = !!selectedTime && !consultationNeeded;
  // 실제로 그 지역/날짜에 뛸 수 있는 평가사가 있다고 확인된 경우에만 "기다리고 있어요" 문구를 보여준다 —
  // 확인 전(null)이거나 상담 안내로 빠지는 경우엔 근거 없는 문구가 되므로 노출하지 않는다.
  const hasAvailability = regionCovered === true && !!availableSlots && Object.values(availableSlots).some(v => v);
  // 평가사 카드에 쓸 지역 표기 — "이 평가사가 배정된다"는 오해를 피하려고 "담당" 대신
  // "활동 중"으로 표현한다(실제 배정은 거리 기반 자동배정이라 지목이 불가능함).
  const activeDriverRegionLabel = form.address.trim().split(' ').slice(0, 2).join(' ');

  // 토스 위젯은 #toss-payment-widget/#toss-agreement-widget DOM에 직접 렌더링하는데,
  // 그 div는 showRestOfForm(방문 시간 확정 전까진 숨김)이 true일 때만 존재한다 — 처음엔
  // 마운트 시점에 무조건 초기화를 시도해서 그 div를 못 찾아 조용히 실패했었음(에러만 콘솔에
  // 찍히고 "로딩 중..."에서 멈춤). showRestOfForm이 true가 된 뒤에야, 그리고 딱 한 번만 초기화.
  const widgetInitStarted = useRef(false);
  useEffect(() => {
    if (!showRestOfForm || widgetInitStarted.current) return;
    widgetInitStarted.current = true;
    const init = async () => {
      const TP      = (window as any).TossPayments;
      const widgets = TP(TOSS_CLIENT_KEY).widgets({ customerKey: TP.ANONYMOUS });
      widgetsRef.current = widgets;
      await widgets.setAmount({ currency: 'KRW', value: pricing.amount });
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#toss-payment-widget', variantKey: 'DEFAULT' }),
        widgets.renderAgreement({ selector: '#toss-agreement-widget', variantKey: 'AGREEMENT' }),
      ]);
      setWidgetReady(true);
    };
    if ((window as any).TossPayments) { init(); return; }
    const s  = document.createElement('script');
    s.src    = 'https://js.tosspayments.com/v2/standard';
    s.onload = () => init();
    document.head.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRestOfForm]);

  // 위젯 렌더링 후 차량 구분(국산/수입)을 바꾸면 실제 결제창 금액도 같이 갱신
  useEffect(() => {
    if (!widgetReady || !widgetsRef.current) return;
    widgetsRef.current.setAmount({ currency: 'KRW', value: pricing.amount }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing.amount, widgetReady]);

  // 네이버페이 SDK — 토스 위젯과 마찬가지로 showRestOfForm 시점에 딱 한 번만 초기화.
  // 가맹점 승인 전(샘플 clientId)에는 oPay.open() 호출 시 "연결된 가맹점이 없어…" 안내가 뜸 —
  // SDK 로딩 자체는 정상이라 naverPayReady는 true가 되고, 버튼을 눌러야 그 안내가 노출됨.
  const naverPayInitStarted = useRef(false);
  useEffect(() => {
    if (!showRestOfForm || naverPayInitStarted.current) return;
    naverPayInitStarted.current = true;
    const init = () => {
      const NP = (window as any).Naver;
      if (!NP?.Pay) return;
      naverPayRef.current = NP.Pay.create({
        mode: NAVERPAY_MODE,
        clientId: NAVERPAY_CLIENT_ID,
        chainId: NAVERPAY_CHAIN_ID,
      });
      setNaverPayReady(true);
    };
    if ((window as any).Naver?.Pay) { init(); return; }
    const s  = document.createElement('script');
    s.src    = 'https://nsp.pay.naver.com/sdk/js/naverpay.min.js';
    s.onload = () => init();
    document.head.appendChild(s);
  }, [showRestOfForm]);

  // 다음 우편번호 검색은 도로명주소만 색인돼 있어 "도이치오토월드" 같은 매물 단지/상호명으로는
  // 검색이 안 됨 — 카카오 로컬 키워드검색(대시보드 지도 화면에서 이미 쓰고 있는 것과 동일 REST
  // 키)으로 바꿔서 상호명·도로명주소 둘 다 검색되게 한다.
  const [placeQuery, setPlaceQuery]     = useState('');
  const [placeResults, setPlaceResults] = useState<{ name: string; address: string }[]>([]);
  const [showPlaceResults, setShowPlaceResults] = useState(false);
  const [searchingPlace, setSearchingPlace]     = useState(false);

  const searchPlace = async () => {
    if (!placeQuery.trim()) return;
    setSearchingPlace(true);
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(placeQuery)}`,
        { headers: { Authorization: 'KakaoAK 5d73c6482159874735a29becf6849e11' } },
      );
      const data = await res.json();
      const docs = (data?.documents ?? []).slice(0, 8).map((d: any) => ({
        name: d.place_name as string,
        address: (d.road_address_name || d.address_name) as string,
      }));
      setPlaceResults(docs);
      setShowPlaceResults(true);
    } catch {
      alert('위치 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSearchingPlace(false);
    }
  };

  const selectPlace = (p: { name: string; address: string }) => {
    setForm(prev => ({ ...prev, address: p.name ? `${p.address} (${p.name})` : p.address }));
    setShowPlaceResults(false);
    setPlaceQuery('');
    document.getElementById('inspection-detail-address')?.focus();
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const preferredDateTime = selectedDate && selectedTime
    ? `${selectedDate}T${selectedTime}:00` : '';

  const validate = () => {
    if (!form.ownerName) { alert('신청자 이름을 입력해주세요.'); return false; }
    if (!form.phone)     { alert('연락처를 입력해주세요.'); return false; }
    // 구매를 고려중인 차량 정보 — 차주 본인이 아니라 "구매하려는" 사람이 신청하는 경우가
    // 많아서 차량번호를 모를 수 있다. 차량번호/딜러 연락처/매물 링크 중 최소 하나만 있으면
    // 담당 평가사가 어떤 차량인지 확인할 수 있으므로 이 중 하나만 있어도 접수 가능하게 한다.
    if (!form.carNumber && !form.dealerContact && !form.listingUrl) {
      alert('차량번호, 딜러 연락처, 매물 링크 중 최소 하나는 입력해주세요.');
      return false;
    }
    if (!selectedDate)   { alert('방문 날짜를 선택해주세요.'); return false; }
    if (!selectedTime)   { alert('방문 시간을 선택해주세요.'); return false; }
    if (!form.address)   { alert('방문 장소를 입력해주세요.'); return false; }
    return true;
  };

  // 지역이 서비스 준비중이거나, 지역은 되는데 그 날짜엔 다 마감이라 예약 가능한 시간이
  // 하나도 없을 때 — 고객을 그냥 막지 않고 이름/연락처만 받아 결제 없이 접수해둔다.
  // 결제 전 상담 요청이라 Booking(진단 신청) 테이블이 아니라 어드민 "상담 신청" 화면이
  // 보고 있는 buyer_requests 테이블로 접수한다 — 담당자가 그 화면에서 직접 연락해 일정을
  // 조율하고, 확정되면 "진단 신청으로 전환" 버튼으로 정식 접수(Booking)로 넘긴다.
  const submitConsultRequest = async () => {
    if (!form.ownerName) { alert('이름을 입력해주세요.'); return; }
    if (!form.phone)     { alert('연락처를 입력해주세요.'); return; }
    setConsultSubmitting(true);
    try {
      await fetch('https://carvior.store/api/v1/external/buyer-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'CARVIOR_INSPECTION',
          buyerName: form.ownerName,
          contact: form.phone.replace(/-/g, ''),
          address: form.address,
          detailAddress: form.addressDetail || undefined,
          preferredDateTime: `${selectedDate} 00:00`,
          additionalMemo: '희망 일정에 예약 가능한 평가사가 없어 상담 요청함',
          privacyAgreed: true,
        }),
      });
      setConsultDone(true);
    } catch {
      alert('상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setConsultSubmitting(false);
    }
  };

  const payWithWidget = async () => {
    if (!validate()) return;
    if (!widgetReady || !widgetsRef.current) {
      alert('결제 준비 중입니다. 잠시 후 다시 시도해주세요.'); return;
    }
    setLoading(true);
    try {
      const orderId = `CARVIOR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      sessionStorage.setItem(`order_${orderId}`, JSON.stringify({
        carNumber: form.carNumber, carOwner: form.ownerName,
        contact: form.phone.replace(/-/g, ''),
        address: `${form.address} ${form.addressDetail}`.trim(),
        preferredDateTime, email: form.email || '',
        dealerName: form.dealerName || '', dealerContact: form.dealerContact || '',
        listingUrl: form.listingUrl || '',
        carOrigin,
      }));
      await widgetsRef.current.requestPayment({
        orderId, orderName: `카비어 검차 서비스 (${pricing.label}, VAT 포함)`,
        successUrl: `${window.location.origin}/inspection/success`,
        failUrl:    `${window.location.origin}/inspection/fail`,
        customerName: form.ownerName,
        customerEmail: form.email || undefined,
        customerMobilePhone: form.phone.replace(/-/g, ''),
      });
    } catch (e: any) {
      if (e?.code !== 'USER_CANCEL') alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const payWithNaverPay = () => {
    if (!validate()) return;
    if (!naverPayReady || !naverPayRef.current) {
      alert('결제 준비 중입니다. 잠시 후 다시 시도해주세요.'); return;
    }
    const merchantPayKey = `CARVIOR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    sessionStorage.setItem(`order_${merchantPayKey}`, JSON.stringify({
      carNumber: form.carNumber, carOwner: form.ownerName,
      contact: form.phone.replace(/-/g, ''),
      address: `${form.address} ${form.addressDetail}`.trim(),
      preferredDateTime, email: form.email || '',
      dealerName: form.dealerName || '', dealerContact: form.dealerContact || '',
      listingUrl: form.listingUrl || '',
      carOrigin, amount: pricing.amount,
    }));
    naverPayRef.current.open({
      merchantPayKey,
      productName: `카비어 검차 서비스 (${pricing.label})`,
      productCount: '1',
      totalPayAmount: String(pricing.amount),
      taxScopeAmount: String(pricing.amount),
      taxExScopeAmount: '0',
      returnUrl: `${window.location.origin}/inspection/naverpay-return`,
    });
  };

  const submitTransfer = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await fetch('https://carvior.store/api/v1/external/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'CARVIOR_INSPECTION', carNumber: form.carNumber, carOwner: form.ownerName,
          contact: form.phone.replace(/-/g, ''),
          address: `${form.address} ${form.addressDetail}`.trim(),
          preferredDateTime, paymentMethod: 'BANK_TRANSFER', amount: pricing.amount, carOrigin,
          dealerName: form.dealerName || '', dealerContact: form.dealerContact || '',
          listingUrl: form.listingUrl || '',
        }),
      });
      setTransferDone(true);
    } catch {
      alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (transferDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏦</div>
          <h1 className="text-xl font-black text-gray-900 mb-1">입금 신청이 완료되었습니다</h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            아래 계좌로 <strong className="text-gray-700">{pricing.amount.toLocaleString()}원</strong>을 이체해 주세요.<br />
            입금 확인 후 담당자가 연락드립니다.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-1.5">
            {[['은행', BANK_INFO.bank], ['계좌번호', BANK_INFO.number], ['예금주', BANK_INFO.holder]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-gray-400">{l}</span>
                <span className="font-bold text-gray-900 font-mono">{v}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
              <span className="text-gray-400">입금액</span>
              <span className="font-black text-violet-600">{pricing.amount.toLocaleString()}원</span>
            </div>
          </div>
          <Link href="/" className="block w-full bg-gray-900 text-white font-black py-3.5 rounded-xl text-sm text-center">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-end justify-between gap-3">
          <div>
            <nav className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
              <span>›</span>
              <Link href="/marketing/carvior-inspection" className="hover:text-gray-600 transition-colors">검차 서비스</Link>
              <span>›</span>
              <span className="text-gray-700 font-semibold">결제</span>
            </nav>
            <h1 className="text-2xl font-black text-gray-900">검차 신청 결제</h1>
          </div>
          <Link href="/inspection/cancel" className="shrink-0 text-xs text-violet-600 hover:text-violet-500 underline whitespace-nowrap">
            기존 예약 조회·취소
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── 왼쪽: 폼 ── */}
          <div className="lg:col-span-3 space-y-4">
            {isMemberPromo && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5 text-xs font-bold text-violet-700 flex items-center gap-2">
                🤝 제휴 검차 서비스 회원 전용가가 적용되었습니다
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">주문 상품 정보</h2>
              <div className="flex gap-4 items-center mb-4">
                <div className="w-16 h-16 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">🔍</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">카비어 검차 서비스</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">평가사 방문 · 100+ 항목 점검 · 디지털 리포트</p>
                </div>
              </div>

              <p className="text-xs font-bold text-gray-500 mb-2">차량 구분 <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(Object.keys(pricingTable) as CarOrigin[]).map(key => {
                  const opt = pricingTable[key];
                  const active = carOrigin === key;
                  return (
                    <button key={key} type="button" onClick={() => setCarOrigin(key)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${active ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="font-black text-gray-900 text-base">
                <span className="text-gray-400 line-through text-sm font-normal mr-2">{pricing.original.toLocaleString()}원</span>
                {pricing.amount.toLocaleString()}원 <span className="text-xs text-gray-400 font-normal">(VAT 포함)</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">방문 장소</h2>
              <div className="space-y-2">
                {form.address ? (
                  <div className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-gray-800">{form.address}</p>
                    <button onClick={() => setForm(p => ({ ...p, address: '' }))} className="text-xs text-gray-400 shrink-0 hover:text-gray-600">변경</button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        value={placeQuery}
                        onChange={e => setPlaceQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchPlace(); } }}
                        placeholder="장소를 입력한 후 검색을 눌러주세요 (예: 도이치오토월드)"
                        className={inputCls}
                      />
                      <button onClick={searchPlace} disabled={searchingPlace} className="px-4 py-3 bg-gray-900 disabled:bg-gray-300 text-white text-sm font-bold rounded-xl shrink-0 hover:bg-gray-700 transition-colors">
                        {searchingPlace ? '검색 중' : '검색'}
                      </button>
                    </div>
                    {showPlaceResults && placeResults.length > 0 && (
                      <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
                        {placeResults.map((p, i) => (
                          <button key={i} onClick={() => selectPlace(p)} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                            <p className="text-sm font-bold text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.address}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    {/* 시골 지번주소 등 카카오 검색에 안 잡히는 주소를 위한 폴백 —
                        검색 결과가 없을 때 "찾을 방법이 없다"는 인상을 주지 않도록, 바로 등록
                        가능하다는 걸 눈에 띄게 안내한다(결과가 있을 땐 덜 튀는 보조 링크로). */}
                    {showPlaceResults && placeQuery.trim() && (
                      placeResults.length === 0 ? (
                        <div className="mt-2 bg-violet-50 border border-violet-100 rounded-xl p-4">
                          <p className="text-sm text-violet-700 mb-3">
                            검색 결과가 없어요. 시골 지번주소 등은 검색에 안 잡힐 수 있으니,
                            입력하신 주소를 그대로 등록해드릴게요.
                          </p>
                          <button
                            onClick={() => selectPlace({ name: '', address: placeQuery.trim() })}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors"
                          >
                            &ldquo;{placeQuery.trim()}&rdquo; 그대로 등록하기
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => selectPlace({ name: '', address: placeQuery.trim() })}
                          className="w-full text-left px-4 py-3 mt-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          검색결과에 없나요? <span className="font-bold text-gray-900">&ldquo;{placeQuery.trim()}&rdquo;</span> 그대로 등록하기
                        </button>
                      )
                    )}
                  </div>
                )}
                <input id="inspection-detail-address" value={form.addressDetail} onChange={set('addressDetail')} placeholder="상세주소 (동/호수, 층 등)" className={inputCls} />
              </div>
            </div>

            {hasAvailability && (
              <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-5">
                {activeDrivers.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-1 mb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                    {activeDrivers.map((d, i) => {
                      const filledStars = Math.round(d.rating);
                      return (
                        <div key={i} className="shrink-0 w-56 border border-gray-100 rounded-xl p-3 bg-gray-50">
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={d.photoUrl || '/logo-icon.svg'}
                              alt=""
                              className={`w-10 h-10 rounded-full bg-white border border-gray-100 shrink-0 ${d.photoUrl ? 'object-cover' : 'p-1.5'}`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate">{d.name} 평가사님</p>
                              <p className="text-[11px] text-gray-400 truncate">{activeDriverRegionLabel} 지역에서 활동 중</p>
                            </div>
                          </div>
                          <p className="text-xs text-amber-500 font-bold mt-2 truncate">
                            {'★'.repeat(filledStars)}{'☆'.repeat(5 - filledStars)}{' '}
                            <span className="text-gray-400 font-normal">{d.rating.toFixed(1)}</span>
                          </p>
                          {d.completedCount > 0 && (
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">누적 진단 {d.completedCount.toLocaleString()}대</p>
                          )}
                          {d.highlight && (
                            <p className="text-[11px] text-gray-500 mt-1 truncate">&ldquo;{d.highlight}&rdquo;</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-black text-violet-600">활성 진단평가사님이 고객님을 기다리고 있어요!</p>
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">서두르시면 이른 시간 예약을 하실 수 있어요 🚗💨</p>
                  <div className="w-6 h-6 mx-auto rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-5">방문 일정</h2>
              {!form.address && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">먼저 위에서 방문 장소를 입력하면 실제 예약 가능한 날짜·시간이 표시됩니다.</p>
              )}
              <p className="text-xs font-bold text-gray-500 mb-2.5">방문 날짜 <span className="text-red-500">*</span></p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {days.map(d => {
                  const iso = d.toISOString().slice(0, 10);
                  const active = selectedDate === iso;
                  const isSun = d.getDay() === 0, isSat = d.getDay() === 6;
                  return (
                    <button key={iso} onClick={() => setSelectedDate(iso)} disabled={!form.address}
                      className={`shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border-2 transition-all min-w-[52px] ${active ? 'border-blue-500 bg-blue-500 text-white' : !form.address ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}>
                      <span className={`text-[10px] font-bold mb-0.5 ${active ? 'text-blue-100' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-gray-400'}`}>{DAY_LABELS[d.getDay()]}</span>
                      <span className="text-sm font-black leading-none">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-gray-500 mt-5 mb-2.5">방문 시간 <span className="text-red-500">*</span></p>
              {loadingSlots && (
                <p className="hidden lg:block text-xs text-gray-400 mb-2">예약 가능한 시간을 확인하는 중...</p>
              )}
              {consultationNeeded ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-1">
                    {regionCovered === false ? '😥 아직 이 지역은 서비스 준비 중이에요' : '😥 이 날짜엔 예약 가능한 평가사가 마감됐어요'}
                  </p>
                  <p className="text-xs text-amber-700 mb-4 leading-relaxed">
                    걱정 마세요 — 연락처만 남겨주시면 담당 매니저가 빠르게 연락드려서<br />
                    가능한 일정을 직접 확인해드릴게요.
                  </p>
                  {consultDone ? (
                    <p className="text-sm font-bold text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                      ✅ 상담 신청이 접수되었습니다! 빠른 시일 내에 연락드릴게요.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 mb-3">
                        <input value={form.ownerName} onChange={set('ownerName')} placeholder="이름" className={inputCls} />
                        <input value={form.phone} onChange={set('phone')} placeholder="연락처 (010-0000-0000)" className={inputCls} />
                      </div>
                      <button onClick={submitConsultRequest} disabled={consultSubmitting}
                        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm transition-colors">
                        {consultSubmitting ? '접수 중...' : '상담 신청하기'}
                      </button>
                      <p className="text-center text-[11px] text-amber-700 mt-3">
                        급하시면{' '}
                        <button
                          type="button"
                          onClick={() => (window as any).ChannelIO?.('show')}
                          className="font-bold underline"
                        >
                          채팅으로 바로 문의
                        </button>
                        해주셔도 돼요.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(t => {
                    const slotOk = !selectedDate || !availableSlots ? true : availableSlots[t] !== false;
                    const disabled = !selectedDate || loadingSlots || !slotOk;
                    return (
                      <button key={t} onClick={() => setSelectedTime(t)} disabled={disabled}
                        className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedTime === t ? 'border-blue-500 bg-blue-500 text-white' : disabled ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {showRestOfForm && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-black text-gray-900 text-sm mb-4">신청자 정보</h2>
                  <div className="space-y-3">
                    <Field label="신청자 이름" required><input value={form.ownerName} onChange={set('ownerName')} placeholder="홍길동" className={inputCls} /></Field>
                    <Field label="연락처" required><input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" className={inputCls} /></Field>
                    <Field label="이메일" optional><input value={form.email} onChange={set('email')} placeholder="example@email.com" type="email" className={inputCls} /></Field>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-black text-gray-900 text-sm mb-1">구매하려는 차량 정보</h2>
                  <p className="text-xs text-gray-400 mb-4">차량번호를 모르셔도 괜찮아요 — 아래 중 최소 하나만 입력해주세요.</p>
                  <div className="space-y-3">
                    <Field label="차량번호" optional><input value={form.carNumber} onChange={set('carNumber')} placeholder="모르면 비워두세요" className={inputCls} /></Field>
                    <Field label="딜러 이름" optional><input value={form.dealerName} onChange={set('dealerName')} placeholder="예: OO모터스 김OO 팀장" className={inputCls} /></Field>
                    <Field label="딜러 연락처" optional><input value={form.dealerContact} onChange={set('dealerContact')} placeholder="010-0000-0000" className={inputCls} /></Field>
                    <Field label="매물 링크" optional><input value={form.listingUrl} onChange={set('listingUrl')} placeholder="당근마켓 등 매물 페이지 링크" className={inputCls} /></Field>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── 오른쪽: 결제방법 토글 → 위젯/계좌 → 금액 → 약관 → 버튼 ── */}
          <div className="lg:col-span-2 space-y-4">
          {!showRestOfForm ? (
            <>
              {hasAvailability && (
                <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-6 text-center">
                  <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
                  <p className="text-sm font-black text-violet-600 mb-1">지금 이 지역에서 활동 중인 진단사님이 고객님을 기다리고 있어요</p>
                  <p className="text-xs text-gray-400">서두를수록 더 빠른 시간대를 잡을 수 있어요 🚗💨</p>
                </div>
              )}
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="text-2xl mb-2">📍</div>
                <p className="text-sm font-bold text-gray-700 mb-1">먼저 왼쪽에서 방문 가능한 시간을 선택해주세요</p>
                <p className="text-xs text-gray-400 leading-relaxed">시간을 확정하면 결제 방법과 금액이 여기 나타나요.</p>
              </div>
            </>
          ) : (
          <>
            {/* 결제 방법 토글 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-500 mb-3">결제 방법</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setPayMethod('widget')}
                  className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${payMethod === 'widget' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  카드·간편결제
                </button>
                <button onClick={() => setPayMethod('naverpay')}
                  className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${payMethod === 'naverpay' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  네이버페이
                </button>
                <button onClick={() => setPayMethod('direct')}
                  className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${payMethod === 'direct' ? 'border-gray-700 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  직접 계좌이체
                </button>
              </div>
            </div>

            {/* 토스 v2 위젯 (widget 선택 시) — DOM엔 항상 존재, display로 제어 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ display: payMethod === 'widget' ? 'block' : 'none' }}>
              {!widgetReady && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  결제 모듈 로딩 중...
                </div>
              )}
              <div id="toss-payment-widget" />
            </div>

            {/* 네이버페이 안내 (naverpay 선택 시) */}
            {payMethod === 'naverpay' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-500 mb-2">네이버페이로 결제</p>
                <p className="text-xs text-gray-400 leading-relaxed">아래 결제 버튼을 누르면 네이버페이 결제창이 열립니다.</p>
              </div>
            )}

            {/* 직접 계좌이체 안내 */}
            {payMethod === 'direct' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">입금 계좌</p>
                <div className="space-y-2">
                  {[['은행', BANK_INFO.bank], ['계좌번호', BANK_INFO.number], ['예금주', BANK_INFO.holder]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-gray-400">{l}</span>
                      <span className="font-bold text-gray-900 font-mono">{v}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
                    <span className="text-gray-400">입금액</span>
                    <span className="font-black text-gray-900">{pricing.amount.toLocaleString()}원</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-3">입금 확인 후 담당자가 24시간 내 연락드립니다.</p>
              </div>
            )}

            {/* 금액 요약 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">카비어 검차 서비스 ({pricing.label})</span><span className="text-gray-400 line-through">{pricing.original.toLocaleString()}원</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">프로모션 할인</span><span className="font-semibold text-violet-600">-{(pricing.original - pricing.amount).toLocaleString()}원</span></div>
              <div className="flex justify-between text-sm">
                <Link href="/policy/care" target="_blank" className="text-violet-600 underline underline-offset-2">카비어 안심케어</Link>
                <span className="font-semibold text-gray-400">무료</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-black text-gray-900">총 결제 금액 <span className="text-[10px] text-gray-400 font-normal">(VAT 포함)</span></span>
                <span className="font-black text-blue-600 text-lg">{pricing.amount.toLocaleString()}원</span>
              </div>
              {(selectedDate || selectedTime) && (
                <div className="pt-3 border-t border-gray-100 space-y-1">
                  {selectedDate && <div className="flex justify-between text-xs"><span className="text-gray-400">방문 날짜</span><span className="font-bold text-gray-700">{new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</span></div>}
                  {selectedTime && <div className="flex justify-between text-xs"><span className="text-gray-400">방문 시간</span><span className="font-bold text-gray-700">{selectedTime}</span></div>}
                </div>
              )}
            </div>

            {/* 약관 동의 위젯 (widget 선택 시) */}
            <div style={{ display: payMethod === 'widget' ? 'block' : 'none' }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div id="toss-agreement-widget" />
            </div>

            {/* 결제 버튼 */}
            {payMethod === 'widget' ? (
              <button onClick={payWithWidget} disabled={loading || !widgetReady}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm transition-colors">
                {loading ? '결제 처리 중...' : !widgetReady ? '로딩 중...' : '결제하기'}
              </button>
            ) : payMethod === 'naverpay' ? (
              <button onClick={payWithNaverPay} disabled={loading || !naverPayReady}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm transition-colors">
                {!naverPayReady ? '로딩 중...' : '네이버페이로 결제하기'}
              </button>
            ) : (
              <button onClick={submitTransfer} disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm transition-colors">
                {loading ? '신청 중...' : '직접 계좌이체 신청하기'}
              </button>
            )}

            <p className="text-center text-[10px] text-gray-400">
              검차 전날 18시까지 100% 환불 가능합니다. <Link href="/policy/refund" target="_blank" className="text-violet-600 underline">환불 규정 보기</Link>
            </p>
          </>
          )}
          </div>

        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors placeholder:text-gray-300';

function Field({ label, required, optional, children }: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-600 mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {optional && <span className="text-gray-300 font-normal ml-1">(선택)</span>}
      </label>
      {children}
    </div>
  );
}
