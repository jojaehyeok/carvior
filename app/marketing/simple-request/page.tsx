'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

/**
 * [내부 컴포넌트] 날짜 및 시간 선택기
 */
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
        <div className="space-y-6">
            <div>
                <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">방문 날짜 선택</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {dates.map((item) => (
                        <button
                            key={item.full}
                            type="button"
                            onClick={() => setSelectedDate(item.full)}
                            className={clsx(
                                "flex-shrink-0 w-14 h-20 rounded-xl flex flex-col items-center justify-center transition-all border",
                                selectedDate === item.full
                                    ? "bg-blue-600 border-blue-600 shadow-lg scale-105"
                                    : "bg-white border-slate-100"
                            )}
                        >
                            <span className={clsx("text-[10px] mb-1", selectedDate === item.full ? "text-blue-100" : "text-slate-400")}>
                                {item.dayName}
                            </span>
                            <span className={clsx("text-lg font-bold", selectedDate === item.full ? "text-white" : "text-slate-700", !selectedDate && item.isWeekend && "text-red-400")}>
                                {item.dateNum}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">방문 시간 선택</label>
                <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            disabled={!selectedDate}
                            className={clsx(
                                "py-3 rounded-xl text-sm font-medium border transition-all",
                                !selectedDate && "opacity-20",
                                selectedTime === time
                                    ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                                    : "bg-white border-slate-100 text-slate-600"
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

/**
 * [메인 페이지] 차바타 간편 진단 신청 폼
 */
export default function SimpleRequestPage() {
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
    const [carError, setCarError] = useState<string | null>(null); // 차량 중복 에러 상태

    // ✅ 실시간 차량 중복 체크 함수
    const checkDuplicateCar = async (carNum: string) => {
        if (carNum.length < 7) return;

        try {
            // 컨트롤러 경로와 맞춤: /v1/external/request/check-duplicate
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
        setFormData(prev => ({
            ...prev,
            preferredDateTime: `${date} ${time}`
        }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const cleanValue = name === 'carNumber' ? value.replace(/\s/g, '') : value;
        setFormData(prev => ({ ...prev, [name]: cleanValue }));

        // 차량 번호 입력 시 에러 초기화
        if (name === 'carNumber') setCarError(null);
    };

    // 차량 번호 입력 포커스 나갈 때 체크
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

        setIsSubmitting(true);

        try {
            const dbResponse = await fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, source: 'SIMPLE_FORM' }),
            });

            const dbResult = await dbResponse.json();

            if (dbResponse.ok) {
                // 알림톡 발송 (성공 시)
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
        <div className="min-h-screen bg-slate-50 pb-10 font-sans">
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <span className="text-2xl font-black text-blue-600 tracking-tighter">차바타</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">간편신청</span>
            </nav>

            <main className="max-w-xl mx-auto p-4 lg:p-8">
                <div className="mb-8 mt-4 text-center">
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                        <span className="text-red-600 font-black">30초면 끝나는</span> 간편 진단 신청
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm">정보만 남겨주시면 카비어 전문가가 찾아갑니다.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* 01. 차량 확인 */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">01. 차량 확인</h3>
                        <div className="space-y-4">
                            <div>
                                <input
                                    required
                                    name="carNumber"
                                    placeholder="차량번호 (예: 123가 4567)"
                                    className={clsx(
                                        "w-full text-lg font-bold border-b-2 p-3 outline-none transition-all",
                                        carError ? "border-red-500" : "border-slate-100 focus:border-blue-600"
                                    )}
                                    onChange={handleChange}
                                    onBlur={handleCarBlur}
                                />
                                {carError && <p className="text-red-500 text-xs mt-2 ml-1">{carError}</p>}
                            </div>
                            <input required name="carOwner" placeholder="차량 소유자 성함" className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                        </div>
                    </div>

                    {/* 02. 차량 상태 */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">02. 차량 상태</h3>
                        <div className="space-y-4">
                            {/* 연식 */}
                            <div>
                                <label className="text-xs text-slate-400 font-bold mb-1 block">차량 연식</label>
                                <select
                                    name="carYear"
                                    onChange={handleChange}
                                    className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all bg-transparent text-slate-700"
                                >
                                    <option value="">연식 선택</option>
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                        <option key={y} value={y}>{y}년</option>
                                    ))}
                                </select>
                            </div>
                            {/* 희망 판매가 */}
                            <div className="relative">
                                <label className="text-xs text-slate-400 font-bold mb-1 block">희망 판매가</label>
                                <input
                                    type="number"
                                    name="desiredPrice"
                                    placeholder="예: 1500"
                                    min="0"
                                    className="w-full border-b-2 border-slate-100 p-3 pr-14 focus:border-blue-600 outline-none transition-all"
                                    onChange={handleChange}
                                />
                                <span className="absolute right-3 bottom-3 text-sm text-slate-400 font-bold">만원</span>
                            </div>
                        </div>
                    </div>

                    {/* 03. 연락처 */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">03. 연락처</h3>
                        <div className="space-y-4">
                            <input required name="dealerName" placeholder="딜러님 성함 또는 상사명" className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                            <input required type="tel" name="contact" placeholder="연락처 (- 제외)" className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                        </div>
                    </div>

                    {/* 04. 장소 및 시간 */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">04. 장소 및 시간</h3>
                        <DateTimeSelector onDateTimeSelect={handleDateTimeChange} />
                        <div className="pt-4 border-t border-slate-50 space-y-4">
                            <div className="flex gap-2">
                                <input readOnly required name="address" placeholder="진단 장소 주소" className="flex-1 border-b-2 border-slate-100 p-3 bg-slate-50 text-slate-600 outline-none cursor-pointer rounded-t-lg" value={formData.address} onClick={handleAddressSearch} />
                                <button type="button" onClick={handleAddressSearch} className="bg-slate-800 text-white px-4 rounded-xl text-xs font-bold active:scale-95 transition-transform">주소찾기</button>
                            </div>
                            <input id="detailAddress" name="detailAddress" placeholder="상세주소 (층, 구역 등)" className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                        </div>
                    </div>

                    {/* 특이사항 */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <textarea name="additionalMemo" placeholder="추가 전달사항 (선택)" className="w-full h-24 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" onChange={handleChange} />
                    </div>

                    {/* 로고 섹션 */}
                    <div className="mb-10 px-2">
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">카비어와 함께하는 파트너사/고객사</p>
                        <div className="grid grid-cols-2 gap-4 items-center justify-items-center opacity-60 grayscale">
                            <img src="/anyonelogo.jpg" alt="anyonemotors" className="h-10 object-contain" />
                            <img src="/carvatarlogo.jpg" alt="carvatar" className="h-10 object-contain" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !!carError}
                        className={clsx(
                            "w-full py-5 rounded-2xl text-xl font-bold shadow-xl transition-all",
                            (isSubmitting || !!carError) ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 text-white shadow-blue-200 active:scale-[0.98] hover:bg-blue-700"
                        )}
                    >
                        {isSubmitting ? '접수 중...' : '지금 진단 신청하기'}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-[11px] mt-8 leading-relaxed">
                    © 2026 CARVIOR. All rights reserved. <br />
                    본 서비스는 원활한 중고차 처리를 돕는 비대면/방문 진단 전문 서비스입니다.
                </p>
            </main>
        </div>
    );
}