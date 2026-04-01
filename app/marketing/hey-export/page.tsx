'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

// ─────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────
const STEPS = [
    { num: '01', title: '차량 상담 문의', desc: '간단한 정보 입력 후 1:1 맞춤 상담 신청' },
    { num: '02', title: '담당자 즉시 연결', desc: '전문 담당자 배정 → 신속 상담 제공' },
    { num: '03', title: '현장 방문 / 비대면 계약', desc: '방문 또는 비대면으로 간편 계약 완료' },
    { num: '04', title: '당일 대금 즉시 지급', desc: '계약 즉시 대금 지급 + 차량 안전 이동' },
    { num: '05', title: '당일 말소 처리 완료', desc: '모든 절차 완료 후 당일 말소 마무리' },
];

const BADGES = [
    { emoji: '🛣️', title: '주행거리', sub: '무관' },
    { emoji: '💥', title: '사고차량', sub: 'OK' },
    { emoji: '📅', title: '연식·연도', sub: '무관' },
    { emoji: '🌏', title: '해외수출', sub: '최고가' },
];

const REVIEWS = [
    { name: '박*준', car: '현대 아반떼 2017', stars: 5, text: '다른 곳보다 150만원 더 받았어요. 당일 말소에 당일 입금까지 너무 편했습니다.' },
    { name: '김*영', car: '기아 K5 2015', stars: 5, text: '사고이력 있어서 걱정했는데 흔쾌히 최고가로 매입해줬습니다. 강추!' },
    { name: '이*수', car: '쌍용 티볼리 2016', stars: 5, text: '키로수 많아서 포기하고 있었는데 수출 루트라 전혀 상관없다 하더라고요. 감사해요.' },
];

const STATS = [
    { value: '3,200+', label: '누적 수출 대수' },
    { value: '98%', label: '고객 만족도' },
    { value: '당일', label: '말소 처리' },
    { value: '24시', label: '상담 가능' },
];

// ─────────────────────────────────────────
// 전화번호 입력 컴포넌트
// ─────────────────────────────────────────
function PhoneInput({
    value,
    onChange,
    dark = false,
}: {
    value: string;
    onChange: (v: string) => void;
    dark?: boolean;
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
        let formatted = raw;
        if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
        onChange(formatted);
    };
    return (
        <input
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            placeholder="010-0000-0000"
            className={clsx(
                'w-full p-3 outline-none transition-all text-base font-bold',
                dark
                    ? 'border-b-2 border-white/30 bg-transparent text-white placeholder:text-white/40 focus:border-orange-400'
                    : 'border-b-2 border-slate-200 bg-transparent text-slate-800 placeholder:text-slate-300 focus:border-orange-500'
            )}
        />
    );
}

// ─────────────────────────────────────────
// 상담 신청 폼
// ─────────────────────────────────────────
function ConsultForm({ dark = false, id }: { dark?: boolean; id?: string }) {
    const [carType, setCarType] = useState('');
    const [phone, setPhone] = useState('');
    const [done, setDone] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        const rawPhone = phone.replace(/-/g, '');
        if (rawPhone.length < 10) {
            alert('연락처를 올바르게 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carOwner: '',
                    carNumber: carType,
                    contact: rawPhone,
                    source: 'HEY_EXPORT',
                }),
            });
            if (res.ok) {
                setDone(true);
            } else {
                throw new Error('서버 오류가 발생했습니다.');
            }
        } catch (err: any) {
            alert(err.message ?? '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (done) {
        return (
            <div id={id} className="text-center py-8 space-y-3">
                <div className="text-5xl">✅</div>
                <p className={clsx('font-extrabold text-lg', dark ? 'text-white' : 'text-slate-800')}>
                    신청 완료!
                </p>
                <p className={clsx('text-sm', dark ? 'text-white/70' : 'text-slate-500')}>
                    담당자가 빠르게 연락드리겠습니다.
                </p>
            </div>
        );
    }

    return (
        <form id={id} onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={clsx('text-[11px] font-bold mb-1 block uppercase tracking-widest', dark ? 'text-white/50' : 'text-slate-400')}>
                    차종
                </label>
                <input
                    required
                    value={carType}
                    onChange={e => setCarType(e.target.value)}
                    placeholder="예: 현대 그랜저, 기아 K5 등"
                    className={clsx(
                        'w-full p-3 outline-none transition-all text-base border-b-2',
                        dark
                            ? 'border-white/30 bg-transparent text-white placeholder:text-white/40 focus:border-orange-400'
                            : 'border-slate-200 bg-transparent text-slate-800 placeholder:text-slate-300 focus:border-orange-500'
                    )}
                />
            </div>
            <div>
                <label className={clsx('text-[11px] font-bold mb-1 block uppercase tracking-widest', dark ? 'text-white/50' : 'text-slate-400')}>
                    연락처
                </label>
                <PhoneInput value={phone} onChange={setPhone} dark={dark} />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                    'w-full py-4 rounded-2xl text-base font-extrabold shadow-lg transition-all tracking-wide',
                    isSubmitting
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                        : dark
                        ? 'bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white shadow-black/20'
                        : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white shadow-orange-100'
                )}
            >
                {isSubmitting ? '신청 중...' : '무료 상담 신청하기'}
            </button>
            <p className={clsx('text-center text-[11px]', dark ? 'text-white/40' : 'text-slate-400')}>
                개인정보는 상담 목적으로만 사용됩니다
            </p>
        </form>
    );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
