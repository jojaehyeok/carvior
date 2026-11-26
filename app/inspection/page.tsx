'use client';

// 검차 신청(/inspection) — 비대면 / 동행 두 종류를 한 페이지에서 받는다.
//
// 예전엔 여기서 토스·네이버페이를 먼저 태웠는데, 법인 전환으로 PG가 전부 막혀
// 계좌이체만 받는 화면으로 다시 썼다. 결제 콜백용 하위 경로(success/fail/
// naverpay-return/cancel)는 PG가 다시 열릴 때를 위해 남겨뒀다.
//
// 결제는 계좌이체만 받는다. 법인 전환으로 PG(카드·간편결제)가 전부 막혀 있어서
// 결제창을 띄우면 실패만 겪는다. 입금을 확인한 뒤에 평가사를 배정한다.
//
// 금액은 차급별 변동가격이다(lib/inspectionPricing). 거리 할증은 쓰지 않는다 —
// 차급으로 이미 갈리는데 할증까지 붙이면 최종 금액이 언제 확정되는지 알 수 없다.
//
// 접수는 source='CARVIOR_INSPECTION' + requestType으로 들어간다. requestType이
// 리포트를 누가 받는지를 가르므로(백엔드 bookings.requestType) 반드시 같이 보낸다.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BANK_INFO } from '@/lib/bank';
import PrivacyModal from '@/components/PrivacyModal';
import {
  CarOrigin, INSPECTION_TYPES, InspectionType, classesFor, priceFor,
} from '@/lib/inspectionPricing';

const API = 'https://carvior.store/api/v1';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const won = (n: number) => `${n.toLocaleString()}원`;
const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors';

