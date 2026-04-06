'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';

const COMPANY_LABELS: Record<string, string> = {
    'anyone-motors': '애니원 모터스',
    'carvatar': '차바타',
};

function DateTimeSelector({ onDateTimeSelect }: { onDateTimeSelect: (date: string, time: string) => void }) {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');

    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            dayName: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
            dateNum: d.getDate(),
            isWeekend: d.getDay() === 0 || d.getDay() === 6,
        };
    });

    const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    useEffect(() => {
        if (selectedDate && selectedTime) {
            onDateTimeSelect(selectedDate, selectedTime);
        }
    }, [selectedDate, selectedTime, onDateTimeSelect]);

    return (
        <div className="space-y-5">
            <div>
                <label className="text-[10px] font-extrabold text-zinc-500 mb-3 block uppercase tracking-widest">방문 날짜</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {dates.map((item) => (
                        <button
                            key={item.full}
                            type="button"
                            onClick={() => setSelectedDate(item.full)}
                            className={clsx(
                                'flex-shrink-0 w-13 h-[72px] rounded-xl flex flex-col items-center justify-center transition-all border',
                                selectedDate === item.full
                                    ? 'bg-zinc-900 border-zinc-900 shadow-lg scale-105'
                                    : 'bg-white border-zinc-200 hover:border-zinc-400'
                            )}
                            style={{ minWidth: '52px' }}
                        >
                            <span className={clsx('text-[9px] mb-1 font-bold', selectedDate === item.full ? 'text-zinc-400' : item.isWeekend ? 'text-red-400' : 'text-zinc-400')}>
                                {item.dayName}
                            </span>
                            <span className={clsx('text-base font-black', selectedDate === item.full ? 'text-white' : item.isWeekend ? 'text-red-500' : 'text-zinc-800')}>
                                {item.dateNum}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] font-extrabold text-zinc-500 mb-3 block uppercase tracking-widest">방문 시간</label>
                <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            disabled={!selectedDate}
                            className={clsx(
                                'py-2.5 rounded-xl text-sm font-bold border transition-all',
                                !selectedDate && 'opacity-25 cursor-not-allowed',
                                selectedTime === time
                                    ? 'bg-zinc-900 border-zinc-900 text-white'
                                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                            )}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SimpleRequestByCompanyPage() {
    const params = useParams();
    const companyId = typeof params?.id === 'string' ? params.id : '';
    const companyLabel = COMPANY_LABELS[companyId] || companyId;

    const [formData, setFormData] = useState({
        carNumber: '',
        carOwner: '',
        carYear: '',
        desiredPrice: '',
        dealerName: '',
        contact: '',
        address: '',
        detailAddress: '',
        preferredDateTime: '',
        additionalMemo: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [carError, setCarError] = useState<string | null>(null);

    const checkDuplicateCar = async (carNum: string) => {
        if (carNum.length < 7) return;
        try {
            const res = await fetch(`https://carvior.store/api/v1/external/request/check-duplicate?carNumber=${encodeURIComponent(carNum)}`);
            const result = await res.json();
            if (result.isDuplicate) {
                setCarError('이미 신청된 차량입니다. 기존 진단이 완료된 후 신청 가능합니다.');
            } else {
                setCarError(null);
            }
        } catch (e) {
            console.error('중복 체크 실패', e);
        }
    };

    const handleDateTimeChange = useCallback((date: string, time: string) => {
        setFormData(prev => ({ ...prev, preferredDateTime: `${date} ${time}` }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const cleanValue = name === 'carNumber' ? value.replace(/\s/g, '') : value;
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
        if (name === 'carNumber') setCarError(null);
    };

    const handleCarBlur = () => {
        if (formData.carNumber) checkDuplicateCar(formData.carNumber);
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
                    document.getElementById('detailAddress')?.focus();
                },
            }).open();
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || carError) return;
        if (!formData.preferredDateTime) {
            alert('방문 날짜와 시간을 선택해주세요.');
            return;
        }
        if (!companyId) {
            alert('잘못된 접근입니다. 올바른 신청 링크를 사용해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dbResponse = await fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, source: companyId }),
            });

            const dbResult = await dbResponse.json();

            if (dbResponse.ok) {
                await fetch('/api/kakao/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dealerName: formData.dealerName,
                        contact: formData.contact,
                        carNumber: formData.carNumber,
                        preferredDateTime: formData.preferredDateTime,
                    }),
                });

                alert(`✅ 신청 완료!\n정상적으로 접수되었습니다.`);
                window.location.reload();
            } else {
                throw new Error(dbResult.message || '서버 저장 실패');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 font-sans">
            {/* ── NAV ── */}
            <nav className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <span className="text-xl font-black text-zinc-900 tracking-tight">CARVIOR</span>
                <div className="flex items-center gap-2">
                    {companyLabel && (
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full font-bold tracking-wide">{companyLabel}</span>
                    )}
                    <span className="text-[10px] bg-zinc-900 text-white px-2.5 py-1 rounded-full font-extrabold tracking-wide">B2B</span>
                </div>
            </nav>

            {/* ── HERO ── */}
            <div className="bg-white px-6 pt-10 pb-8 border-b border-zinc-100">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">딜러 전용 · 간편 신청</span>
                        <span className="text-zinc-300">|</span>
                        <span className="text-[10px] font-bold text-zinc-400">📍 서울 · 경기 · 인천</span>
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 leading-tight mb-2">
                        진단 신청서
                    </h1>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        차량 정보를 입력하면 카비어 전문 평가사가 직접 방문합니다.<br />
                        <span className="text-zinc-700 font-semibold">수도권(서울·경기·인천) 지역</span> 운영 중
                    </p>
                </div>
            </div>

            {/* ── FORM ── */}
            <main className="max-w-xl mx-auto px-4 py-6 pb-16">
                <form onSubmit={handleFormSubmit} className="space-y-3">

                    {/* 01. 차량 확인 */}
                    <div className="bg-white rounded-2xl p-6">
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-5">01 · 차량 확인</p>
                        <div className="space-y-4">
                            <div>
                                <input
                                    required
                                    name="carNumber"
                                    placeholder="차량번호 (예: 123가4567)"
                                    className={clsx(
                                        'w-full text-lg font-black border-b-2 pb-2 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900',
                                        carError ? 'border-red-400' : 'border-zinc-100 focus:border-zinc-900'
                                    )}
                                    onChange={handleChange}
                                    onBlur={handleCarBlur}
                                />
                                {carError && <p className="text-red-500 text-xs mt-2">{carError}</p>}
                            </div>
                            <input
                                required
                                name="carOwner"
                                placeholder="차량 소유자 성함"
                                className="w-full border-b-2 border-zinc-100 pb-2 focus:border-zinc-900 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 02. 차량 상태 */}
                    <div className="bg-white rounded-2xl p-6">
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-5">02 · 차량 상태</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-1.5 block">차량 연식</label>
                                <select
                                    name="carYear"
                                    onChange={handleChange}
                                    className="w-full border-b-2 border-zinc-100 pb-2 focus:border-zinc-900 outline-none transition-colors bg-transparent text-zinc-700 font-medium"
                                >
                                    <option value="">연식 선택</option>
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                        <option key={y} value={y}>{y}년</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-1.5 block">희망 판매가</label>
                                <input
                                    type="number"
                                    name="desiredPrice"
                                    placeholder="예: 1500"
                                    min="0"
                                    className="w-full border-b-2 border-zinc-100 pb-2 pr-10 focus:border-zinc-900 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                    onChange={handleChange}
                                />
                                <span className="absolute right-0 bottom-2 text-xs text-zinc-400 font-bold">만원</span>
                            </div>
                        </div>
                    </div>

                    {/* 03. 딜러 정보 */}
                    <div className="bg-white rounded-2xl p-6">
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-5">03 · 딜러 정보</p>
                        <div className="space-y-4">
                            <input
                                required
                                name="dealerName"
                                placeholder="딜러 성함 또는 상사명"
                                className="w-full border-b-2 border-zinc-100 pb-2 focus:border-zinc-900 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                            <input
                                required
                                type="tel"
                                name="contact"
                                placeholder="연락처 (- 제외)"
                                className="w-full border-b-2 border-zinc-100 pb-2 focus:border-zinc-900 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 04. 장소 및 시간 */}
                    <div className="bg-white rounded-2xl p-6 space-y-6">
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">04 · 장소 및 시간</p>
                        <DateTimeSelector onDateTimeSelect={handleDateTimeChange} />
                        <div className="pt-4 border-t border-zinc-50 space-y-4">
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    required
                                    name="address"
                                    placeholder="진단 장소 주소"
                                    className="flex-1 border-b-2 border-zinc-100 pb-2 bg-transparent text-zinc-700 outline-none cursor-pointer font-medium placeholder:text-zinc-300"
                                    value={formData.address}
                                    onClick={handleAddressSearch}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddressSearch}
                                    className="bg-zinc-900 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold active:scale-95 transition-transform whitespace-nowrap"
                                >
                                    주소 찾기
                                </button>
                            </div>
                            <input
                                id="detailAddress"
                                name="detailAddress"
                                placeholder="상세주소 (층, 구역 등)"
                                className="w-full border-b-2 border-zinc-100 pb-2 focus:border-zinc-900 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 추가 전달사항 */}
                    <div className="bg-white rounded-2xl p-6">
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4">추가 전달사항 (선택)</p>
                        <textarea
                            name="additionalMemo"
                            placeholder="특이사항, 요청사항 등"
                            className="w-full h-20 text-sm text-zinc-700 placeholder:text-zinc-300 outline-none resize-none leading-relaxed"
                            onChange={handleChange}
                        />
                    </div>

                    {/* 지역 안내 */}
                    <div className="flex items-start gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5">
                        <span className="text-base flex-shrink-0">📍</span>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                            현재 <span className="text-zinc-800 font-bold">서울 · 경기 · 인천 (수도권)</span> 지역에서 운영 중입니다.
                            타 지역은 순차적으로 확대 예정입니다.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !!carError}
                        className={clsx(
                            'w-full py-5 rounded-2xl text-base font-extrabold transition-all',
                            (isSubmitting || !!carError)
                                ? 'bg-zinc-300 text-zinc-400 cursor-not-allowed'
                                : 'bg-zinc-900 text-white active:scale-[0.98] shadow-lg shadow-zinc-300'
                        )}
                    >
                        {isSubmitting ? '접수 중...' : '진단 신청하기 →'}
                    </button>
                </form>

                <p className="text-center text-zinc-400 text-[10px] mt-8 leading-relaxed">
                    © 2026 CARVIOR. All rights reserved.<br />
                    방문 진단 전문 서비스 · 딜러 전용
                </p>
            </main>
        </div>
    );
}