export default function HeyExportPage() {
    const [scrolled, setScrolled] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">

            {/* ── 네비게이션 ── */}
            <nav className={clsx(
                'sticky top-0 z-50 px-5 py-3 flex justify-between items-center transition-all',
                scrolled ? 'bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm' : 'bg-transparent'
            )}>
                <span className="text-lg font-black text-orange-500 tracking-tight">
                    헤이중고차수출
                </span>
                <div className="flex items-center gap-2">
                    <a
                        href="tel:16667096"
                        className="text-[13px] font-bold text-slate-600 flex items-center gap-1"
                    >
                        <span className="text-orange-500">📞</span> 1666-7096
                    </a>
                    <button
                        onClick={scrollToForm}
                        className="bg-orange-500 text-white text-xs font-extrabold px-3 py-2 rounded-xl active:scale-95 transition-transform"
                    >
                        무료 상담
                    </button>
                </div>
            </nav>

            {/* ── 히어로 ── */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
                {/* 배경 장식 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-orange-400/10 blur-3xl" />
                </div>

                <div className="relative max-w-xl mx-auto px-6 pt-12 pb-0">
                    {/* 뱃지 */}
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-5">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                        <span className="text-orange-300 text-xs font-bold tracking-wider">24시 내차팔기 · 지금 신청 가능</span>
                    </div>

                    {/* 헤드라인 */}
                    <h1 className="text-[2.2rem] font-black leading-[1.2] mb-4">
                        중고차 해외 수출로<br />
                        <span className="text-orange-400">최대 300만원</span><br />
                        <span className="text-2xl font-extrabold text-white/80">추가로 더 받으세요</span>
                    </h1>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        키로수 · 사고차 · 연식&nbsp;
                        <span className="text-white font-bold underline underline-offset-2 decoration-orange-400">전부 상관없습니다.</span>
                        <br />수출로 간편하게 말소까지 — 수출업체 중 최고가.
                    </p>

                    {/* CTA 버튼 */}
                    <button
                        onClick={scrollToForm}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-extrabold text-lg text-white shadow-xl shadow-orange-900/40 active:scale-[0.98] transition-all mb-4"
                    >
                        지금 무료 상담 신청하기 →
                    </button>
                    <p className="text-center text-white/40 text-xs mb-8">30초만 투자하면 전문가가 바로 연락드립니다</p>

                    {/* 통계 */}
                    <div className="grid grid-cols-4 border-t border-white/10 pt-6 pb-8 gap-2">
                        {STATS.map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-orange-400 font-black text-lg leading-none">{s.value}</p>
                                <p className="text-white/50 text-[10px] mt-1 leading-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 배지 ── */}
            <section className="bg-orange-50 px-5 py-6">
                <div className="max-w-xl mx-auto grid grid-cols-4 gap-3">
                    {BADGES.map(b => (
                        <div key={b.title} className="bg-white rounded-2xl py-4 px-2 shadow-sm border border-orange-100 text-center">
                            <div className="text-2xl mb-1">{b.emoji}</div>
                            <p className="text-[11px] font-bold text-slate-600 leading-tight">{b.title}</p>
                            <p className="text-orange-500 text-[11px] font-extrabold">{b.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 왜 헤이중고차수출인가 ── */}
            <section className="bg-white px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">WHY HEY EXPORT</p>
                    <h2 className="text-2xl font-black text-slate-900 text-center mb-8 leading-tight">
                        왜 헤이중고차수출인가요?
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                icon: '💰',
                                title: '수출 루트로 국내 최고가 지급',
                                desc: '해외 수출 전문 네트워크로 국내 시세보다 최대 300만원 더 드립니다.',
                            },
                            {
                                icon: '🚫',
                                title: '거절 없음 — 어떤 차도 OK',
                                desc: '10만km 이상, 사고차, 침수차, 오래된 연식 모두 수출 가능합니다.',
                            },
                            {
                                icon: '⚡',
                                title: '당일 대금 지급 + 당일 말소',
                                desc: '복잡한 서류 없이 당일 안에 입금과 말소까지 한 번에 처리합니다.',
                            },
                            {
                                icon: '🤝',
                                title: '투명한 1:1 전담 상담',
                                desc: '숨겨진 수수료 없이 담당자가 끝까지 책임지고 처리해드립니다.',
                            },
                        ].map(item => (
                            <div key={item.title} className="flex gap-4 items-start p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex-shrink-0 w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-extrabold text-slate-800 text-sm mb-0.5">{item.title}</p>
                                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 중간 CTA 배너 ── */}
            <section className="bg-orange-500 px-6 py-8">
                <div className="max-w-xl mx-auto text-center space-y-3">
                    <p className="text-white/80 text-sm font-bold">지금 신청하면 오늘 안에 연락드립니다</p>
                    <p className="text-white font-black text-xl leading-tight">
                        수출업체 중 최고가<br />지금 바로 확인해보세요
                    </p>
                    <button
                        onClick={scrollToForm}
                        className="mt-2 bg-white text-orange-600 font-extrabold text-base px-8 py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                        무료 견적 받기 →
                    </button>
                </div>
            </section>

            {/* ── 진행 절차 ── */}
            <section className="bg-white px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">PROCESS</p>
                    <h2 className="text-2xl font-black text-slate-900 text-center mb-10 leading-tight">
                        5단계로 끝나는<br />간편 판매 절차
                    </h2>
                    <div className="relative">
                        {/* 세로선 */}
                        <div className="absolute left-[1.35rem] top-0 bottom-0 w-0.5 bg-slate-100" />
                        <div className="space-y-6">
                            {STEPS.map((step, i) => (
                                <div key={step.num} className="relative flex gap-5 items-start">
                                    <div className={clsx(
                                        'relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all',
                                        i === 0
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                                            : 'bg-white border-slate-200 text-slate-400'
                                    )}>
                                        {step.num}
                                    </div>
                                    <div className="pt-2 pb-2">
                                        <p className={clsx('font-extrabold text-sm mb-0.5', i === 0 ? 'text-orange-500' : 'text-slate-800')}>
                                            {step.title}
                                        </p>
                                        <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 고객 후기 ── */}
            <section className="bg-slate-50 px-6 py-14">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">REVIEWS</p>
                    <h2 className="text-2xl font-black text-slate-900 text-center mb-8">실제 고객 후기</h2>
                    <div className="space-y-4">
                        {REVIEWS.map(r => (
                            <div key={r.name} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-extrabold text-slate-800 text-sm">{r.name}</p>
                                        <p className="text-slate-400 text-xs">{r.car}</p>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: r.stars }).map((_, i) => (
                                            <span key={i} className="text-orange-400 text-sm">★</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">"{r.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 하단 상담 폼 ── */}
            <section ref={formRef} className="bg-gradient-to-br from-slate-950 to-slate-900 px-6 py-14" id="consult-form">
                <div className="max-w-xl mx-auto">
                    <p className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest text-center mb-2">FREE CONSULT</p>
                    <h2 className="text-2xl font-black text-white text-center mb-2 leading-tight">
                        지금 바로 신청하세요
                    </h2>
                    <p className="text-white/50 text-sm text-center mb-8">
                        24시간 · 365일 · 전화 또는 문자로 즉시 답변
                    </p>
                    <ConsultForm dark />

                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center gap-3">
                        <a
                            href="tel:16667096"
                            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 text-white font-extrabold text-base transition-all active:scale-95"
                        >
                            📞 1666-7096
                        </a>
                    </div>
                    <p className="text-center text-white/30 text-xs mt-3">전화 상담도 언제든지 환영합니다</p>
                </div>
            </section>

            {/* ── 푸터 ── */}
            <footer className="bg-slate-950 text-slate-500 px-6 py-10 text-xs leading-loose">
                <div className="max-w-xl mx-auto space-y-5">
                    <p className="text-white font-black text-base">헤이중고차수출</p>
                    <div className="space-y-1">
                        <p>상호명 : T&amp;S무역 &nbsp;|&nbsp; 대표자명 : 장태산</p>
                        <p>사업자등록번호 : 681-25-01849</p>
                        <p>인천광역시 부평구 평천로 255번길 13, 9층 908호</p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold mb-0.5">고객센터</p>
                        <a href="tel:16667096" className="text-orange-400 font-black text-xl">1666-7096</a>
                    </div>
                    <p className="text-[10px] text-slate-600 pt-4 border-t border-slate-800">
                        광고영업 전화시 업무 방해 고소, 네이버/카카오에 사원 및 대행사 신고합니다.<br />
                        Copyright ⓒ 헤이중고차수출. All Rights Reserved.
                    </p>
                </div>
            </footer>

            {/* ── 플로팅 CTA (스크롤 후 노출) ── */}
            <div className={clsx(
                'fixed bottom-5 left-0 right-0 px-5 z-50 transition-all duration-300',
                scrolled ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
            )}>
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={scrollToForm}
                        className="w-full py-4 bg-orange-500 text-white font-extrabold text-base rounded-2xl shadow-2xl shadow-orange-900/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="animate-bounce">↑</span>
                        무료 상담 신청하기
                        <span className="animate-bounce">↑</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
