'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

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
                <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-widest">방문 날짜</label>
                <div className="flex gap-2 pb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {dates.map(d => (
                        <button
                            key={d.full} type="button" onClick={() => setSelDate(d.full)}
                            className={clsx(
                                'flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center transition-all border text-center',
                                selDate === d.full
                                    ? 'bg-orange-500 border-orange-500 shadow-lg scale-105'
                                    : 'bg-white border-slate-100'
                            )}
                        >
                            <span className={clsx('text-[9px] mb-0.5', selDate === d.full ? 'text-orange-100' : 'text-slate-400')}>
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
                <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-widest">방문 시간</label>
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
                                    ? 'bg-orange-500 border-orange-500 text-white'
                                    : 'bg-white border-slate-100 text-slate-600'
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
            className="w-full p-3 outline-none transition-all text-base font-bold border-b-2 border-slate-200 bg-transparent text-zinc-900 placeholder:text-zinc-300 focus:border-orange-500"
        />
    );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
export default function KarrotLandingPage() {
    const [formData, setFormData] = useState({
        carOwner: '',
        contact: '',
        address: '',
        detailAddress: '',
        preferredDateTime: '',
        additionalMemo: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleDateTimeSelect = useCallback((date: string, time: string) => {
        setFormData(prev => ({ ...prev, preferredDateTime: `${date} ${time}` }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                    document.getElementById('karrot-detail-address')?.focus();
                },
            }).open();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
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
                body: JSON.stringify({ ...formData, source: 'KARROT_FORM' }),
            });

            const result = await res.json();

            if (res.ok) {
                // SMS 알림 발송
                await fetch('/api/kakao/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dealerName: formData.carOwner,
                        contact: formData.contact,
                        carNumber: '당근거래',
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
            <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-6 text-center">
                <div className="text-6xl mb-6">🥕</div>
                <h2 className="text-2xl font-black text-zinc-900 mb-3">신청 완료!</h2>
                <p className="text-zinc-500 text-sm leading-relaxed mb-2">
                    <span className="font-bold text-zinc-700">{formData.carOwner}</span>님, 접수가 완료되었습니다.
                </p>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                    카비어 상담사가 곧 연락드릴게요.
                </p>
                <div className="bg-white rounded-2xl border border-orange-100 p-6 w-full max-w-sm text-left space-y-3 shadow-sm">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-bold">신청자</span>
                        <span className="font-extrabold text-zinc-900">{formData.carOwner}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-bold">연락처</span>
                        <span className="font-extrabold text-zinc-900">{formData.contact}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-bold">방문 일시</span>
                        <span className="font-extrabold text-zinc-900">{formData.preferredDateTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-bold">장소</span>
                        <span className="font-extrabold text-zinc-900 text-right max-w-[60%]">{formData.address}</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-6">문의: 카비어 고객센터 010-2285-6017</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* 헤더 */}
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-orange-500 tracking-tight">C CARVIOR</span>
                    <span className="text-xs text-slate-400 font-bold">카비어</span>
                </div>
                <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-black">당근 대행 서비스</span>
            </nav>

            {/* 히어로 섹션 */}
            <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-amber-400 text-white px-6 pt-10 pb-14 relative overflow-hidden">
                {/* 배경 장식 */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />

                <div className="max-w-xl mx-auto relative">
                    <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 text-xs font-bold mb-5 backdrop-blur-sm">
                        🥕 당근마켓 개인 거래 전문
                    </div>
                    <h1 className="text-3xl font-black leading-tight mb-4">
                        당근 직거래,<br />
                        <span className="text-yellow-200">+100만원 더 받으세요!</span>
                    </h1>
                    <p className="text-orange-100 text-sm leading-relaxed mb-6">
                        카비어 진단평가사가 직접 현장에 방문해<br />
                        <strong className="text-white">차량 진단부터 계약까지 전부 대행</strong>해드립니다.
                    </p>

                    {/* 핵심 수치 */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { v: '100+', l: '진단 항목' },
                            { v: '98%', l: '고객 만족도' },
                            { v: '당일', l: '계약 완료' },
                        ].map(s => (
                            <div key={s.l} className="bg-white/20 rounded-2xl py-3 text-center backdrop-blur-sm border border-white/20">
                                <p className="text-xl font-black">{s.v}</p>
                                <p className="text-orange-100 text-[10px] font-bold mt-0.5">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 서비스 흐름 */}
            <div className="max-w-xl mx-auto px-6 -mt-4">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 mb-6">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-5">서비스 과정</p>
                    <div className="space-y-4">
                        {[
                            { icon: '📋', title: '신청 접수', desc: '아래 폼에 정보를 남겨주시면 상담사가 연락드려요' },
                            { icon: '🔍', title: '평가사 현장 방문', desc: '카비어 공인 평가사가 직접 찾아가 100+ 항목 진단' },
                            { icon: '📝', title: '계약 대행', desc: '협상부터 계약서 작성, 서류까지 전부 대신 처리' },
                            { icon: '💰', title: '최고가 매도 완료', desc: '안전하게 최고가로 차량을 넘기고 대금 수령' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                                    {step.icon}
                                </div>
                                <div>
                                    <p className="font-extrabold text-zinc-900 text-sm">{step.title}</p>
                                    <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 후기 */}
                <div className="mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">실제 고객 후기</p>
                    <div className="space-y-3">
                        {[
                            { name: '이*현', car: 'BMW 3시리즈', text: '직거래 처음인데 평가사분이 협상까지 도와주셔서 예상보다 120만원 더 받았어요!', stars: 5 },
                            { name: '김*수', car: '제네시스 G80', text: '계약서 작성도 다 해주셔서 너무 편했어요. 사기 걱정 없이 안전하게 팔았습니다.', stars: 5 },
                            { name: '박*진', car: '쏘렌토', text: '당근에서 직거래 하려다 카비어 썼는데 훨씬 높은 가격에 당일 계약 완료했습니다.', stars: 5 },
                        ].map((r, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-black text-orange-500">
                                        {r.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-zinc-800">{r.name}</p>
                                        <p className="text-[10px] text-slate-400">{r.car}</p>
                                    </div>
                                    <div className="ml-auto text-xs text-orange-400">{'★'.repeat(r.stars)}</div>
                                </div>
                                <p className="text-xs text-zinc-600 leading-relaxed">{r.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 신청 폼 */}
                <div className="mb-12">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">무료 상담 신청</p>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* 차주 정보 */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">01. 차주 정보</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold mb-1 block">차주 성명 *</label>
                                    <input
                                        required
                                        name="carOwner"
                                        placeholder="홍길동"
                                        value={formData.carOwner}
                                        onChange={handleChange}
                                        className="w-full border-b-2 border-slate-200 p-3 focus:border-orange-500 outline-none transition-all text-zinc-900 font-bold placeholder:text-zinc-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold mb-1 block">연락처 *</label>
                                    <PhoneInput
                                        value={formData.contact}
                                        onChange={(v) => setFormData(prev => ({ ...prev, contact: v }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 진단 장소 및 일시 */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">02. 진단 장소 및 일시</h3>

                            {/* 주소 */}
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold block">진단 장소 *</label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly required
                                        name="address"
                                        placeholder="주소 검색을 눌러주세요"
                                        value={formData.address}
                                        onClick={handleAddressSearch}
                                        className="flex-1 border-b-2 border-slate-200 p-3 bg-slate-50 text-slate-700 outline-none cursor-pointer rounded-t-lg font-bold placeholder:text-zinc-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddressSearch}
                                        className="bg-zinc-800 text-white px-4 rounded-xl text-xs font-bold active:scale-95 transition-transform whitespace-nowrap"
                                    >
                                        주소찾기
                                    </button>
                                </div>
                                <input
                                    id="karrot-detail-address"
                                    name="detailAddress"
                                    placeholder="상세주소 (예: 지하주차장 B1구역)"
                                    value={formData.detailAddress}
                                    onChange={handleChange}
                                    className="w-full border-b-2 border-slate-200 p-3 focus:border-orange-500 outline-none transition-all text-zinc-900 placeholder:text-zinc-300"
                                />
                            </div>

                            {/* 날짜/시간 */}
                            <div className="pt-4 border-t border-slate-50">
                                <DateTimeSelector onSelect={handleDateTimeSelect} />
                            </div>
                        </div>

                        {/* 메모 */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">03. 추가 전달사항 (선택)</h3>
                            <textarea
                                name="additionalMemo"
                                placeholder="차량 정보나 요청사항을 자유롭게 남겨주세요 (예: 2022년식 BMW 3시리즈, 흰색)"
                                value={formData.additionalMemo}
                                onChange={handleChange}
                                className="w-full h-24 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none text-sm text-zinc-700 placeholder:text-zinc-300"
                            />
                        </div>

                        {/* 안내 문구 */}
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4">
                            <p className="text-xs text-orange-700 font-bold leading-relaxed">
                                📌 신청 후 카비어 상담사가 직접 연락드려 일정 및 수수료를 안내해드립니다.
                                상담은 <strong>완전 무료</strong>이며, 진단 후 거래 성사 시에만 수수료가 발생합니다.
                            </p>
                        </div>

                        {/* 제출 버튼 */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={clsx(
                                'w-full py-5 rounded-2xl text-lg font-black shadow-xl transition-all',
                                isSubmitting
                                    ? 'bg-slate-300 cursor-not-allowed text-white'
                                    : 'bg-orange-500 text-white shadow-orange-200 active:scale-[0.98] hover:bg-orange-600'
                            )}
                        >
                            {isSubmitting ? '접수 중...' : '🥕 무료 상담 신청하기'}
                        </button>

                        <p className="text-center text-slate-400 text-[11px] leading-relaxed">
                            신청 시 <span className="underline">개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
                        </p>
                    </form>
                </div>

                {/* 하단 로고 */}
                <div className="text-center pb-10">
                    <p className="text-xs font-black text-orange-500 mb-1">C CARVIOR 카비어</p>
                    <p className="text-[10px] text-slate-400">차량 진단 · 거래 대행 전문 서비스</p>
                    <p className="text-[10px] text-slate-400 mt-1">고객센터 010-2285-6017</p>
                </div>
            </div>
        </div>
    );
}
