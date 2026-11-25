'use client';

// 딜러 전용 출장검차 신청 —— 안내 + 접수 폼을 한 페이지에 둔다.
//
// 결제는 계좌이체만 받는다. 개인사업자 폐업과 함께 PG(카드·간편결제)가 전부 막혀서,
// 결제창을 띄우면 딜러가 실패만 겪는다. 법인 PG가 열리면 이 페이지에 결제 수단을 더하면 된다.
//
// 접수는 source='DEALER_PARTNER_INSPECTION'으로 들어간다. 백엔드가 이 출처를
// requestType='REMOTE_INSPECTION'(비대면검차)로 잡아줘서 리포트가 딜러에게 간다
// — 차주에게 가면 안 되는 건이라 출처를 바꾸면 안 된다.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BANK_INFO } from '@/lib/bank';

const API = 'https://carvior.store/api/v1';

// 안내문과 같은 값이어야 한다. 거리 할증은 백엔드(distance-estimate)가 계산한다.
//
// 화물 — 1톤·1.2톤(봉고·포터)은 수입차와 같은 기준으로 받고, 3.5톤은 15만원.
// 5톤 초과는 차마다 손이 많이 달라서 가격을 못 박는다 — 선택지로 두지 않고
// NEGOTIATION_TEL로 협의하도록 돌린다(선택지로 두면 금액이 0원으로 접수된다).
// 중고 시세 8천만원 초과 차량도 같은 이유로 온라인 접수를 받지 않는다.
const CAR_PRICING = {
  DOMESTIC: { label: '국산차', sub: null, base: 100_000 },
  IMPORTED: { label: '수입차', sub: null, base: 130_000 },
  CARGO_SMALL: { label: '화물 1~1.2톤', sub: '봉고 · 포터', base: 130_000 },
  CARGO_3_5T: { label: '화물 3.5톤', sub: '5톤까지', base: 150_000 },
} as const;
type CarOrigin = keyof typeof CAR_PRICING;

// 온라인으로 금액을 못 박는 건들 — 전화로 협의한다.
// ① 5톤 초과 화물 ② 중고 시세 8천만원 초과 차량.
// 둘 다 차마다 손이 달라서 정찰로 받으면 손해를 보거나 못 가는 건이 생긴다.
// 선택지로 만들면 금액 0원으로 접수되므로 아예 받지 않고 전화로 돌린다.
const NEGOTIATION_TEL = '070-4138-2017';
// 이 시세를 넘으면 온라인 접수를 받지 않는다. 폼에 시세를 받는 칸이 없어서
// 지금은 '안내'일 뿐 막지는 못한다 — 막으려면 시세 입력칸이 먼저 필요하다.
const HIGH_VALUE_LIMIT_LABEL = '8천만원';

const FEATURES = [
  { title: '100+ 항목 점검', desc: '사고·교환·판금·누유·하부 등' },
  { title: '사진·진단보고서', desc: '상세 리포트 제공' },
  { title: '원하는 장소로 방문', desc: '매물 위치로 직접 출장' },
  { title: '주말·야간 할증 없음', desc: '언제든 동일한 요금' },
];

