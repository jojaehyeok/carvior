'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import AppFooter from '@/components/footermodal';
import PrivacyModal from '@/components/PrivacyModal';

// ─────────────────────────────────────────
// 날짜/시간 선택기
// ─────────────────────────────────────────
function DateTimeSelector({ onSelect }: { onSelect: (date: string, time: string) => void }) {
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

    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    useEffect(() => {
        if (selDate && selTime) onSelect(selDate, selTime);
    }, [selDate, selTime, onSelect]);

    return (
        <div className="space-y-5">
            <div>
                <label className="text-[10px] font-extrabold text-zinc-400 mb-3 block uppercase tracking-widest">방문 날짜 선택</label>
                <div className="flex gap-2 pb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {dates.map(d => (
                        <button
                            key={d.full} type="button" onClick={() => setSelDate(d.full)}
                            className={clsx(
                                'flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center transition-all border text-center',
                                selDate === d.full
                                    ? 'bg-zinc-900 border-zinc-900 shadow-lg scale-105'
                                    : 'bg-white border-zinc-100'
                            )}
                        >
                            <span className={clsx('text-[9px] mb-0.5', selDate === d.full ? 'text-zinc-400' : 'text-slate-400')}>
                                {d.day}
                            </span>
                            <span className={clsx('text-base font-bold leading-none',
                                selDate === d.full ? 'text-white' : d.isWeekend ? 'text-red-400' : 'text-zinc-800'
                            )}>
                                {d.num}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[10px] font-extrabold text-zinc-400 mb-3 block uppercase tracking-widest">방문 시간 선택</label>
                <div className="grid grid-cols-3 gap-2">
                    {times.map(t => (
                        <button
                            key={t} type="button"
                            disabled={!selDate}
                            onClick={() => setSelTime(t)}
                            className={clsx(
                                'py-2.5 rounded-xl text-sm font-bold border transition-all',
                                !selDate && 'opacity-20 cursor-not-allowed',
                                selTime === t
                                    ? 'bg-zinc-900 border-zinc-900 text-white'
                                    : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300'
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
function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
            required
            className="w-full p-3 outline-none transition-all text-base font-bold border-b-2 border-zinc-200 bg-transparent text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900"
        />
    );
}

// ─────────────────────────────────────────
// 현장 이미지 갤러리
// ─────────────────────────────────────────
const WORK_IMAGES = [
    { src: '/images/karrot-work-1.jpg', label: '외관 정밀 진단' },
    { src: '/images/karrot-work-2.jpg', label: '엔진룸 점검' },
    { src: '/images/karrot-work-3.jpg', label: '하체 상태 확인' },
    { src: '/images/karrot-work-4.jpg', label: '계약 현장 대행' },
];

function WorkGallery() {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-1 h-4 bg-zinc-900 rounded-full" />
                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">실제 현장 사진</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
                {WORK_IMAGES.map((img, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100 group">
                        <img
                            src={img.src}
                            alt={img.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                const el = e.target as HTMLImageElement;
                                el.style.display = 'none';
                                const parent = el.parentElement;
                                if (parent) {
                                    parent.innerHTML = `
                                        <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f4f4f5;gap:8px;">
                                            <span style="font-size:2rem;">📷</span>
                                            <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-align:center;padding:0 8px;">${img.label}</span>
                                            <span style="font-size:9px;color:#d4d4d8;">이미지 교체 예정</span>
                                        </div>
                                    `;
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <p className="absolute bottom-2.5 left-3 text-white text-[11px] font-bold">{img.label}</p>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-zinc-300 text-center mt-2">
                이미지 파일 위치: /public/images/karrot-work-1~4.jpg
            </p>
        </div>
    );
}

// ─────────────────────────────────────────
// 신뢰 배지 컴포넌트
// ─────────────────────────────────────────
function TrustBadge({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-base flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs font-extrabold text-zinc-900 leading-tight">{title}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
export default function CarviorPrivateDealPage() {
    const [formData, setFormData] = useState({
        carOwner: '',
        contact: '',
        address: '',
        detailAddress: '',
        preferredDateTime: '',
        desiredPrice: '',
        additionalMemo: '',
    });
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleDateTimeSelect = useCallback((date: string, time: string) => {
        setFormData(prev => ({ ...prev, preferredDateTime: `${date} ${time}` }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSearch = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: function (data: any) {
                    let fullAddress = data.address;
                    if (data.addressType === 'R') {
                        let extraAddress = '';
                        if (data.bname !== '') extraAddress += data.bname;
                        if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                        fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
                    }
                    setFormData(prev => ({ ...prev, address: fullAddress }));
                    document.getElementById('pd-detail-address')?.focus();
                },
            }).open();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!privacyAgreed) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }
        if (!formData.preferredDateTime) {
            alert('방문 날짜와 시간을 선택해주세요.');
            return;
        }
        if (!formData.address) {
            alert('진단 장소를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, source: 'PRIVATE_DEAL_FORM', privacyAgreed }),
            });

            const result = await res.json();

            if (res.ok) {
                await fetch('/api/kakao/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dealerName: formData.carOwner,
                        contact: formData.contact,
                        carNumber: '개인직거래',
                        preferredDateTime: formData.preferredDateTime,
                    }),
                });
                setSubmitted(true);
            } else {
                throw new Error(result.message || '서버 오류가 발생했습니다.');
            }
        } catch (error: any) {
            alert(error.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── 완료 화면
    if (submitted) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-2xl mb-6">✓</div>
                <h2 className="text-2xl font-black text-zinc-900 mb-3">신청 완료</h2>
                <p className="text-zinc-500 text-sm leading-relaxed mb-2">
                    <span className="font-bold text-zinc-800">{formData.carOwner}</span>님, 접수가 완료되었습니다.
                </p>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                    카비어 담당 상담사가 <strong className="text-zinc-800">영업일 기준 1시간 이내</strong>에 연락드립니다.
                </p>
                <div className="bg-white rounded-3xl border border-zinc-100 p-6 w-full max-w-sm text-left space-y-4 shadow-sm mb-8">
                    {[
                        { label: '신청자', value: formData.carOwner },
                        { label: '연락처', value: formData.contact },
                        { label: '방문 일시', value: formData.preferredDateTime },
                        { label: '장소', value: formData.address },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start text-sm gap-3">
                            <span className="text-zinc-400 font-bold flex-shrink-0">{label}</span>
                            <span className="font-extrabold text-zinc-900 text-right">{value}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-zinc-400">고객센터 · 010-2285-6017</p>
            </div>
        );
    }

    return (
        <>
            {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}

            <div className="min-h-screen bg-zinc-50 font-sans">

                {/* ── 헤더 */}
                <nav className="bg-white border-b border-zinc-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center">
                            <span className="text-white text-[10px] font-black">C</span>
                        </div>
                        <span className="text-base font-black text-zinc-900 tracking-tight">카비어</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-500">상담 가능</span>
                    </div>
                </nav>

                {/* ── 히어로: 페인포인트 후킹 */}
                <div className="bg-zinc-900 text-white px-6 pt-10 pb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/[0.03] rounded-full translate-y-1/2 -translate-x-1/4" />

                    <div className="max-w-xl mx-auto relative">
                        {/* 후킹 배지 */}
                        <div className="inline-flex items-center gap-2 border border-zinc-700 rounded-full px-3 py-1.5 text-[11px] font-bold text-zinc-300 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                            공인 진단평가사 · 사업자 등록 완료
                        </div>

                        {/* 헤드라인: 구체적인 이익 제시 */}
                        <h1 className="text-[2.1rem] font-black leading-[1.15] mb-5 tracking-tight">
                            개인 직거래,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                                혼자 하면 손해입니다.
                            </span>
                        </h1>

                        {/* 서브 카피: 공포 → 해결책 */}
                        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                            허위 매물 의심, 계약서 실수, 저가 흥정 압박...
                            <br />
                            <span className="text-white font-bold">카비어 공인 평가사가 현장에서 직접 해결합니다.</span>
                        </p>

                        {/* 핵심 수치: 구체적 숫자로 신뢰 */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { v: '1,800+', l: '월 대행 완료', sub: '건' },
                                { v: '98%', l: '고객 만족도', sub: '' },
                                { v: '평균', l: '추가 수익', sub: '+87만원' },
                            ].map(s => (
                                <div key={s.l} className="bg-white/[0.06] border border-white/10 rounded-2xl py-3.5 px-2 text-center">
                                    <p className="text-xl font-black text-white">{s.v}</p>
                                    {s.sub && <p className="text-amber-400 text-[11px] font-black">{s.sub}</p>}
                                    <p className="text-zinc-500 text-[10px] font-bold mt-0.5">{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto px-6">

                    {/* ── 문제 제기 섹션 (공감 형성) */}
                    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 -mt-5 mb-6 relative z-10">
                        <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest mb-4">이런 경험 있으신가요?</p>
                        <div className="space-y-3">
                            {[
                                '구매자가 계속 가격을 깎으려 해서 곤란했다',
                                '계약서 내용이 맞는지 확인할 방법이 없었다',
                                '차량 상태를 제대로 설명하기가 어려웠다',
                                '거래 후 분쟁이 생길까봐 불안했다',
                            ].map((pain, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-400 text-[10px] font-black">!</span>
                                    </div>
                                    <p className="text-sm text-zinc-600">{pain}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 pt-4 border-t border-zinc-50">
                            <p className="text-sm font-extrabold text-zinc-900">
                                카비어가 이 모든 걱정을 대신합니다.
                            </p>
                        </div>
                    </div>

                    {/* ── 서비스 흐름 */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-5 px-1">
                            <div className="w-1 h-4 bg-zinc-900 rounded-full" />
                            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">서비스 과정</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 space-y-6">
                            {[
                                { num: '01', icon: '📋', title: '무료 상담 신청', desc: '30초 만에 정보 입력 → 담당 상담사 배정 → 1시간 내 연락' },
                                { num: '02', icon: '🔍', title: '공인 평가사 현장 방문', desc: '100+ 항목 정밀 진단 · 시장가 분석 · 진단 리포트 즉시 발행' },
                                { num: '03', icon: '🤝', title: '협상 및 계약 전 과정 대행', desc: '가격 협상 · 계약서 작성 · 서류 처리까지 전부 대신 수행' },
                                { num: '04', icon: '✅', title: '안전한 대금 수령', desc: '거래 완료 후 즉시 대금 수령 · 사후 분쟁 대응 지원' },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-xl flex-shrink-0">
                                            {step.icon}
                                        </div>
                                        {i < 3 && <div className="w-px flex-1 bg-zinc-100 my-1.5 min-h-[20px]" />}
                                    </div>
                                    <div className="pb-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[9px] font-extrabold text-zinc-300">{step.num}</span>
                                            <p className="font-extrabold text-zinc-900 text-sm">{step.title}</p>
                                        </div>
                                        <p className="text-zinc-400 text-xs leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── 현장 사진 */}
                    <WorkGallery />

                    {/* ── 신뢰 신호 */}
                    <div className="bg-zinc-900 text-white rounded-3xl p-6 mb-6">
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-5">카비어를 믿을 수 있는 이유</p>
                        <div className="grid grid-cols-1 gap-5">
                            <TrustBadge icon="🏢" title="사업자 등록 완료" desc="사업자등록번호 783-24-02190 · 통신판매업 제 2026-경기안산-0474" />
                            <TrustBadge icon="🎓" title="공인 진단평가사 직접 방문" desc="국가공인 자격 보유 평가사가 직접 현장에 방문합니다" />
                            <TrustBadge icon="🔒" title="수수료 후불제" desc="거래 성사 시에만 수수료 발생 · 상담 및 진단은 무료" />
                            <TrustBadge icon="📄" title="공식 진단 리포트 발행" desc="객관적 데이터 기반 리포트로 분쟁 발생 시 법적 근거 확보" />
                        </div>
                    </div>

                    {/* ── 고객 후기 */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-5 px-1">
                            <div className="w-1 h-4 bg-zinc-900 rounded-full" />
                            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">실제 고객 후기</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                {
                                    name: '이*현', car: 'BMW 3시리즈 · 2021년식', stars: 5,
                                    gain: '+120만원',
                                    text: '혼자 직거래 하려다 카비어 믿고 맡겼어요. 평가사가 협상까지 직접 해주니까 예상보다 120만원을 더 받았습니다. 수수료가 전혀 아깝지 않았어요.',
                                },
                                {
                                    name: '김*수', car: '제네시스 G80 · 2022년식', stars: 5,
                                    gain: '사기 예방',
                                    text: '계약서 실수가 걱정됐는데 모든 서류를 직접 검토해주시더라고요. 거래 후에도 문제 없이 마무리됐습니다.',
                                },
                                {
                                    name: '박*진', car: '쏘렌토 하이브리드 · 2023년식', stars: 5,
                                    gain: '+87만원',
                                    text: '구매자가 계속 가격 깎으려 했는데 평가사 리포트 보여주니까 바로 제 가격 맞춰줬어요. 전문가가 옆에 있으니 완전 달라지더라고요.',
                                },
                            ].map((r, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-black text-white">
                                                {r.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold text-zinc-900">{r.name}</p>
                                                <p className="text-[10px] text-zinc-400">{r.car}</p>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1 text-center">
                                            <p className="text-[10px] font-extrabold text-emerald-600">{r.gain}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{r.text}</p>
                                    <div className="mt-2 text-amber-400 text-[11px]">{'★'.repeat(r.stars)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── 신청 폼 */}
                    <div className="mb-6">
                        {/* CTA 섹션 헤더 */}
                        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-6 mb-4 text-center">
                            <p className="text-[10px] font-extrabold text-orange-800 uppercase tracking-widest mb-2">지금 바로 시작하세요</p>
                            <h2 className="text-xl font-black text-zinc-900 mb-1">무료 상담 신청</h2>
                            <p className="text-orange-800 text-xs">상담 무료 · 진단 무료 · 거래 성사 시에만 수수료</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* 01. 차주 정보 */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                                <h3 className="text-[10px] font-extrabold text-zinc-400 mb-5 uppercase tracking-widest">01 · 차주 정보</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs text-zinc-400 font-bold mb-1.5 block">차주 성명 <span className="text-red-400">*</span></label>
                                        <input
                                            required
                                            name="carOwner"
                                            placeholder="홍길동"
                                            value={formData.carOwner}
                                            onChange={handleChange}
                                            className="w-full border-b-2 border-zinc-200 p-3 focus:border-zinc-900 outline-none transition-all text-zinc-900 font-bold placeholder:text-zinc-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-400 font-bold mb-1.5 block">연락처 <span className="text-red-400">*</span></label>
                                        <PhoneInput
                                            value={formData.contact}
                                            onChange={(v) => setFormData(prev => ({ ...prev, contact: v }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 02. 진단 장소 및 일시 */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 space-y-6">
                                <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">02 · 진단 장소 및 일시</h3>
                                <div className="space-y-3">
                                    <label className="text-xs text-zinc-400 font-bold block">진단 장소 <span className="text-red-400">*</span></label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly required
                                            name="address"
                                            placeholder="주소 검색을 눌러주세요"
                                            value={formData.address}
                                            onClick={handleAddressSearch}
                                            className="flex-1 border-b-2 border-zinc-200 p-3 bg-zinc-50 text-zinc-700 outline-none cursor-pointer font-bold placeholder:text-zinc-300 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddressSearch}
                                            className="bg-zinc-900 text-white px-4 rounded-xl text-xs font-bold active:scale-95 transition-transform whitespace-nowrap"
                                        >
                                            주소찾기
                                        </button>
                                    </div>
                                    <input
                                        id="pd-detail-address"
                                        name="detailAddress"
                                        placeholder="상세주소 (예: 지하주차장 B1구역, 아파트 주차장 등)"
                                        value={formData.detailAddress}
                                        onChange={handleChange}
                                        className="w-full border-b-2 border-zinc-200 p-3 focus:border-zinc-900 outline-none transition-all text-zinc-900 placeholder:text-zinc-300 text-sm"
                                    />
                                </div>
                                <div className="pt-2 border-t border-zinc-50">
                                    <DateTimeSelector onSelect={handleDateTimeSelect} />
                                </div>
                            </div>

                            {/* 03. 추가 정보 */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                                <h3 className="text-[10px] font-extrabold text-zinc-400 mb-5 uppercase tracking-widest">03 · 추가 정보 <span className="normal-case font-bold text-zinc-300">(선택)</span></h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs text-zinc-400 font-bold mb-1.5 block">희망 구매가격</label>
                                        <select
                                            name="desiredPrice"
                                            value={formData.desiredPrice}
                                            onChange={handleChange}
                                            className="w-full border-b-2 border-zinc-200 p-3 focus:border-zinc-900 outline-none transition-all bg-transparent text-zinc-700 text-sm"
                                        >
                                            <option value="">선택 안 함</option>
                                            <option value="500만원 미만">500만원 미만</option>
                                            <option value="500~1000만원">500 ~ 1,000만원</option>
                                            <option value="1000~1500만원">1,000 ~ 1,500만원</option>
                                            <option value="1500~2000만원">1,500 ~ 2,000만원</option>
                                            <option value="2000~2500만원">2,000 ~ 2,500만원</option>
                                            <option value="2500~3000만원">2,500 ~ 3,000만원</option>
                                            <option value="3000~4000만원">3,000 ~ 4,000만원</option>
                                            <option value="4000~5000만원">4,000 ~ 5,000만원</option>
                                            <option value="5000만원 이상">5,000만원 이상</option>
                                        </select>
                                        <p className="text-[10px] text-zinc-400 mt-1.5">가격대를 알면 상담사가 더 정확한 시세를 안내드려요</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-400 font-bold mb-1.5 block">차량 정보 및 요청사항</label>
                                        <textarea
                                            name="additionalMemo"
                                            placeholder="예: 2022년식 BMW 3시리즈 흰색, 무사고, 구매자 연락받은 상태입니다"
                                            value={formData.additionalMemo}
                                            onChange={handleChange}
                                            className="w-full h-24 border border-zinc-100 rounded-2xl p-4 focus:ring-2 focus:ring-zinc-100 outline-none transition-all resize-none text-sm text-zinc-700 placeholder:text-zinc-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 개인정보 동의 */}
                            <div className="bg-white rounded-2xl border border-zinc-100 px-5 py-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="privacy-agree"
                                        checked={privacyAgreed}
                                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-zinc-900 cursor-pointer flex-shrink-0"
                                    />
                                    <label htmlFor="privacy-agree" className="text-xs text-zinc-600 leading-relaxed cursor-pointer select-none">
                                        <span className="font-black text-zinc-900">[필수] </span>
                                        개인정보 수집 및 이용에 동의합니다.{' '}
                                        <button
                                            type="button"
                                            onClick={() => setShowPrivacyModal(true)}
                                            className="text-zinc-500 font-bold underline underline-offset-2 hover:text-zinc-900"
                                        >
                                            내용 보기
                                        </button>
                                    </label>
                                </div>
                            </div>

                            {/* 제출 버튼 */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !privacyAgreed}
                                className={clsx(
                                    'w-full py-5 rounded-2xl text-lg font-black transition-all',
                                    isSubmitting || !privacyAgreed
                                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                        : 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 active:scale-[0.98] hover:bg-zinc-800'
                                )}
                            >
                                {isSubmitting ? '접수 중...' : '무료 상담 신청하기 →'}
                            </button>

                            <p className="text-center text-zinc-400 text-[11px] leading-relaxed">
                                거래 성사 전까지 100% 무료 · 부담 없이 신청하세요
                            </p>
                        </form>
                    </div>

                    {/* ── FAQ */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4 px-1">
                            <div className="w-1 h-4 bg-zinc-900 rounded-full" />
                            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">자주 묻는 질문</p>
                        </div>
                        <div className="space-y-2">
                            {[
                                {
                                    q: '수수료는 얼마인가요?',
                                    a: '거래 성사 시에만 수수료가 발생하며, 금액은 상담 후 안내드립니다. 상담·진단은 완전 무료입니다.',
                                },
                                {
                                    q: '구매자를 직접 구해야 하나요?',
                                    a: '기존에 연락이 온 구매자가 있으면 그 거래를 대행해드립니다. 구매자 없이 신청하셔도 됩니다.',
                                },
                                {
                                    q: '어디서든 방문 가능한가요?',
                                    a: '전국 어디든 방문 가능합니다. 차량이 있는 장소로 직접 찾아갑니다.',
                                },
                                {
                                    q: '계약서 작성도 대신 해주나요?',
                                    a: '네, 협상부터 계약서 작성, 서류 이전 안내까지 전 과정을 대행해드립니다.',
                                },
                            ].map((faq, i) => (
                                <details key={i} className="bg-white rounded-2xl border border-zinc-100 group">
                                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                                        <p className="text-sm font-bold text-zinc-900">{faq.q}</p>
                                        <span className="text-zinc-300 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-2">▼</span>
                                    </summary>
                                    <div className="px-5 pb-4">
                                        <p className="text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Footer */}
                <AppFooter />
            </div>
        </>
    );
}
