'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';

// ─────────────────────────────────────────
// 토스 설정 (클라이언트 키 교체 필요)
// ─────────────────────────────────────────
const TOSS_CLIENT_KEY = 'test_ck_YOUR_TOSS_CLIENT_KEY'; // ← 토스 대시보드에서 발급받은 키로 교체
const INSPECTION_PRICE = 80_000;

function generateOrderId() {
    return 'CARVIOR-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function loadTossScript(): Promise<void> {
    return new Promise((resolve) => {
        if (document.getElementById('toss-sdk')) { resolve(); return; }
        const s = document.createElement('script');
        s.id = 'toss-sdk';
        s.src = 'https://js.tosspayments.com/v1/payment';
        s.onload = () => resolve();
        document.head.appendChild(s);
    });
}

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
    { num: '01', title: '검사 신청 & 결제', desc: '차량 정보 입력 후 토스로 간편 결제 (80,000원)', icon: '💳' },
    { num: '02', title: '전문가 방문 검사', desc: '카비어 인스펙터가 직접 방문해 100+ 항목 정밀 점검', icon: '🔍' },
    { num: '03', title: '검사 리포트 발행', desc: '객관적 데이터 기반 차량 상태 리포트 즉시 제공', icon: '📄' },
    { num: '04', title: '딜러 매칭 & 최고가 제시', desc: '검증된 딜러 네트워크에서 경쟁적으로 최고가 제시', icon: '🤝' },
    { num: '05', title: '당일 계약 & 대금 지급', desc: '선택한 딜러와 당일 계약 후 즉시 대금 수령', icon: '✅' },
];

const REVIEWS = [
    {
        name: '이*현', car: '현대 쏘나타 2019', stars: 5,
        text: '8만원이 아깝지 않았어요. 리포트 덕분에 딜러들이 경쟁해서 예상보다 200만원 더 받았습니다.',
        img: '/images/review-1.jpg',
    },
    {
        name: '최*수', car: '기아 카니발 2018', stars: 5,
        text: '직접 여러 곳 발품 팔던 것보다 훨씬 편했어요. 리포트 하나로 협상이 끝났습니다.',
        img: '/images/review-2.jpg',
    },
    {
        name: '박*진', car: '쌍용 렉스턴 2017', stars: 5,
        text: '인스펙터분이 꼼꼼히 봐주셔서 신뢰가 갔어요. 딜러도 리포트 보고 바로 최고가 불러줬습니다.',
        img: '/images/review-3.jpg',
    },
];

const STATS = [
    { value: '100+', label: '검사 항목' },
    { value: '1,800+', label: '월 검사 완료' },
    { value: '98%', label: '고객 만족도' },
    { value: '24h', label: '리포트 발행' },
];

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
// 결제 신청 폼
// ─────────────────────────────────────────
function InspectionForm({ light = false, formId }: { light?: boolean; formId?: string }) {
    const [carType, setCarType] = useState('');
    const [phone, setPhone] = useState('');
    const [paying, setPaying] = useState(false);

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

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paying) return;
        const rawPhone = phone.replace(/-/g, '');
        if (rawPhone.length < 10) { alert('연락처를 올바르게 입력해주세요.'); return; }
        if (!carType.trim()) { alert('차종을 입력해주세요.'); return; }

        setPaying(true);
        try {
            await loadTossScript();

            const orderId = generateOrderId();
            // 결제 완료 후 API 전송에 필요한 정보를 세션에 저장
            sessionStorage.setItem('carvior_pending', JSON.stringify({ carType, phone: rawPhone, orderId }));

            const tossPayments = (window as any).TossPayments(TOSS_CLIENT_KEY);
            await tossPayments.requestPayment('카드', {
                amount: INSPECTION_PRICE,
                orderId,
                orderName: '카비어 차량 정밀 검사',
                customerMobilePhone: rawPhone,
                successUrl: `${location.origin}/marketing/carvior-inspection?payment=success`,
                failUrl: `${location.origin}/marketing/carvior-inspection?payment=fail`,
            });
        } catch (err: any) {
            if (err?.code !== 'USER_CANCEL') {
                alert(err?.message ?? '결제 중 오류가 발생했습니다.');
            }
        } finally {
            setPaying(false);
        }
    };

    return (
        <form id={formId} onSubmit={handlePay} className="space-y-5">
            <div>
                <label className={labelClass}>차종</label>
                <input
                    required value={carType} onChange={e => setCarType(e.target.value)}
                    placeholder="예: 현대 그랜저, 기아 K5 등"
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>연락처</label>
                <PhoneInput value={phone} onChange={setPhone} light={light} />
            </div>

            {/* 가격 요약 */}
            <div className={clsx(
                'rounded-2xl p-4 flex items-center justify-between',
                light ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-100'
            )}>
                <div>
                    <p className={clsx('text-xs font-bold', light ? 'text-zinc-400' : 'text-zinc-500')}>정밀 검사 비용</p>
                    <p className={clsx('text-[10px] mt-0.5', light ? 'text-zinc-600' : 'text-zinc-400')}>100+ 항목 · 방문 검사 · 리포트 포함</p>
                </div>
                <p className={clsx('text-2xl font-black tabular-nums', light ? 'text-white' : 'text-zinc-900')}>
                    80,000<span className="text-sm font-bold">원</span>
                </p>
            </div>

            <button
                type="submit" disabled={paying}
                className={clsx(
                    'w-full py-4 rounded-2xl font-extrabold text-base tracking-wide transition-all flex items-center justify-center gap-2',
                    paying
                        ? 'bg-zinc-300 text-zinc-400 cursor-not-allowed'
                        : light
                        ? 'bg-white text-zinc-900 hover:bg-zinc-100 active:scale-[0.98] shadow-xl'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] shadow-lg'
                )}
            >
                {paying ? (
                    '처리 중...'
                ) : (
                    <>
                        <span>토스로 결제하고 검사 신청</span>
                        <span className="text-base">→</span>
                    </>
                )}
            </button>
            <p className={clsx('text-center text-[11px]', light ? 'text-zinc-600' : 'text-zinc-400')}>
                카드 · 간편결제(토스/카카오페이/네이버페이) 모두 가능
            </p>
        </form>
    );
}