const BENEFITS = [
  '차량 보러 가는 시간과 이동 비용 절감',
  '전문가의 객관적인 차량 상태 확인',
  '매입 전 리스크 최소화로 안전한 매입',
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const won = (n: number) => `${n.toLocaleString()}원`;

export default function DealerInspectionPage() {
  const [carOrigin, setCarOrigin] = useState<CarOrigin>('DOMESTIC');
  const [form, setForm] = useState({
    dealerName: '',
    contact: '',
    carNumber: '',
    carModel: '',
    address: '',
    addressDetail: '',
    listingUrl: '',
    memo: '',
  });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [estimate, setEstimate] = useState<{ km: number | null; roundTripKm: number | null; surcharge: number } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ amount: number } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // 다음 우편번호 — 스크립트는 이 페이지에서만 쓰므로 여기서 한 번 심는다
  useEffect(() => {
    if (document.getElementById('daum-postcode')) return;
    const s = document.createElement('script');
    s.id = 'daum-postcode';
    s.src = '//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.body.appendChild(s);
  }, []);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayName: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
      dateNum: d.getDate(),
      weekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  // 주소가 정해지면 출장비를 미리 계산해서 보여준다(접수 전이라 주소만으로 추정)
  const loadEstimate = useCallback(async (address: string) => {
    if (!address.trim()) { setEstimate(null); return; }
    setEstimating(true);
    try {
      const res = await fetch(`${API}/external/request/distance-estimate?address=${encodeURIComponent(address)}`);
      setEstimate(res.ok ? await res.json() : null);
    } catch {
      setEstimate(null);
    } finally {
      setEstimating(false);
    }
  }, []);

  const openPostcode = () => {
    if (!window.daum?.Postcode) {
      alert('주소 검색을 불러오는 중입니다. 잠시 후 다시 눌러주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        let full = data.address;
        if (data.addressType === 'R') {
          const extra = [data.bname, data.buildingName].filter(Boolean).join(', ');
          if (extra) full += ` (${extra})`;
        }
        setForm(prev => ({ ...prev, address: full }));
        loadEstimate(full);
      },
    }).open();
  };

  const base = CAR_PRICING[carOrigin].base;
  const surcharge = estimate?.surcharge ?? 0;
  const supply = base + surcharge;
  const vat = Math.round(supply * 0.1);
  const total = supply + vat;

  const submit = async () => {
    if (!form.dealerName.trim()) return alert('상호(또는 성함)를 입력해주세요.');
    if (!form.contact.trim()) return alert('연락처를 입력해주세요.');
    if (!form.address.trim()) return alert('차량이 있는 주소를 입력해주세요.');
    if (!date || !time) return alert('희망 방문 날짜와 시간을 선택해주세요.');

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/external/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'DEALER_PARTNER_INSPECTION',
          // 신청 시점엔 차량번호를 모르는 경우가 많다 — 비우면 "미정"으로 접수하고
          // 평가사가 현장에서 채운다(간편신청과 같은 규칙).
          carNumber: form.carNumber.trim() || '미정',
          carOwner: '미정',
          carModel: form.carModel.trim() || null,
          dealerName: form.dealerName.trim(),
          contact: form.contact.replace(/-/g, '').trim(),
          address: `${form.address} ${form.addressDetail}`.trim(),
          preferredDateTime: `${date} ${time}`,
          paymentMethod: 'BANK_TRANSFER',
          carOrigin,
          amount: total,
          listingUrl: form.listingUrl.trim() || '',
          additionalMemo: [
            `[차량 구분] ${CAR_PRICING[carOrigin].label}${CAR_PRICING[carOrigin].sub ? ` (${CAR_PRICING[carOrigin].sub})` : ''}`,
            form.memo.trim(),
            estimate?.roundTripKm != null ? `[출장비] 왕복 약 ${estimate.roundTripKm}km · 할증 ${won(surcharge)}` : null,
          ].filter(Boolean).join('\n'),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? '접수에 실패했습니다.');
      }
      setDone({ amount: total });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      alert(e?.message ?? '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏦</div>
          <h1 className="text-xl font-black text-slate-900 mb-1.5">신청이 접수되었습니다</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            아래 계좌로 <strong className="text-slate-800">{won(done.amount)}</strong>을 입금해주세요.<br />
            입금이 확인되면 평가사가 배정되고 담당자가 연락드립니다.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {[['은행', BANK_INFO.bank], ['계좌번호', BANK_INFO.number], ['예금주', BANK_INFO.holder]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-slate-400">{l}</span>
                <span className="font-bold text-slate-900">{v}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
              <span className="text-slate-400">입금액</span>
              <span className="font-black text-violet-600">{won(done.amount)}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-5">
            입금자명은 신청하신 상호로 보내주시면 확인이 빠릅니다.
          </p>

          {/* 비회원 접수라 지금은 문자로만 받으시게 된다. bookings엔 userId가 없어서
              "접수한 번호 = 가입한 번호"일 때만 마이페이지에 붙는다 — 그 조건을 알려준다. */}
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 text-left mb-5">
            <p className="text-xs font-black text-violet-700 mb-1">진행상황을 직접 보시려면</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              방금 적으신 번호(<strong>{form.contact}</strong>)로 가입하시면 마이페이지에서
              배정·진행상황과 리포트를 바로 보실 수 있습니다. 매입하신 차를 다시 파실 때
              스마트옥션 출품도 거기서 하실 수 있습니다.
            </p>
            <Link href="/register" className="inline-block mt-2.5 text-[11px] font-black text-violet-600 hover:underline">
              회원가입하고 진행상황 보기 →
            </Link>
          </div>

          <Link href="/" className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-sm">
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
          <span className="inline-block bg-violet-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full mb-5">
            딜러 전용 서비스
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-[1.25] mb-4">
            차량 매입 전 상태 확인,<br />
            <span className="text-violet-600">카비어 출장검차</span>로 더 빠르고 확실하게!
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-8">
            전문 진단평가사가 차량이 있는 곳으로 직접 방문해 매입 리스크를 줄여드립니다.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
                <p className="text-xs sm:text-sm font-black text-slate-900">{f.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 space-y-10">
        {/* 요금 */}
        <section>
          <h2 className="text-lg font-black text-slate-900 mb-1">검차 비용</h2>
          <p className="text-xs text-slate-400 mb-4">
            활성화된 진단평가사 중 매물 위치와 가장 가까운 평가사를 기준으로 직선거리(왕복)를
            계산해 출장비가 자동으로 산출됩니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">국산차</span>
                <p className="text-2xl font-black text-slate-900">100,000<span className="text-sm font-bold text-slate-400">원</span></p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-right">VAT 별도</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-black text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">수입차</span>
                <p className="text-2xl font-black text-violet-700">130,000<span className="text-sm font-bold text-violet-400">원</span></p>
              </div>
              <p className="text-[11px] text-violet-400 mt-2 text-right">VAT 별도</p>
            </div>
          </div>

          {/* 고가 차량 — 톤수와 같은 이유로 온라인 정찰에서 뺀다 */}
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-3.5">
            <span className="text-sm text-slate-700">
              중고 시세 {HIGH_VALUE_LIMIT_LABEL} 초과 차량
              <span className="block text-[11px] text-slate-400 mt-0.5">차량 상태·점검 범위에 따라 달라집니다</span>
            </span>
            <a href={`tel:${NEGOTIATION_TEL}`} className="text-sm font-black text-violet-600 hover:text-violet-700 shrink-0">
              별도 협의 <span className="font-bold">{NEGOTIATION_TEL}</span>
            </a>
          </div>

          {/* 화물 — 톤수로 갈린다. 5톤 초과는 금액을 못 박아서 협의로 보낸다. */}
          <div className="mt-3 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-black text-slate-700">화물차</span>
              <span className="text-[11px] text-slate-400">톤수 기준 · VAT 별도</span>
            </div>
            <ul className="divide-y divide-slate-100">
              <li className="flex items-center justify-between gap-3 px-5 py-3.5">
                <span className="text-sm text-slate-700">
                  1톤 · 1.2톤
                  <span className="block text-[11px] text-slate-400 mt-0.5">봉고 · 포터 등 — 수입차와 동일 기준</span>
                </span>
                <span className="text-lg font-black text-slate-900 shrink-0">130,000<span className="text-xs font-bold text-slate-400">원</span></span>
              </li>
              <li className="flex items-center justify-between gap-3 px-5 py-3.5">
                <span className="text-sm text-slate-700">
                  3.5톤
                  <span className="block text-[11px] text-slate-400 mt-0.5">5톤까지</span>
                </span>
                <span className="text-lg font-black text-slate-900 shrink-0">150,000<span className="text-xs font-bold text-slate-400">원</span></span>
              </li>
              <li className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/60">
                <span className="text-sm text-slate-700">
                  5톤 초과
                  <span className="block text-[11px] text-slate-400 mt-0.5">차량 상태·작업량에 따라 달라집니다</span>
                </span>
                <a href={`tel:${NEGOTIATION_TEL}`} className="text-sm font-black text-violet-600 hover:text-violet-700 shrink-0">
                  별도 협의 <span className="font-bold">{NEGOTIATION_TEL}</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-black text-slate-700 mb-3">
              거리 할증 <span className="font-normal text-slate-400">(평가사 기준 직선거리, 왕복)</span>
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
              <p className="text-sm text-slate-600">50km 이상 <strong className="text-slate-900">+20,000원</strong></p>
              <p className="text-sm text-slate-600">100km 이상 <strong className="text-slate-900">+40,000원</strong></p>
            </div>
          </div>
        </section>

        {/* 신청 폼 */}
        <section ref={formRef} className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4">
            <h2 className="text-base font-black text-white">딜러 전용 출장검차 신청하기</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">PC/모바일에서 간편하게 접수하세요.</p>
          </div>

          <div className="p-6 space-y-7">
            {/* 차종 */}
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2">차량 구분</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CAR_PRICING) as CarOrigin[]).map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCarOrigin(key)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-colors ${
                      carOrigin === key
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {CAR_PRICING[key].label}
                    {CAR_PRICING[key].sub && (
                      <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                        {CAR_PRICING[key].sub}
                      </span>
                    )}
                    <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                      {won(CAR_PRICING[key].base)} (VAT 별도)
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                5톤 초과 화물과 중고 시세 {HIGH_VALUE_LIMIT_LABEL}이 넘는 차량은
                금액이 차량마다 달라 온라인 접수를 받지 않습니다 —{' '}
                <a href={`tel:${NEGOTIATION_TEL}`} className="font-bold text-violet-600 hover:text-violet-700">
                  {NEGOTIATION_TEL}
                </a>
                로 연락 주시면 협의해 드립니다.
              </p>
            </div>

            {/* 딜러 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="상호 / 성함" required>
                <input
                  value={form.dealerName}
                  onChange={e => setForm({ ...form, dealerName: e.target.value })}
                  placeholder="카비어모터스 홍길동"
                  className={inputCls}
                />
              </Field>
              <Field label="연락처" required>
                <input
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                  placeholder="01012345678"
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* 차량 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="차량번호" hint="모르시면 비워두세요">
                <input
                  value={form.carNumber}
                  onChange={e => setForm({ ...form, carNumber: e.target.value.replace(/\s/g, '') })}
                  placeholder="12가3456"
                  className={inputCls}
                />
              </Field>
              <Field label="차량명" hint="선택">
                <input
                  value={form.carModel}
                  onChange={e => setForm({ ...form, carModel: e.target.value })}
                  placeholder="그랜저 IG 2.4"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* 주소 */}
            <Field label="차량이 있는 주소" required hint="이 주소로 출장비가 계산됩니다">
              <div className="flex gap-2">
                <input
                  value={form.address}
                  readOnly
                  onClick={openPostcode}
                  placeholder="주소 검색을 눌러주세요"
                  className={`${inputCls} cursor-pointer bg-slate-50`}
                />
                <button
                  type="button"
                  onClick={openPostcode}
                  className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 rounded-xl"
                >
                  주소 검색
                </button>
              </div>
              <input
                value={form.addressDetail}
                onChange={e => setForm({ ...form, addressDetail: e.target.value })}
                placeholder="상세 주소 (동/호, 주차 위치 등)"
                className={`${inputCls} mt-2`}
              />
            </Field>

            {/* 방문 일시 */}
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2">
                희망 방문 날짜 <span className="text-violet-500">*</span>
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map(d => (
                  <button
                    key={d.full}
                    type="button"
                    onClick={() => setDate(d.full)}
                    className={`shrink-0 w-14 h-[68px] rounded-xl border flex flex-col items-center justify-center transition-colors ${
                      date === d.full ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-[10px] mb-1 ${date === d.full ? 'text-violet-500' : d.weekend ? 'text-red-400' : 'text-slate-400'}`}>
                      {d.dayName}
                    </span>
                    <span className={`text-lg font-black ${date === d.full ? 'text-violet-700' : 'text-slate-700'}`}>
                      {d.dateNum}
                    </span>
                  </button>
                ))}
              </div>

              <label className="block text-xs font-black text-slate-500 mt-4 mb-2">
                희망 방문 시간 <span className="text-violet-500">*</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    disabled={!date}
                    onClick={() => setTime(t)}
                    className={`py-2.5 rounded-lg border text-xs font-bold transition-colors ${
                      !date ? 'opacity-30 border-slate-200' :
                      time === t ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 선택 입력 */}
            <div className="grid grid-cols-1 gap-3">
              <Field label="매물 링크" hint="선택 — 엔카·KB차차차 등">
                <input
                  value={form.listingUrl}
                  onChange={e => setForm({ ...form, listingUrl: e.target.value })}
                  placeholder="https://"
                  className={inputCls}
                />
              </Field>
              <Field label="요청사항" hint="선택">
                <textarea
                  value={form.memo}
                  onChange={e => setForm({ ...form, memo: e.target.value })}
                  rows={2}
                  placeholder="하부 위주로 봐주세요 / 판매자 연락처는 010-0000-0000"
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>

            {/* 금액 */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
              <div className="space-y-1.5 text-sm">
                <Row label={`검차비 (${CAR_PRICING[carOrigin].label})`} value={won(base)} />
                <Row
                  label="거리 할증"
                  value={
                    estimating ? '계산 중…'
                    : estimate?.roundTripKm != null ? `${won(surcharge)} (왕복 약 ${estimate.roundTripKm}km)`
                    : form.address ? '0원'
                    : '주소 입력 후 계산'
                  }
                />
                <Row label="부가세 (10%)" value={won(vat)} />
              </div>
              <div className="border-t border-slate-200 mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm font-black text-slate-700">총 입금액</span>
                <span className="text-xl font-black text-violet-600">{won(total)}</span>
              </div>
              {estimate?.km == null && form.address && !estimating && (
                <p className="text-[11px] text-amber-600 mt-2 leading-relaxed">
                  지금은 가까운 활성 평가사를 찾지 못해 할증 없이 계산했습니다.
                  배정 과정에서 거리가 멀면 담당자가 연락드립니다.
                </p>
              )}
            </div>

            {/* 계좌 */}
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
              <p className="text-xs font-black text-violet-700 mb-2">입금 계좌 (계좌이체만 가능)</p>
              <p className="text-sm font-black text-slate-900">
                {BANK_INFO.bank} {BANK_INFO.number}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">예금주 {BANK_INFO.holder}</p>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                카드·간편결제는 법인 전환에 따른 결제대행 전환 작업으로 잠시 중단되었습니다.
                입금이 확인되면 평가사가 배정됩니다.
              </p>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-xl text-sm transition-colors"
            >
              {submitting ? '접수 중…' : `출장검차 신청하기 (${won(total)})`}
            </button>
          </div>
        </section>

        {/* 🔴 검차 리포트 예시 버튼은 내려뒀다(2026-11-25) — 리포트 사진에 번호판이
            그대로 보인다(옆 차 번호판 포함). 블러 적용 후 다시 건다.
            자세한 경위는 app/page.tsx의 같은 자리 주석 참고. */}

        {/* 혜택 */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BENEFITS.map(b => (
            <div key={b} className="flex items-start gap-2 rounded-xl border border-slate-200 px-4 py-3.5">
              <span className="text-violet-500 text-sm shrink-0">✓</span>
              <p className="text-xs text-slate-600 leading-relaxed">{b}</p>
            </div>
          ))}
        </section>

        <p className="text-[11px] text-slate-400 leading-relaxed text-center">
          수도권(서울·경기·인천)은 빠른 배정이 가능하며, 부울경을 포함한 전국 주요 지역에서
          출장검차를 제공합니다. 평가사 일정에 따라 희망 시간이 조정될 수 있습니다.
        </p>
      </div>
    </main>
  );
}

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors';

function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-500 mb-2">
        {label} {required && <span className="text-violet-500">*</span>}
        {hint && <span className="font-normal text-slate-300 ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}
