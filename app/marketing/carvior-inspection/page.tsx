'use client';

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import AppFooter from '@/components/footermodal';
import PrivacyModal from '@/components/PrivacyModal';

// 토스 결제 심사 완료 후 아래 주석 해제
// const TOSS_CLIENT_KEY = 'test_ck_d46qopOB89x1jxbPMddLrZmM75y0';
// const INSPECTION_PRICE = 99_000;

// ─────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────
const CHECK_ITEMS = [
    { category: '외관', items: ['패널 변형', '도장 상태', '녹/부식', '유리 상태'] },
    { category: '엔진룸', items: ['오일 누유', '냉각수', '배터리', '벨트 상태'] },
    { category: '하체', items: ['하부 부식', '서스펜션', '배기계', '구동축'] },
    { category: '전기/전자', items: ['에어백', '계기판', '편의장치', 'OBD 진단'] },
];

const STEPS = [
    { num: '01', title: '평가 예약 & 결제', desc: '차량 정보와 방문 일정을 입력하고 간편 결제 (99,000원)', icon: '💳' },
    { num: '02', title: '진단 평가사 방문', desc: '카비어 진단 평가사가 직접 찾아가 100+ 항목을 꼼꼼히 평가합니다', icon: '🔍' },
    { num: '03', title: '공식 평가 리포트 발행', desc: '객관적 데이터 기반의 차량 가치 리포트를 즉시 발행합니다', icon: '📄' },
    { num: '04', title: '딜러 매칭 & 최고가 제시', desc: '검증된 딜러 네트워크에서 리포트를 보고 경쟁적으로 최고가를 제시합니다', icon: '🤝' },
    { num: '05', title: '당일 계약 & 대금 지급', desc: '선택한 딜러와 당일 계약 후 즉시 대금을 수령하세요', icon: '✅' },
];

const REVIEWS = [
    {
        name: '이*현', car: '링컨 에비에이터', stars: 5,
        text: '9만9천원이 아깝지 않았어요. 리포트 덕분에 딜러들이 경쟁해서 예상보다 200만원 더 받았습니다.',
        img: '/images/review-1.jpg',
    },
    {
        name: '최*수', car: '미니', stars: 5,
        text: '직접 여러 곳 발품 팔던 것보다 훨씬 편했어요. 리포트 하나로 협상이 끝났습니다.',
        img: '/images/review-2.jpg',
    },
    {
        name: '박*진', car: '콜로라도', stars: 5,
        text: '평가사분이 꼼꼼히 봐주셔서 신뢰가 갔어요. 딜러도 리포트 보고 바로 최고가 불러줬습니다.',
        img: '/images/review-3.jpg',
    },
];

const STATS = [
    { value: '100+', label: '평가 항목' },
    { value: '1,800+', label: '월 평가 완료' },
    { value: '98%', label: '고객 만족도' },
    { value: '24h', label: '리포트 발행' },
];