// ─────────────────────────────────────────
// 결제 완료 후 처리 (쿼리 파라미터 감지)
// ─────────────────────────────────────────
function PaymentResultHandler({ onSuccess }: { onSuccess: () => void }) {
    const searchParams = useSearchParams();
    const payment = searchParams.get('payment');
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;

        if (payment === 'success') {
            processed.current = true;
            const raw = sessionStorage.getItem('carvior_pending');
            if (raw) {
                const { carType, phone, orderId } = JSON.parse(raw);
                fetch('https://carvior.store/api/v1/external/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        carOwner: '',
                        carNumber: carType,
                        contact: phone,
                        source: 'CARVIOR_INSPECTION',
                        memo: `orderId: ${orderId}`,
                    }),
                }).catch(console.error);
                sessionStorage.removeItem('carvior_pending');
            }
            onSuccess();
        }

        if (payment === 'fail') {
            // URL 정리
            window.history.replaceState({}, '', window.location.pathname);
            alert('결제가 취소되었거나 실패했습니다.\n다시 시도해주세요.');
        }
    }, [payment, onSuccess]);

    return null;
}

// ─────────────────────────────────────────
// 결제 성공 배너
// ─────────────────────────────────────────
function SuccessBanner() {
    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center px-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <p className="text-white font-black text-2xl mb-3">결제 완료!</p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                검사 신청이 정상적으로 접수되었습니다.<br />
                전담 인스펙터가 <span className="text-white font-bold">24시간 내</span> 연락드리겠습니다.
            </p>
            <button
                onClick={() => window.history.replaceState({}, '', window.location.pathname)}
                className="bg-white text-zinc-900 font-extrabold px-8 py-4 rounded-2xl text-base"
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
        <div className="min-h-screen bg-white font-sans antialiased">

            {/* 결제 결과 처리 (useSearchParams → Suspense 필요) */}
            <Suspense fallback={null}>
                <PaymentResultHandler onSuccess={() => setPaymentDone(true)} />
            </Suspense>

            {paymentDone && <SuccessBanner />}

            {/* ── HERO ── */}
            <section className="relative bg-zinc-950 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-white/5 rounded-full blur-3xl" />

                <div className="relative max-w-xl mx-auto px-6 pt-14 pb-0">
                    <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-6 bg-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-zinc-400 text-xs font-bold tracking-wider">INSPECTION · MATCH · SELL</span>
                    </div>

                    <h1 className="text-[2.4rem] font-black leading-[1.15] mb-5 tracking-tight">
                        전문가가 검사하고<br />
                        딜러가 경쟁합니다
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                        100+ 항목 정밀 인스펙션 → 객관적 리포트 발행<br />
                        검증된 딜러 네트워크에서 <span className="text-white font-bold">최고가를 제시</span>합니다.
                    </p>
                    <p className="text-zinc-500 text-xs mb-8">
                        8만원 투자로 수십~수백만원을 더 받아가세요.
                    </p>

                    <button
                        onClick={scrollToForm}
                        className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-extrabold text-lg shadow-2xl shadow-black/40 active:scale-[0.98] transition-all mb-4"
                    >
                        검사 신청하기 (80,000원) →
                    </button>
                    <p className="text-center text-zinc-600 text-xs mb-10">
                        방문 검사 · 리포트 포함 · 카드/간편결제 가능
                    </p>

                    <div className="grid grid-cols-4 border-t border-white/10 pt-6 pb-8">
                        {STATS.map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-white font-black text-xl leading-none tabular-nums">{s.value}</p>
                                <p className="text-zinc-600 text-[10px] mt-1.5 leading-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 히어로 이미지 (경로: /images/inspection-hero.jpg) */}
                <div className="w-full h-56 bg-zinc-800 overflow-hidden">
                    <img src="/images/inspection-hero.jpg" alt="카비어 인스펙션 현장" className="w-full h-full object-cover opacity-80" />
                </div>
            </section>

            {/* ── 신뢰 뱃지 바 ── */}
            <section className="bg-zinc-100 px-5 py-4">
                <div className="max-w-xl mx-auto flex items-center justify-center gap-5 flex-wrap">
                    {['방문 검사', '당일 리포트', '딜러 직접 경쟁', '카드/간편결제'].map(t => (
                        <div key={t} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px]">✓</span>
                            {t}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 가치 제안 ── */}
            <section className="bg-white px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">WHY CARVIOR</p>
                    <h2 className="text-2xl font-black text-zinc-900 text-center mb-3 leading-tight">
                        8만원이 왜 이득인가요?
                    </h2>
                    <p className="text-zinc-400 text-sm text-center mb-8">
                        감가 없이 리포트로 증명하면, 딜러가 먼저 최고가를 씁니다
                    </p>
                    <div className="space-y-3">
                        {[
                            { icon: '📊', title: '데이터로 협상력 UP', desc: '객관적인 검사 리포트가 있으면 딜러 감가 주장을 원천 차단할 수 있습니다.' },
                            { icon: '🏆', title: '딜러 간 경쟁 입찰', desc: '여러 딜러가 리포트를 보고 경쟁적으로 최고가를 제시합니다.' },
                            { icon: '⚡', title: '빠른 판매 마감', desc: '리포트가 있으면 협의 없이 빠르게 계약이 마무리됩니다.' },
                            { icon: '🔒', title: '토스 안전 결제', desc: '결제는 토스페이먼츠로 안전하게 처리됩니다. 영수증 자동 발급.' },
                        ].map(item => (
                            <div key={item.title} className="flex gap-4 items-start p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                                <div className="flex-shrink-0 w-11 h-11 bg-zinc-900 rounded-xl flex items-center justify-center text-xl">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-extrabold text-zinc-900 text-sm mb-0.5">{item.title}</p>
                                    <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 중간 CTA 배너 ── */}
            <section className="bg-zinc-950 px-6 py-10">
                <div className="max-w-xl mx-auto text-center space-y-4">
                    <p className="text-zinc-500 text-sm font-bold tracking-wider uppercase">데이터로 증명된 차량 가치</p>
                    <p className="text-white font-black text-2xl leading-tight">
                        리포트 하나로<br />딜러가 먼저 연락합니다
                    </p>
                    <button
                        onClick={scrollToForm}
                        className="bg-white text-zinc-900 font-extrabold text-base px-10 py-4 rounded-2xl shadow-xl active:scale-95 transition-all"
                    >
                        80,000원으로 시작하기 →
                    </button>
                </div>
            </section>

            {/* ── 검사 항목 ── */}
            <section className="bg-white px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">INSPECTION</p>
                    <h2 className="text-2xl font-black text-zinc-900 text-center mb-2 leading-tight">100+ 항목 정밀 검사</h2>
                    <p className="text-zinc-400 text-sm text-center mb-8">전문 인스펙터가 직접 방문해 꼼꼼하게 확인합니다</p>

                    {/* 진단장비 이미지 갤러리 (경로: /images/diagnostic-1~3.jpg) */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="relative h-36 bg-zinc-100 rounded-2xl overflow-hidden">
                            <img src="/images/diagnostic-1.jpg" alt="OBD 진단장비" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                <p className="text-white text-[10px] font-bold">OBD 정밀 진단</p>
                            </div>
                        </div>
                        <div className="relative h-36 bg-zinc-100 rounded-2xl overflow-hidden">
                            <img src="/images/diagnostic-2.jpg" alt="도장두께 측정기" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                <p className="text-white text-[10px] font-bold">도장두께 측정</p>
                            </div>
                        </div>
                        <div className="relative h-36 bg-zinc-100 rounded-2xl overflow-hidden col-span-2">
                            <img src="/images/diagnostic-3.jpg" alt="하부 검사 현장" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                <p className="text-white text-[10px] font-bold">하부 정밀 검사</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {CHECK_ITEMS.map(group => (
                            <div key={group.category} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                                <p className="text-xs font-extrabold text-zinc-900 mb-3 uppercase tracking-wider">{group.category}</p>
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
            <section className="bg-zinc-50 px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">PROCESS</p>
                    <h2 className="text-2xl font-black text-zinc-900 text-center mb-10 leading-tight">5단계, 이게 전부입니다</h2>
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
                                    {i < STEPS.length - 1 && <div className="w-px flex-1 bg-zinc-200 my-1" style={{ minHeight: '32px' }} />}
                                </div>
                                <div className="pb-8 pt-1.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{step.icon}</span>
                                        <p className={clsx('font-extrabold text-sm', i === 0 ? 'text-zinc-900' : 'text-zinc-700')}>{step.title}</p>
                                    </div>
                                    <p className="text-zinc-400 text-xs leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 고객 후기 ── */}
            <section className="bg-white px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-2">REVIEWS</p>
                    <h2 className="text-2xl font-black text-zinc-900 text-center mb-8">실제 고객 후기</h2>
                    <div className="space-y-4">
                        {REVIEWS.map(r => (
                            <div key={r.name} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                                {/* 후기 사진 (경로: r.img) */}
                                <div className="w-full h-40 bg-zinc-100">
                                    <img src={r.img} alt={`${r.name} 후기`} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-extrabold text-zinc-900 text-sm">{r.name}</p>
                                            <p className="text-zinc-400 text-xs">{r.car}</p>
                                        </div>
                                        <div className="flex gap-0.5 pt-0.5">
                                            {Array.from({ length: r.stars }).map((_, i) => (
                                                <span key={i} className="text-zinc-900 text-sm">★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 text-sm leading-relaxed">"{r.text}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 하단 결제 폼 ── */}
            <section ref={formRef} className="bg-zinc-950 px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-2">INSPECTION</p>
                    <h2 className="text-2xl font-black text-white text-center mb-2 leading-tight">검사 신청하기</h2>
                    <p className="text-zinc-500 text-sm text-center mb-8">
                        방문 검사 · 리포트 발행 · 딜러 매칭까지
                    </p>

                    <InspectionForm light />

                    {/* 전화 상담 */}
                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        <p className="text-zinc-600 text-xs text-center mb-3">결제 전 전화 문의</p>
                        <a
                            href="tel:15882285"
                            className="flex items-center justify-center gap-3 w-full py-4 border border-zinc-700 rounded-2xl text-white font-extrabold text-lg hover:bg-zinc-900 active:scale-95 transition-all"
                        >
                            <span>📞</span> 1588-2285
                        </a>
                        <p className="text-zinc-700 text-xs text-center mt-2">평일 09:00 – 18:00</p>
                    </div>
                </div>
            </section>

            {/* ── 푸터 ── */}
            <footer className="bg-black text-zinc-600 px-6 py-10 text-xs leading-loose">
                <div className="max-w-xl mx-auto space-y-5">
                    <p className="text-white font-black text-base tracking-tight">
                        CAR<span className="text-zinc-500">VIOR</span>
                    </p>
                    <div className="space-y-1">
                        <p>상호명 : 카비어(CARVIOR)</p>
                        <p>고객센터 : <a href="tel:15882285" className="text-zinc-400 font-bold">1588-2285</a></p>
                    </div>
                    <p className="text-[10px] text-zinc-700 pt-4 border-t border-zinc-900 leading-relaxed">
                        © 2026 CARVIOR. All rights reserved.<br />
                        본 서비스는 중고차 정밀 검사 및 딜러 매칭을 제공하는 전문 플랫폼입니다.
                    </p>
                </div>
            </footer>

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
                        검사 신청하기 (80,000원) →
                    </button>
                </div>
            </div>

        </div>
    );
}
