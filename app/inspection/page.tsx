'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? 'live_gck_Gv6LjeKD8ajb9274j6mw3wYxAdXy';
const AMOUNT      = 88_000;
const AMOUNT_BASE = 80_000;

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface Form {
  carNumber:     string;
  ownerName:     string;
  phone:         string;
  email:         string;
  address:       string;
  addressDetail: string;
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
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading]           = useState(false);
  const [widgetReady, setWidgetReady]   = useState(false);
  const widgetsRef = useRef<any>(null);

  const days = getAvailableDays();

  // v2 위젯 초기화 — 오른쪽 컬럼 div에 렌더링
  useEffect(() => {
    const init = async () => {
      const TP      = (window as any).TossPayments;
      const widgets = TP(TOSS_CLIENT_KEY).widgets({ customerKey: TP.ANONYMOUS });
      widgetsRef.current = widgets;
      await widgets.setAmount({ currency: 'KRW', value: AMOUNT });
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
  }, []);

  const openAddressSearch = () => {
    if (!(window as any).daum?.Postcode) {
      alert('주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.'); return;
    }
    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        let full = data.address;
        if (data.addressType === 'R') {
          let extra = '';
          if (data.bname) extra += data.bname;
          if (data.buildingName) extra += extra ? `, ${data.buildingName}` : data.buildingName;
          if (extra) full += ` (${extra})`;
        }
        setForm(p => ({ ...p, address: full }));
        document.getElementById('inspection-detail-address')?.focus();
      },
    }).open();
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const preferredDateTime = selectedDate && selectedTime
    ? `${selectedDate}T${selectedTime}:00`
    : '';

  const validate = () => {
    if (!form.carNumber) { alert('차량번호를 입력해주세요.'); return false; }
    if (!form.ownerName) { alert('소유주 이름을 입력해주세요.'); return false; }
    if (!form.phone)     { alert('연락처를 입력해주세요.'); return false; }
    if (!selectedDate)   { alert('방문 날짜를 선택해주세요.'); return false; }
    if (!selectedTime)   { alert('방문 시간을 선택해주세요.'); return false; }
    if (!form.address)   { alert('방문 장소를 입력해주세요.'); return false; }
    return true;
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
        carNumber:         form.carNumber,
        carOwner:          form.ownerName,
        contact:           form.phone.replace(/-/g, ''),
        address:           `${form.address} ${form.addressDetail}`.trim(),
        preferredDateTime,
        email:             form.email || '',
      }));
      await widgetsRef.current.requestPayment({
        orderId,
        orderName:           '카비어 공인 검차 서비스 (VAT 포함)',
        successUrl:          `${window.location.origin}/inspection/success`,
        failUrl:             `${window.location.origin}/inspection/fail`,
        customerName:        form.ownerName,
        customerEmail:       form.email || undefined,
        customerMobilePhone: form.phone.replace(/-/g, ''),
      });
    } catch (e: any) {
      if (e?.code !== 'USER_CANCEL') alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <nav className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span>›</span>
            <Link href="/marketing/carvior-inspection" className="hover:text-gray-600 transition-colors">검차 서비스</Link>
            <span>›</span>
            <span className="text-gray-700 font-semibold">결제</span>
          </nav>
          <h1 className="text-2xl font-black text-gray-900">검차 신청 결제</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── 왼쪽: 폼만 ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* 주문 상품 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">주문 상품 정보</h2>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">🔍</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">카비어 공인 검차 서비스</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">공인 평가사 방문 · 100+ 항목 점검 · 디지털 리포트</p>
                  <p className="font-black text-gray-900 text-base mt-2">
                    80,000원 <span className="text-xs text-gray-400 font-normal">(VAT 별도)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 신청자 정보 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">신청자 정보</h2>
              <div className="space-y-3">
                <Field label="차량번호" required>
                  <input value={form.carNumber} onChange={set('carNumber')} placeholder="12가 3456" className={inputCls} />
                </Field>
                <Field label="소유주 이름" required>
                  <input value={form.ownerName} onChange={set('ownerName')} placeholder="홍길동" className={inputCls} />
                </Field>
                <Field label="연락처" required>
                  <input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" className={inputCls} />
                </Field>
                <Field label="이메일" optional>
                  <input value={form.email} onChange={set('email')} placeholder="example@email.com" type="email" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* 방문 일정 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-5">방문 일정</h2>

              <p className="text-xs font-bold text-gray-500 mb-2.5">방문 날짜 <span className="text-red-500">*</span></p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {days.map(d => {
                  const iso    = d.toISOString().slice(0, 10);
                  const isSat  = d.getDay() === 6;
                  const isSun  = d.getDay() === 0;
                  const active = selectedDate === iso;
                  return (
                    <button key={iso} onClick={() => setSelectedDate(iso)}
                      className={`shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border-2 transition-all min-w-[52px] ${
                        active ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className={`text-[10px] font-bold mb-0.5 ${
                        active ? 'text-blue-100' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-gray-400'
                      }`}>{DAY_LABELS[d.getDay()]}</span>
                      <span className="text-sm font-black leading-none">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-bold text-gray-500 mt-5 mb-2.5">방문 시간 <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)} disabled={!selectedDate}
                    className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      selectedTime === t
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : !selectedDate
                        ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* 방문 장소 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">방문 장소</h2>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input value={form.address} readOnly placeholder="주소 검색"
                    className={`${inputCls} flex-1 bg-gray-50 cursor-pointer`}
                    onClick={openAddressSearch}
                  />
                  <button onClick={openAddressSearch}
                    className="px-4 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl shrink-0 hover:bg-gray-700 transition-colors">
                    검색
                  </button>
                </div>
                <input id="inspection-detail-address" value={form.addressDetail} onChange={set('addressDetail')}
                  placeholder="상세주소 (동/호수, 층 등)" className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 결제 위젯 → 금액 → 약관 → 버튼 ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* 결제 수단 위젯 (상단) */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {!widgetReady && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  결제 모듈 로딩 중...
                </div>
              )}
              <div id="toss-payment-widget" />
            </div>

            {/* 금액 요약 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">카비어 검차 서비스</span>
                <span className="font-semibold text-gray-700">{AMOUNT_BASE.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">카비어 안심케어</span>
                <span className="font-semibold text-gray-400">무료</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-black text-gray-900">
                  총 결제 금액 <span className="text-[10px] text-gray-400 font-normal">(VAT 포함)</span>
                </span>
                <span className="font-black text-blue-600 text-lg">{AMOUNT.toLocaleString()}원</span>
              </div>
              {(selectedDate || selectedTime) && (
                <div className="pt-3 border-t border-gray-100 space-y-1">
                  {selectedDate && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">방문 날짜</span>
                      <span className="font-bold text-gray-700">
                        {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">방문 시간</span>
                      <span className="font-bold text-gray-700">{selectedTime}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 약관 동의 위젯 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div id="toss-agreement-widget" />
            </div>

            {/* 결제 버튼 */}
            <button onClick={payWithWidget} disabled={loading || !widgetReady}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm transition-colors">
              {loading ? '결제 처리 중...' : !widgetReady ? '로딩 중...' : '결제하기'}
            </button>
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