// ─────────────────────────────────────────
// 날짜/시간 선택기 (simple-request 동일 방식)
// ─────────────────────────────────────────
function DateTimeSelector({ onSelect, light = false }: {
    onSelect: (date: string, time: string) => void;
    light?: boolean;
}) {
    const [selDate, setSelDate] = useState('');
    const [selTime, setSelTime] = useState('');

    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            day: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
            num: d.getDate(),
            isWeekend: d.getDay() === 0 || d.getDay() === 6,
        };
    });

    const times = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

    useEffect(() => {
        if (selDate && selTime) onSelect(selDate, selTime);
    }, [selDate, selTime, onSelect]);

    const labelClass = clsx('text-[11px] font-bold mb-3 block uppercase tracking-widest', light ? 'text-zinc-500' : 'text-zinc-400');

    return (
        <div className="space-y-5">
            <div>
                <label className={labelClass}>방문 날짜</label>
                <div className="flex gap-2 pb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {dates.map(d => (
                        <button
                            key={d.full} type="button" onClick={() => setSelDate(d.full)}
                            className={clsx(
                                'flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center transition-all border text-center',
                                selDate === d.full
                                    ? 'bg-zinc-900 border-zinc-900 shadow-lg scale-105'
                                    : light
                                    ? 'bg-white/10 border-white/10'
                                    : 'bg-white border-zinc-100'
                            )}
                        >
                            <span className={clsx('text-[9px] mb-0.5', selDate === d.full ? 'text-zinc-400' : light ? 'text-zinc-500' : 'text-slate-400')}>
                                {d.day}
                            </span>
                            <span className={clsx('text-base font-bold leading-none',
                                selDate === d.full ? 'text-white' : d.isWeekend ? 'text-red-400' : light ? 'text-white' : 'text-zinc-800'
                            )}>
                                {d.num}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className={labelClass}>방문 시간</label>
                <div className="grid grid-cols-3 gap-2">
                    {times.map(t => (
                        <button
                            key={t} type="button"
                            disabled={!selDate}
                            onClick={() => setSelTime(t)}
                            className={clsx(
                                'py-2.5 rounded-xl text-sm font-bold border transition-all',
                                !selDate && 'opacity-20',
                                selTime === t
                                    ? 'bg-zinc-900 border-zinc-900 text-white'
                                    : light
                                    ? 'bg-white/10 border-white/10 text-white'
                                    : 'bg-white border-zinc-100 text-zinc-600'
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// 전화번호 입력
// ─────────────────────────────────────────
function PhoneInput({ value, onChange, light = false }: { value: string; onChange: (v: string) => void; light?: boolean }) {
    const format = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
        let out = raw;
        if (raw.length > 3 && raw.length <= 7) out = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        else if (raw.length > 7) out = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
        onChange(out);
    };
    return (
        <input
            type="tel" inputMode="numeric" value={value} onChange={format}
            placeholder="010-0000-0000"
            className={clsx(
                'w-full p-3 outline-none transition-all text-base font-bold border-b-2',
                light
                    ? 'border-zinc-700 bg-transparent text-white placeholder:text-zinc-600 focus:border-white'
                    : 'border-zinc-200 bg-transparent text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900'
            )}
        />
    );
}

// ─────────────────────────────────────────
// 계좌이체 안내 모달
// ─────────────────────────────────────────
function BankTransferModal({ onClose }: { onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    const copyAccount = () => {
        navigator.clipboard.writeText('333335197303').then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
                {/* 상단 헤더 */}
                <div className="bg-zinc-900 px-6 py-5 text-center">
                    <p className="text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">예약 접수 완료</p>
                    <p className="text-white text-xl font-black">계좌 이체 안내</p>
                </div>

                <div className="px-6 py-6 space-y-5">
                    {/* 금액 */}
                    <div className="flex items-center justify-between bg-zinc-50 rounded-2xl px-4 py-3.5 border border-zinc-100">
                        <p className="text-zinc-500 text-sm font-bold">입금 금액</p>
                        <p className="text-zinc-900 text-2xl font-black tabular-nums">99,000<span className="text-sm font-bold">원</span></p>
                    </div>

                    {/* 계좌 정보 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <p className="text-zinc-400 text-xs font-bold">은행</p>
                            <p className="text-zinc-900 text-sm font-extrabold">카카오뱅크</p>
                        </div>
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <p className="text-zinc-400 text-xs font-bold">계좌번호</p>
                            <div className="flex items-center gap-2">
                                <p className="text-zinc-900 text-sm font-extrabold tabular-nums">3333-35-1997303</p>
                                <button
                                    type="button"
                                    onClick={copyAccount}
                                    className="text-[10px] font-extrabold bg-zinc-900 text-white px-2.5 py-1 rounded-lg active:scale-95 transition-all"
                                >
                                    {copied ? '복사됨 ✓' : '복사'}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pb-1">
                            <p className="text-zinc-400 text-xs font-bold">예금주</p>
                            <p className="text-zinc-900 text-sm font-extrabold">카비어 (조재혁)</p>
                        </div>
                    </div>

                    {/* 안내 문구 */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs text-amber-700 leading-relaxed">
                        입금 후 <span className="font-extrabold">010-2285-6017</span>로 문자 또는 전화 주시면 담당 평가사가 배정됩니다.
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-4 bg-zinc-900 text-white font-extrabold rounded-2xl active:scale-[0.98] transition-all"
                    >
                        확인했어요
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// 결제 신청 폼
// ─────────────────────────────────────────
function InspectionForm({ light = false, formId }: { light?: boolean; formId?: string }) {
    const [vehicleCategory, setVehicleCategory] = useState('');
    const [carType, setCarType] = useState('');
    const [phone, setPhone] = useState('');
    const [desiredPrice, setDesiredPrice] = useState('');
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [preferredDateTime, setPreferredDateTime] = useState('');
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [paying, setPaying] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);

    const labelClass = clsx(
        'text-[11px] font-bold mb-1 block uppercase tracking-widest',
        light ? 'text-zinc-500' : 'text-zinc-400'
    );
    const inputClass = clsx(
        'w-full p-3 outline-none transition-all text-base border-b-2',
        light
            ? 'border-zinc-700 bg-transparent text-white placeholder:text-zinc-600 focus:border-white'
            : 'border-zinc-200 bg-transparent text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900'
    );

    const handleDateTimeSelect = useCallback((date: string, time: string) => {
        setPreferredDateTime(`${date} ${time}`);
    }, []);

    const handleAddressSearch = () => {
        if ((window as any).daum?.Postcode) {
            new (window as any).daum.Postcode({
                oncomplete: (data: any) => {
                    let full = data.address;
                    if (data.addressType === 'R') {
                        let extra = '';
                        if (data.bname) extra += data.bname;
                        if (data.buildingName) extra += extra ? `, ${data.buildingName}` : data.buildingName;
                        if (extra) full += ` (${extra})`;
                    }
                    setAddress(full);
                    document.getElementById('inspection-detail-address')?.focus();
                },
            }).open();
        } else {
            alert('주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paying) return;
        const rawPhone = phone.replace(/-/g, '');
        if (rawPhone.length < 10) { alert('연락처를 올바르게 입력해주세요.'); return; }
        if (!vehicleCategory) { alert('차량 구분을 선택해주세요.'); return; }
        if (!carType.trim()) { alert('차종을 입력해주세요.'); return; }
        if (!preferredDateTime) { alert('방문 날짜와 시간을 선택해주세요.'); return; }
        if (!address) { alert('방문 장소 주소를 입력해주세요.'); return; }
        if (!privacyAgreed) { alert('개인정보 수집·이용에 동의해주세요.'); return; }

        setPaying(true);
        try {
            await fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carNumber: `[${vehicleCategory}] ${carType}`,
                    contact: rawPhone,
                    desiredPrice: desiredPrice ? `${desiredPrice}만원` : '',
                    address,
                    detailAddress,
                    preferredDateTime,
                    source: 'CARVIOR_INSPECTION',
                    additionalMemo: '계좌이체 대기',
                    privacyAgreed,
                }),
            });
            setShowBankModal(true);
        } catch {
            alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setPaying(false);
        }
    };

    return (
        <>
        {showBankModal && <BankTransferModal onClose={() => setShowBankModal(false)} />}
        {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
        <form id={formId} onSubmit={handlePay} className="space-y-6">

            {/* 차량 구분 */}
            <div>
                <label className={labelClass}>차량 구분</label>
                <select
                    required
                    value={vehicleCategory}
                    onChange={e => setVehicleCategory(e.target.value)}
                    className={clsx(inputClass, light ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900')}
                >
                    <option value="" disabled style={{ background: light ? '#18181b' : '#fff', color: light ? '#a1a1aa' : '#71717a' }}>선택해주세요</option>
                    <option value="승용차" style={{ background: light ? '#18181b' : '#fff', color: light ? '#fff' : '#18181b' }}>승용차</option>
                    <option value="포터·봉고" style={{ background: light ? '#18181b' : '#fff', color: light ? '#fff' : '#18181b' }}>포터·봉고 (화물)</option>
                </select>
            </div>

            {/* 차종 */}
            <div>
                <label className={labelClass}>차종</label>
                <input
                    required value={carType} onChange={e => setCarType(e.target.value)}
                    placeholder={vehicleCategory === '포터·봉고' ? '예: 현대 포터2, 기아 봉고3 등' : '예: 현대 그랜저, 기아 K5 등'}
                    className={inputClass}
                />
            </div>

            {/* 연락처 */}
            <div>
                <label className={labelClass}>연락처</label>
                <PhoneInput value={phone} onChange={setPhone} light={light} />
            </div>

            {/* 희망 판매가 */}
            <div>
                <label className={labelClass}>희망 판매가 (선택)</label>
                <div className="relative">
                    <input
                        type="number"
                        value={desiredPrice}
                        onChange={e => setDesiredPrice(e.target.value)}
                        placeholder="예: 1500"
                        min="0"
                        className={clsx(inputClass, 'pr-12')}
                    />
                    <span className={clsx('absolute right-3 bottom-3 text-sm font-bold', light ? 'text-zinc-500' : 'text-zinc-400')}>
                        만원
                    </span>
                </div>
                <p className={clsx('text-[10px] mt-1.5', light ? 'text-zinc-600' : 'text-zinc-400')}>
                    희망 금액을 알면 딜러 매칭 시 기대에 맞는 제안을 드릴 수 있어요
                </p>
            </div>

            {/* 구분선 */}
            <div className={clsx('border-t', light ? 'border-white/10' : 'border-zinc-100')} />

            {/* 방문 날짜/시간 */}
            <DateTimeSelector onSelect={handleDateTimeSelect} light={light} />

            {/* 방문 장소 */}
            <div className="space-y-3">
                <label className={labelClass}>방문 장소</label>
                <div className="flex gap-2">
                    <input
                        readOnly required
                        value={address}
                        placeholder="주소 검색"
                        onClick={handleAddressSearch}
                        className={clsx(inputClass, 'flex-1 cursor-pointer')}
                    />
                    <button
                        type="button"
                        onClick={handleAddressSearch}
                        className={clsx(
                            'flex-shrink-0 px-4 rounded-xl text-xs font-extrabold transition-all active:scale-95',
                            light ? 'bg-white/10 text-white border border-white/20' : 'bg-zinc-900 text-white'
                        )}
                    >
                        검색
                    </button>
                </div>
                <input
                    id="inspection-detail-address"
                    value={detailAddress}
                    onChange={e => setDetailAddress(e.target.value)}
                    placeholder="상세주소 (동/호수, 층 등)"
                    className={inputClass}
                />
            </div>

            {/* 구분선 */}
            <div className={clsx('border-t', light ? 'border-white/10' : 'border-zinc-100')} />

            {/* 가격 요약 */}
            <div className={clsx(
                'rounded-2xl p-4 flex items-center justify-between',
                light ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-100'
            )}>
                <div>
                    <p className={clsx('text-xs font-bold', light ? 'text-zinc-400' : 'text-zinc-500')}>전문 평가 비용</p>
                    <p className={clsx('text-[10px] mt-0.5', light ? 'text-zinc-600' : 'text-zinc-400')}>100+ 항목 · 방문 평가 · 리포트 포함</p>
                </div>
                <p className={clsx('text-2xl font-black tabular-nums', light ? 'text-white' : 'text-zinc-900')}>
                    99,000<span className="text-sm font-bold">원</span>
                </p>
            </div>

            {/* 개인정보 동의 */}
            <label className="flex items-start gap-3 cursor-pointer group">
                <div
                    onClick={() => setPrivacyAgreed(v => !v)}
                    className={clsx(
                        'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5',
                        privacyAgreed
                            ? 'bg-zinc-900 border-zinc-900'
                            : light ? 'border-zinc-600 bg-transparent' : 'border-zinc-300 bg-transparent'
                    )}
                >
                    {privacyAgreed && <span className="text-white text-[11px] font-black leading-none">✓</span>}
                </div>
                <p className={clsx('text-xs leading-relaxed', light ? 'text-zinc-400' : 'text-zinc-500')}>
                    <span className="font-extrabold text-red-400">필수</span>{' '}
                    <span
                        className={clsx('underline underline-offset-2 cursor-pointer', light ? 'text-zinc-300' : 'text-zinc-700')}
                        onClick={e => { e.stopPropagation(); setShowPrivacyModal(true); }}
                    >
                        개인정보 수집·이용
                    </span>에 동의합니다.{' '}
                    <span className={clsx(light ? 'text-zinc-600' : 'text-zinc-400')}>
                        (차량번호, 연락처, 주소를 평가 서비스 제공 목적으로 수집하며 완료 후 1년 보관합니다.)
                    </span>
                </p>
            </label>

            <button
                type="submit" disabled={paying || !privacyAgreed}
                className={clsx(
                    'w-full py-4 rounded-2xl font-extrabold text-base tracking-wide transition-all flex items-center justify-center gap-2',
                    (paying || !privacyAgreed)
                        ? 'bg-zinc-300 text-zinc-400 cursor-not-allowed'
                        : light
                        ? 'bg-white text-zinc-900 hover:bg-zinc-100 active:scale-[0.98] shadow-xl'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] shadow-lg'
                )}
            >
                {paying ? '처리 중...' : '결제하고 평가 예약하기 →'}
            </button>
            <p className={clsx('text-center text-[11px]', light ? 'text-zinc-600' : 'text-zinc-400')}>
                카카오뱅크 계좌이체로 진행됩니다
            </p>
        </form>
        </>
    );
}

// ─────────────────────────────────────────
// 결제 완료 후 처리
// Toss 리다이렉트: ?payment=success&paymentKey=xxx&orderId=yyy&amount=80000
// ─────────────────────────────────────────
function PaymentResultHandler({ onSuccess }: { onSuccess: () => void }) {
    const searchParams = useSearchParams();
    const payment    = searchParams.get('payment');
    const paymentKey = searchParams.get('paymentKey');   // Toss가 보내주는 결제 키
    const tossOrderId = searchParams.get('orderId');     // Toss가 보내주는 주문 ID
    const processed  = useRef(false);

    useEffect(() => {
        if (processed.current) return;

        if (payment === 'success' && paymentKey && tossOrderId) {
            processed.current = true;
            window.history.replaceState({}, '', window.location.pathname);

            // sessionStorage에서 차량 정보 복원 (orderId로 매핑 확인)
            const raw = sessionStorage.getItem('carvior_pending');
            const pending = raw ? JSON.parse(raw) : null;

            // orderId가 일치하거나 sessionStorage가 없어도 paymentKey는 남김
            const carType           = pending?.carType           ?? '';
            const phone             = pending?.phone             ?? '';
            const desiredPrice      = pending?.desiredPrice      ?? '';
            const address           = pending?.address           ?? '';
            const detailAddress     = pending?.detailAddress     ?? '';
            const preferredDateTime = pending?.preferredDateTime ?? '';

            fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carOwner:        '',
                    carNumber:       carType,
                    contact:         phone,
                    desiredPrice:    desiredPrice ? `${desiredPrice}만원` : '',
                    address,
                    detailAddress,
                    preferredDateTime,
                    source:          'CARVIOR_INSPECTION',
                    additionalMemo:  `paymentKey:${paymentKey} / orderId:${tossOrderId}`,
                }),
            }).catch(console.error);

            sessionStorage.removeItem('carvior_pending');
            onSuccess();
        }

        if (payment === 'fail') {
            window.history.replaceState({}, '', window.location.pathname);
            alert('결제가 취소되었거나 실패했습니다.\n다시 시도해주세요.');
        }
    }, [payment, paymentKey, tossOrderId, onSuccess]);

    return null;
}

// ─────────────────────────────────────────
// 결제 성공 배너
// ─────────────────────────────────────────
function SuccessBanner({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center px-8 text-center">
            <div className="mb-6 text-6xl">🎉</div>
            <p className="mb-3 text-2xl font-black text-white">결제 완료!</p>
            <p className="mb-8 text-sm leading-relaxed text-zinc-400">
                평가 예약이 완료되었습니다.<br />
                담당 평가사가 <span className="font-bold text-white">24시간 내</span> 일정을 안내드리겠습니다.
            </p>
            <button
                onClick={onClose}
                className="px-8 py-4 text-base font-extrabold transition-all bg-white text-zinc-900 rounded-2xl active:scale-95"
            >
                확인
            </button>
        </div>
    );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
export default function CarviorInspectionPage() {
    const [scrolled, setScrolled] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const formRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 100);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="min-h-screen font-sans antialiased bg-white">

            {/* 결제 결과 처리 (useSearchParams → Suspense 필요) */}
            <Suspense fallback={null}>
                <PaymentResultHandler onSuccess={() => setPaymentDone(true)} />
            </Suspense>

            {paymentDone && <SuccessBanner onClose={() => setPaymentDone(false)} />}

            {/* ── HERO ── */}
            <section className="relative overflow-hidden text-white bg-zinc-950">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-white/5 rounded-full blur-3xl" />

                <div className="relative max-w-xl px-6 pb-0 mx-auto pt-14">
                    <div className="flex flex-wrap gap-2 mb-6">
                        <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 bg-white/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-bold tracking-wider text-zinc-400">EVALUATE · MATCH · SELL</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 border border-blue-400/30 rounded-full px-3 py-1.5 bg-blue-500/10">
                            <span className="text-xs text-blue-400">📍</span>
                            <span className="text-xs font-bold text-blue-300">서울 · 경기 · 인천 운영 중</span>
                        </div>
                    </div>

                    <h1 className="text-[2.4rem] font-black leading-[1.15] mb-5 tracking-tight">
                        평가사가 직접 가고<br />
                        딜러가 경쟁합니다
                    </h1>
                    <p className="mb-3 text-sm leading-relaxed text-zinc-400">
                        100+ 항목 전문 평가 → 공식 가치 리포트 발행<br />
                        검증된 딜러 네트워크에서 <span className="font-bold text-white">최고가를 제시</span>합니다.
                    </p>
                    <p className="mb-8 text-xs text-zinc-500">
                        9만9천원으로 수십~수백만원을 더 받아가세요.
                    </p>

                    <button
                        onClick={scrollToForm}
                        className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-extrabold text-lg shadow-2xl shadow-black/40 active:scale-[0.98] transition-all mb-4"
                    >
                        평가 예약하기 (99,000원) →
                    </button>
                    <p className="mb-10 text-xs text-center text-zinc-600">
                        방문 평가 · 리포트 포함 · 카드/간편결제 가능
                    </p>

                    <div className="grid grid-cols-4 pt-6 pb-8 border-t border-white/10">
                        {STATS.map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-xl font-black leading-none text-white tabular-nums">{s.value}</p>
                                <p className="text-zinc-600 text-[10px] mt-1.5 leading-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 히어로 이미지 (경로: /images/inspection-hero.jpg) */}
                <div className="w-full h-56 overflow-hidden bg-zinc-800">
                    <img src="/images/inspection-hero.jpg" alt="카비어 인스펙션 현장" className="object-fill w-full h-full opacity-40" />
                </div>
            </section>

            {/* ── 신뢰 뱃지 바 ── */}
            <section className="px-5 py-4 bg-zinc-100">
                <div className="flex flex-wrap items-center justify-center max-w-xl gap-5 mx-auto">
                    {['수도권 진단 평가사', '방문 평가', '당일 리포트', '딜러 직접 경쟁', '카드/간편결제'].map(t => (
                        <div key={t} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px]">✓</span>
                            {t}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 가치 제안 ── */}
            <section className="px-6 bg-white py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">WHY CARVIOR</p>
                    <h2 className="mb-3 text-2xl font-black leading-tight text-center text-zinc-900">
                        9만9천원이 왜 이득인가요?
                    </h2>
                    <p className="mb-8 text-sm text-center text-zinc-400">
                        감가 없이 리포트로 증명하면, 딜러가 먼저 최고가를 씁니다
                    </p>
                    <div className="space-y-3">
                        {[
                            { icon: '📊', title: '데이터로 협상력 UP', desc: '객관적인 평가 리포트가 있으면 딜러 감가 주장을 원천 차단할 수 있습니다.' },
                            { icon: '🏆', title: '딜러 간 경쟁 입찰', desc: '여러 딜러가 리포트를 보고 경쟁적으로 최고가를 제시합니다.' },
                            { icon: '⚡', title: '빠른 판매 마감', desc: '리포트가 있으면 협의 없이 빠르게 계약이 마무리됩니다.' },
                            { icon: '🔒', title: '토스 안전 결제', desc: '결제는 토스페이먼츠로 안전하게 처리됩니다. 영수증 자동 발급.' },
                        ].map(item => (
                            <div key={item.title} className="flex items-start gap-4 p-5 border rounded-2xl bg-zinc-50 border-zinc-100">
                                <div className="flex items-center justify-center flex-shrink-0 text-xl w-11 h-11 bg-zinc-900 rounded-xl">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-extrabold text-zinc-900 text-sm mb-0.5">{item.title}</p>
                                    <p className="text-xs leading-relaxed text-zinc-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 중간 CTA 배너 ── */}
            <section className="px-6 py-10 bg-zinc-950">
                <div className="max-w-xl mx-auto space-y-4 text-center">
                    <p className="text-sm font-bold tracking-wider uppercase text-zinc-500">데이터로 증명된 차량 가치</p>
                    <p className="text-2xl font-black leading-tight text-white">
                        리포트 하나로<br />딜러가 먼저 연락합니다
                    </p>
                    <button
                        onClick={scrollToForm}
                        className="px-10 py-4 text-base font-extrabold transition-all bg-white shadow-xl text-zinc-900 rounded-2xl active:scale-95"
                    >
                        99,000원으로 시작하기 →
                    </button>
                </div>
            </section>

            {/* ── 검사 항목 ── */}
            <section className="px-6 bg-white py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">EVALUATION</p>
                    <h2 className="mb-2 text-2xl font-black leading-tight text-center text-zinc-900">100+ 항목 정밀 평가</h2>
                    <p className="mb-8 text-sm text-center text-zinc-400">진단 평가사가 직접 방문해 꼼꼼하게 확인합니다</p>

                    {/* 진단장비 이미지 갤러리 (경로: /images/diagnostic-1~3.jpg) */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="relative overflow-hidden h-36 bg-zinc-100 rounded-2xl">
                            <img src="/images/diagnostic-1.jpg" alt="OBD 진단장비" className="object-cover w-full h-full" />
                            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-[10px] font-bold">OBD 정밀 진단</p>
                            </div>
                        </div>
                        <div className="relative overflow-hidden h-36 bg-zinc-100 rounded-2xl">
                            <img src="/images/diagnostic-2.jpg" alt="도장두께 측정기" className="object-cover w-full h-full" />
                            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-[10px] font-bold">도장두께 측정</p>
                            </div>
                        </div>
                        <div className="relative col-span-2 overflow-hidden h-36 bg-zinc-100 rounded-2xl">
                            <img src="/images/diagnostic-3.jpg" alt="하부 검사 현장" className="object-cover w-full h-full" />
                            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-[10px] font-bold">하부 정밀 검사</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {CHECK_ITEMS.map(group => (
                            <div key={group.category} className="p-4 border bg-zinc-50 border-zinc-100 rounded-2xl">
                                <p className="mb-3 text-xs font-extrabold tracking-wider uppercase text-zinc-900">{group.category}</p>
                                <ul className="space-y-1.5">
                                    {group.items.map(item => (
                                        <li key={item} className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 bg-white flex items-center justify-center text-[8px] text-zinc-400 flex-shrink-0">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                    <li className="text-[10px] text-zinc-300 pl-5">외 다수...</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 진행 절차 ── */}
            <section className="px-6 bg-zinc-50 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">PROCESS</p>
                    <h2 className="mb-10 text-2xl font-black leading-tight text-center text-zinc-900">5단계, 이게 전부입니다</h2>
                    <div className="space-y-0">
                        {STEPS.map((step, i) => (
                            <div key={step.num} className="flex gap-5">
                                <div className="flex flex-col items-center">
                                    <div className={clsx(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 flex-shrink-0 z-10',
                                        i === 0 ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-400'
                                    )}>
                                        {step.num}
                                    </div>
                                    {i < STEPS.length - 1 && <div className="flex-1 w-px my-1 bg-zinc-200" style={{ minHeight: '32px' }} />}
                                </div>
                                <div className="pb-8 pt-1.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{step.icon}</span>
                                        <p className={clsx('font-extrabold text-sm', i === 0 ? 'text-zinc-900' : 'text-zinc-700')}>{step.title}</p>
                                    </div>
                                    <p className="text-xs leading-relaxed text-zinc-400">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 고객 후기 ── */}
            <section className="overflow-hidden bg-white py-14">
                <div className="max-w-xl px-6 mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">REVIEWS</p>
                    <h2 className="mb-8 text-2xl font-black text-center text-zinc-900">실제 고객 후기</h2>
                </div>
                <div className="px-6">
                    {/* 가로 슬라이드 캐러셀 */}
                    <div
                        className="flex gap-4 px-6 pb-3 -mx-6 overflow-x-auto"
                        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                    >
                        {REVIEWS.map(r => (
                            <div
                                key={r.name}
                                className="flex flex-col flex-shrink-0 overflow-hidden bg-white border shadow-sm rounded-2xl border-zinc-100"
                                style={{ scrollSnapAlign: 'start', width: 'calc(80vw)', maxWidth: '320px' }}
                            >
                                {/* 후기 사진 (경로: r.img) */}
                                <div className="w-full bg-zinc-100" style={{ aspectRatio: '4/3' }}>
                                    <img
                                        src={r.img}
                                        alt={`${r.name} 후기`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="flex flex-col flex-1 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-extrabold text-zinc-900">{r.name}</p>
                                            <p className="text-xs text-zinc-400">{r.car}</p>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: r.stars }).map((_, i) => (
                                                <span key={i} className="text-sm text-zinc-900">★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="flex-1 text-xs leading-relaxed text-zinc-500">"{r.text}"</p>
                                </div>
                            </div>
                        ))}
                        {/* 마지막 패딩용 빈 공간 */}
                        <div className="flex-shrink-0 w-2" />
                    </div>
                    <p className="text-center text-zinc-400 text-[11px] mt-3">← 스와이프해서 더 보기 →</p>
                </div>
            </section>

            {/* ── 하단 결제 폼 ── */}
            <section ref={formRef} className="px-6 bg-zinc-950 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-2">EVALUATION</p>
                    <h2 className="mb-2 text-2xl font-black leading-tight text-center text-white">평가 예약하기</h2>
                    <p className="mb-6 text-sm text-center text-zinc-500">
                        방문 평가 · 리포트 발행 · 딜러 매칭까지
                    </p>

                    {/* 운영 지역 안내 */}
                    <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-400/20 rounded-2xl px-4 py-3.5 mb-6">
                        <span className="flex-shrink-0 text-lg">📍</span>
                        <div>
                            <p className="text-blue-300 text-xs font-extrabold mb-0.5">현재 운영 지역</p>
                            <p className="text-xs leading-relaxed text-zinc-400">
                                서울 · 경기 · 인천 (수도권) 지역에서 운영 중입니다.<br />
                                타 지역은 순차적으로 확대할 예정이에요.
                            </p>
                        </div>
                    </div>

                    <InspectionForm light />

                    {/* 전화 상담 */}
                    <div className="pt-8 mt-8 border-t border-zinc-800">
                        <p className="mb-3 text-xs text-center text-zinc-600">결제 전 전화 문의</p>
                        <a
                            href="tel:15882285"
                            className="flex items-center justify-center w-full gap-3 py-4 text-lg font-extrabold text-white transition-all border border-zinc-700 rounded-2xl hover:bg-zinc-900 active:scale-95"
                        >
                            <span>📞</span> 010-2285-6017
                        </a>
                        <p className="mt-2 text-xs text-center text-zinc-700">평일 09:00 – 18:00</p>
                    </div>
                </div>
            </section>

            {/* ── 푸터 ── */}
            <AppFooter/>

            {/* ── 플로팅 CTA ── */}
            <div className={clsx(
                'fixed bottom-5 left-0 right-0 px-5 z-50 transition-all duration-300',
                scrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
            )}>
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={scrollToForm}
                        className="w-full py-4 bg-zinc-900 text-white font-extrabold text-base rounded-2xl shadow-2xl shadow-black/50 active:scale-[0.98] transition-all border border-zinc-700"
                    >
                        평가 예약하기 (99,000원) →
                    </button>
                </div>
            </div>

        </div>
    );
}