function InspectionInner() {
  const params = useSearchParams();
  const initialType = (params.get('type') === 'PURCHASE_ESCORT' ? 'PURCHASE_ESCORT' : 'REMOTE_INSPECTION') as InspectionType;

  const [type, setType] = useState<InspectionType>(initialType);
  const [origin, setOrigin] = useState<CarOrigin>('DOMESTIC');
  const [carClass, setCarClass] = useState<string>('');
  const [form, setForm] = useState({
    name: '', contact: '', carNumber: '', carModel: '',
    address: '', addressDetail: '', listingUrl: '', memo: '',
  });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ amount: number } | null>(null);
  // 개인정보 동의 — 접수하면 평가사·담당자에게 연락처와 주소가 넘어간다.
  // 동의 없이 받으면 안 되고, 받은 값을 서버에 같이 보낸다(privacyAgreed).
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // 방문 주소+날짜로 "그 시간에 실제로 뛸 수 있는 평가사가 있는지"를 서버에 물어본다.
  // 2026-07(27aab50)에 넣었던 기능인데 11/15 결제화면 교체(439f150) 때 같이 날아갔다 —
  // 백엔드(available-slots)는 그대로 살아 있어서 화면만 다시 붙인 것이다.
  // 판정 기준이 자동배정(tryAutoAssign)과 같아서, 여기서 "가능"이면 접수 후에도 실제로 붙는다.
  const [slotMap, setSlotMap] = useState<Record<string, boolean> | null>(null);
  const [regionCovered, setRegionCovered] = useState<boolean | null>(null);
  const [areaDrivers, setAreaDrivers] = useState<{ name: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // 배정이 안 되는 지역·날짜에서 그냥 막아버리면 손님이 그 자리에서 나간다 —
  // 입력해둔 내용을 상담(buyer_requests)으로 넘겨 대시보드에 남긴다.
  const [consultSent, setConsultSent] = useState(false);
  const [consultSending, setConsultSending] = useState(false);

  useEffect(() => {
    if (!form.address || !date) {
      setSlotMap(null);
      setRegionCovered(null);
      setAreaDrivers([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`${API}/external/request/available-slots?address=${encodeURIComponent(form.address)}&date=${date}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data) return;
        const map: Record<string, boolean> = {};
        (Array.isArray(data.slots) ? data.slots : []).forEach((x: { time: string; available: boolean }) => {
          map[x.time] = x.available;
        });
        setSlotMap(map);
        setRegionCovered(data.regionCovered ?? true);
        setAreaDrivers(Array.isArray(data.activeDrivers) ? data.activeDrivers : []);
        // 이미 골라둔 시간이 이번 조회에서 불가로 바뀌면 선택을 풀어준다 —
        // 안 풀면 화면엔 비활성인데 값은 남아 그대로 접수된다.
        setTime(prev => (prev && map[prev] === false ? '' : prev));
      })
      .catch(() => {
        // 조회 실패는 "가능/불가 모름"이지 "불가"가 아니다 — 폼을 막지 않고 원래대로 둔다.
        if (!cancelled) { setSlotMap(null); setRegionCovered(null); setAreaDrivers([]); }
      })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [form.address, date]);

  useEffect(() => {
    if (document.getElementById('daum-postcode')) return;
    const s = document.createElement('script');
    s.id = 'daum-postcode';
    s.src = '//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.body.appendChild(s);
  }, []);

  // 차급 목록이 국산/수입에 따라 달라서(국산엔 스포츠카·슈퍼카가 없다),
  // 수입에서 슈퍼카를 고른 뒤 국산으로 바꾸면 고른 값이 사라져야 한다
  useEffect(() => {
    if (carClass && priceFor(origin, carClass) == null) setCarClass('');
  }, [origin, carClass]);

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

  const openPostcode = () => {
    const daum = (window as any).daum;
    if (!daum?.Postcode) {
      alert('주소 검색을 불러오는 중입니다. 잠시 후 다시 눌러주세요.');
      return;
    }
    new daum.Postcode({
      oncomplete: (data: any) => {
        let full = data.address;
        if (data.addressType === 'R') {
          const extra = [data.bname, data.buildingName].filter(Boolean).join(', ');
          if (extra) full += ` (${extra})`;
        }
        setForm(prev => ({ ...prev, address: full }));
      },
    }).open();
  };

  const amount = carClass ? priceFor(origin, carClass) : null;
  const typeInfo = INSPECTION_TYPES.find(t => t.key === type)!;

  // 배정이 안 되는 지역/날짜에서 "접수 불가"로 끝내지 않고 상담으로 넘긴다.
  // 저장되는 곳은 검차 접수(bookings)가 아니라 상담(buyer_requests)이라
  // 대시보드 "상담" 목록에 뜨고, 평가사 배정·알림톡은 타지 않는다.
  const sendConsult = async () => {
    if (!form.name.trim()) return alert('성함을 입력해주세요.');
    if (!form.contact.trim()) return alert('연락처를 입력해주세요.');
    if (!privacyAgreed) return alert('개인정보 수집 및 이용에 동의해주세요.');

    setConsultSending(true);
    try {
      const memo = [
        `상담 전환 사유: ${regionCovered === false ? '담당 평가사 없는 지역' : '희망 날짜 배정 불가'}`,
        `상품: ${typeInfo.label}`,
        carClass ? `차급: ${origin === 'DOMESTIC' ? '국산' : '수입'} ${carClass}` : null,
        form.carNumber ? `차량번호: ${form.carNumber}` : null,
        form.carModel ? `차량명: ${form.carModel}` : null,
        form.listingUrl ? `매물: ${form.listingUrl}` : null,
        form.memo ? `전달사항: ${form.memo}` : null,
      ].filter(Boolean).join(' / ');

      const res = await fetch(`${API}/external/buyer-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'INSPECTION_CONSULT',
          buyerName: form.name.trim(),
          contact: form.contact.trim(),
          address: form.address.trim(),
          detailAddress: form.addressDetail.trim(),
          preferredDateTime: date ? `${date} ${time || ''}`.trim() : '미정',
          additionalMemo: memo,
          privacyAgreed,
        }),
      });
      if (!res.ok) throw new Error('상담 접수 실패');
      setConsultSent(true);
    } catch {
      alert('상담 신청 중 오류가 발생했습니다. 070-4138-2017로 연락 주세요.');
    } finally {
      setConsultSending(false);
    }
  };

  const submit = async () => {
    if (!carClass || !amount) return alert('차급을 선택해주세요.');
    if (!form.name.trim()) return alert('성함을 입력해주세요.');
    if (!form.contact.trim()) return alert('연락처를 입력해주세요.');
    if (!form.address.trim()) return alert('차량이 있는 주소를 입력해주세요.');
    if (!date || !time) return alert('희망 방문 날짜와 시간을 선택해주세요.');
    if (!privacyAgreed) return alert('개인정보 수집 및 이용에 동의해주세요.');

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/external/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'CARVIOR_INSPECTION',
          requestType: type,
          // 신청 시점엔 차량번호를 모르는 경우가 많다 — 비우면 "미정"으로 받고
          // 평가사가 현장에서 채운다(다른 접수 폼과 같은 규칙)
          carNumber: form.carNumber.trim() || '미정',
          carOwner: '미정',
          carModel: form.carModel.trim() || null,
          contact: form.contact.replace(/-/g, '').trim(),
          dealerName: form.name.trim(),
          address: `${form.address} ${form.addressDetail}`.trim(),
          preferredDateTime: `${date} ${time}`,
          paymentMethod: 'BANK_TRANSFER',
          privacyAgreed,
          carOrigin: origin,
          amount,
          listingUrl: form.listingUrl.trim() || '',
          additionalMemo: [
            `[검차 종류] ${typeInfo.label}`,
            `[차급] ${origin === 'DOMESTIC' ? '국산' : '수입'} · ${classesFor(origin).find(c => c.key === carClass)?.label}`,
            form.memo.trim(),
          ].filter(Boolean).join('\n'),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? '접수에 실패했습니다.');
      }
      setDone({ amount });
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
            입금자명은 신청하신 성함으로 보내주시면 확인이 빠릅니다.
          </p>

          {/* 비회원도 접수가 되는데, 그러면 고객은 문자만 기다리고 끝난다.
              bookings엔 userId가 없어서 "접수한 번호 = 가입한 번호"일 때만 마이페이지에
              붙으므로, 그 조건을 여기서 분명히 알려준다. */}
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 text-left mb-5">
            <p className="text-xs font-black text-violet-700 mb-1">진행상황을 직접 보시려면</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              방금 적으신 번호(<strong>{form.contact}</strong>)로 가입하시면 마이페이지에서
              배정·진행상황과 리포트를 바로 보실 수 있습니다. 검차가 끝난 뒤 이 차를 팔고
              싶으실 때 출품도 거기서 하실 수 있습니다.
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
      <section className="bg-gradient-to-br from-violet-50 via-white to-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug mb-3">검차 신청</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            전문 진단평가사가 차량이 있는 곳으로 직접 방문해 상태를 확인하고 리포트를 드립니다.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 space-y-8">
        {/* 검차 종류 */}
        <section>
          <h2 className="text-sm font-black text-slate-900 mb-1">어떤 검차가 필요하신가요?</h2>
          <p className="text-xs text-slate-400 mb-4">고객님이 현장에 같이 가시는지에 따라 나뉩니다. 금액은 같습니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INSPECTION_TYPES.map(t => {
              const on = type === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`text-left rounded-2xl border p-5 transition-colors ${
                    on ? 'border-violet-400 bg-violet-50/40' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`text-base font-black mb-1 ${on ? 'text-violet-700' : 'text-slate-900'}`}>{t.label}</p>
                  <p className="text-xs font-bold text-slate-500 mb-2">{t.tagline}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{t.desc}</p>
                  <ul className="space-y-1">
                    {t.points.map(p => (
                      <li key={p} className="flex items-start gap-1.5 text-[11px] text-slate-500">
                        <span className="text-violet-400 shrink-0">✓</span>
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        {/* 차급 → 금액 */}
        <section>
          <h2 className="text-sm font-black text-slate-900 mb-1">차급을 선택해주세요</h2>
          {/* ⚠ 딜러 출장검차(/dealer-inspection)로 가는 링크를 여기 걸지 말 것 —
              그쪽은 딜러 전용 요금표라 일반 고객에게 보이면 안 된다(2026-11-25 유저 지시). */}
          <p className="text-xs text-slate-400 mb-4">차급에 따라 금액이 달라집니다. 거리에 따른 추가 요금은 없습니다.</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {([['DOMESTIC', '국산차'], ['IMPORTED', '수입차']] as [CarOrigin, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setOrigin(key)}
                className={`py-3 rounded-xl border text-sm font-bold transition-colors ${
                  origin === key ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {classesFor(origin).map(c => {
              const price = priceFor(origin, c.key)!;
              const on = carClass === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCarClass(c.key)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
                    on ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-left">
                    <span className={`block text-sm font-black ${on ? 'text-violet-700' : 'text-slate-800'}`}>{c.label}</span>
                    {c.hint && <span className="block text-[11px] text-slate-400 mt-0.5">{c.hint}</span>}
                  </span>
                  <span className={`text-sm font-black shrink-0 ${on ? 'text-violet-700' : 'text-slate-600'}`}>
                    {won(price)}
                  </span>
                </button>
              );
            })}
          </div>
          {origin === 'DOMESTIC' && (
            <p className="text-[11px] text-slate-400 mt-2">
              국산 스포츠카·슈퍼카는 수입차 기준으로 안내드립니다. 문의 주세요.
            </p>
          )}
        </section>

        {/* 신청 정보 */}
        <section className="rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="성함" required>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="홍길동" className={inputCls} />
            </Field>
            <Field label="연락처" required>
              <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="01012345678" inputMode="numeric" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="차량번호" hint="모르시면 비워두세요">
              <input value={form.carNumber} onChange={e => setForm({ ...form, carNumber: e.target.value.replace(/\s/g, '') })} placeholder="12가3456" className={inputCls} />
            </Field>
            <Field label="차량명" hint="선택">
              <input value={form.carModel} onChange={e => setForm({ ...form, carModel: e.target.value })} placeholder="그랜저 IG 2.4" className={inputCls} />
            </Field>
          </div>

          <Field label="차량이 있는 주소" required>
            <div className="flex gap-2">
              <input value={form.address} readOnly onClick={openPostcode} placeholder="주소 검색을 눌러주세요" className={`${inputCls} cursor-pointer bg-slate-50`} />
              <button type="button" onClick={openPostcode} className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 rounded-xl">
                주소 검색
              </button>
            </div>
            <input value={form.addressDetail} onChange={e => setForm({ ...form, addressDetail: e.target.value })} placeholder="상세 주소 (동/호, 주차 위치 등)" className={`${inputCls} mt-2`} />
          </Field>

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
                  <span className={`text-lg font-black ${date === d.full ? 'text-violet-700' : 'text-slate-700'}`}>{d.dateNum}</span>
                </button>
              ))}
            </div>

            <label className="block text-xs font-black text-slate-500 mt-4 mb-2">
              희망 방문 시간 <span className="text-violet-500">*</span>
              {/* 날짜를 안 고르면 시간 버튼이 전부 흐려지는데, 이유를 안 적으면
                  "전부 마감"으로 읽고 그 자리에서 나간다. */}
              {!date && <span className="font-bold text-slate-400 ml-1.5">— 날짜를 먼저 선택해 주세요</span>}
              {date && !form.address && <span className="font-bold text-slate-400 ml-1.5">— 주소를 넣으면 가능한 시간만 남습니다</span>}
            </label>

            {loadingSlots && <p className="text-xs text-slate-400 mb-2">방문 가능한 평가사를 확인하는 중…</p>}

            {/* ① 담당 평가사가 아예 없는 지역 — 날짜를 바꿔도 소용없으니 상담으로 넘긴다 */}
            {!loadingSlots && regionCovered === false && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-black text-rose-700 mb-1">이 지역은 아직 방문 가능한 평가사가 없습니다</p>
                <p className="text-[11px] text-rose-600 leading-relaxed mb-3">
                  날짜를 바꿔도 바로 배정이 어렵습니다. 상담으로 남겨주시면 가까운 평가사를 찾아 연락드리겠습니다.
                </p>
                {consultSent ? (
                  <p className="text-xs font-black text-rose-700">상담이 접수되었습니다. 곧 연락드리겠습니다.</p>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={sendConsult}
                      disabled={consultSending}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-black py-2.5 rounded-lg transition-colors"
                    >
                      {consultSending ? '접수 중…' : '상담으로 신청하기'}
                    </button>
                    <a
                      href="tel:07041382017"
                      className="shrink-0 border border-rose-300 text-rose-700 text-xs font-black px-4 py-2.5 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      전화
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ② 담당자는 있는데 그 날짜가 전부 찬 경우 — 먼저 다른 날짜를 권하고, 그래도 안 되면 상담 */}
            {!loadingSlots && regionCovered !== false && slotMap && Object.values(slotMap).every(v => !v) && (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-black text-amber-700 mb-1">이 날짜는 방문 가능한 평가사가 없습니다</p>
                <p className="text-[11px] text-amber-700/80 leading-relaxed mb-3">
                  다른 날짜를 선택해 주세요. 날짜를 바꾸기 어려우시면 상담으로 남겨주시면 일정을 조율해 드립니다.
                </p>
                {consultSent ? (
                  <p className="text-xs font-black text-amber-700">상담이 접수되었습니다. 곧 연락드리겠습니다.</p>
                ) : (
                  <button
                    type="button"
                    onClick={sendConsult}
                    disabled={consultSending}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white text-xs font-black py-2.5 rounded-lg transition-colors"
                  >
                    {consultSending ? '접수 중…' : '상담으로 신청하기'}
                  </button>
                )}
              </div>
            )}

            {/* ③ 가능할 때 — 빈 시간표만 보여주는 것보다 "몇 명이 뛰고 있다"가 훨씬 믿음이 간다 */}
            {!loadingSlots && regionCovered && areaDrivers.length > 0 && (
              <p className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
                이 지역에서 활동 중인 평가사 {areaDrivers.length}명 — 아래 선택 가능한 시간에 방문할 수 있습니다.
              </p>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TIME_SLOTS.map(t => {
                // 서버가 안 돌려주는 시간(17:30·18:00)은 "불가"가 아니라 "확인 안 됨"이라 열어둔다 —
                // 평가사 일정에 따라 조정될 수 있다는 안내가 폼 아래에 이미 있다.
                const slotClosed = !!slotMap && slotMap[t] === false;
                const disabled = !date || loadingSlots || slotClosed || regionCovered === false;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={disabled}
                    onClick={() => setTime(t)}
                    className={`py-2.5 rounded-lg border text-xs font-bold transition-colors ${
                      disabled ? 'opacity-30 border-slate-200'
                      : time === t ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="매물 링크" hint="선택 — 엔카 매물이면 기록부를 미리 확인합니다">
            <input value={form.listingUrl} onChange={e => setForm({ ...form, listingUrl: e.target.value })} placeholder="https://" className={inputCls} />
          </Field>

          <Field label="요청사항" hint="선택">
            <textarea value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} rows={2} placeholder="하부 위주로 봐주세요 / 판매자 연락처는 010-0000-0000" className={`${inputCls} resize-none`} />
          </Field>
        </section>

        {/* 금액 + 계좌 */}
        <section className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black text-slate-700">
              {typeInfo.label} · {origin === 'DOMESTIC' ? '국산' : '수입'}
              {carClass && ` ${classesFor(origin).find(c => c.key === carClass)?.label}`}
            </span>
            <span className="text-xl font-black text-violet-600">
              {amount ? won(amount) : '차급 선택 필요'}
            </span>
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
            <p className="text-xs font-black text-violet-700 mb-1.5">입금 계좌 (계좌이체만 가능)</p>
            <p className="text-sm font-black text-slate-900">{BANK_INFO.bank} {BANK_INFO.number}</p>
            <p className="text-xs text-slate-500 mt-0.5">예금주 {BANK_INFO.holder}</p>
            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
              카드·간편결제는 결제대행 전환 작업으로 잠시 중단되었습니다.
              접수 후 위 계좌로 입금해주시면, 확인 뒤 평가사가 배정됩니다.
            </p>
          </div>

          {/* 개인정보 동의 — 동의 전에는 신청 버튼을 못 누르게 막는다 */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="privacy-agree"
                checked={privacyAgreed}
                onChange={e => setPrivacyAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer shrink-0"
              />
              <label htmlFor="privacy-agree" className="text-[11px] leading-relaxed text-slate-500 cursor-pointer select-none">
                <span className="font-black text-slate-900">[필수] </span>
                개인정보 수집 및 이용에 동의합니다. 접수하신 연락처·주소는 평가사 배정과 방문 일정 안내에만 사용됩니다.{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="font-bold underline underline-offset-2 text-slate-600 hover:text-slate-900"
                >
                  내용 보기
                </button>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting || !amount || !privacyAgreed}
            className="w-full mt-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-xl text-sm transition-colors"
          >
            {submitting ? '접수 중…'
              : !amount ? '차급을 선택해주세요'
              : !privacyAgreed ? '개인정보 수집 동의가 필요합니다'
              : `${typeInfo.label} 신청하기 (${won(amount)})`}
          </button>
        </section>

        <p className="text-[11px] text-slate-400 leading-relaxed text-center">
          평가사 일정에 따라 희망 시간이 조정될 수 있습니다. 주말·야간 할증은 없습니다.
        </p>
      </div>

      {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
    </main>
  );
}

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

export default function InspectionPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <InspectionInner />
    </Suspense>
  );
}
