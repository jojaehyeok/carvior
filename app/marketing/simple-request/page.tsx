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
        dealerName: '',
        contact: '',
        address: '',
        detailAddress: '',
        preferredDateTime: '', // 날짜 + 시간 합쳐진 값
        additionalMemo: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 날짜/시간 선택 시 폼 데이터 업데이트
    const handleDateTimeChange = useCallback((date: string, time: string) => {
        setFormData(prev => ({
            ...prev,
            preferredDateTime: `${date} ${time}`
        }));
    }, []);

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
        } else {
            alert('주소 서비스 스크립트가 로드되지 않았습니다.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return; // 중복 클릭 방지
        if (!formData.preferredDateTime) {
            alert('방문 날짜와 시간을 선택해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. NestJS 서버 DB 저장 (운영 서버 도메인 사용)
            const dbResponse = await fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    source: 'SIMPLE_FORM' // 유입 경로 구분용
                }),
            });

            const dbResult = await dbResponse.json();

            if (dbResponse.ok) {
                // 2. DB 저장 성공 시 알림톡 발송 (Next.js 로컬 API Route 호출)
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

                alert(`✅ 신청 완료!\n${formData.dealerName}님, 접수가 성공적으로 처리되었습니다.\n카카오톡 안내 메시지를 확인해주세요.`);
                // 성공 후 새로고침 또는 초기화
                window.location.reload();
            } else {
                throw new Error(dbResult.message || '서버 저장 실패');
            }

        } catch (error) {
            console.error('연동 에러:', error);
            alert('서버와 연결이 원활하지 않습니다. 고객센터로 문의 부탁드립니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
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
                            <input required name="carNumber" placeholder="차량번호 (예: 123가 4567)" className="w-full text-lg font-bold border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                            <input required name="carOwner" placeholder="차량 소유자 성함" className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                        </div>
                    </div>

                    {/* 02. 연락처 */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">02. 연락처</h3>
                        <div className="space-y-4">
                            <input required name="dealerName" placeholder="딜러님 성함 또는 상사명" className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                            <input required type="tel" name="contact" placeholder="연락처 (- 제외)" className="w-full border-b-2 border-slate-100 p-3 focus:border-blue-600 outline-none transition-all" onChange={handleChange} />
                        </div>
                    </div>

                    {/* 03. 장소 및 시간 */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">03. 장소 및 시간</h3>
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

                    {/* 파트너사/고객사 로고 */}
                    <div className="mb-10 px-2">
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
                            카비어와 함께하는 파트너사/고객사
                        </p>
                        <div className="grid grid-cols-2 gap-4 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all">
                            <img src="/anyonelogo.jpg" alt="anyonemotors" className="h-10 object-contain" />
                            <img src="/carvatarlogo.jpg" alt="carvatar" className="h-10 object-contain" />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={clsx(
                            "w-full py-5 rounded-2xl text-xl font-bold shadow-xl transition-all",
                            isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 text-white shadow-blue-200 active:scale-[0.98] hover:bg-blue-700"
                        )}
                    >
                        {isSubmitting ? '접수 중...' : '지금 진단 신청하기'}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-[11px] mt-8 leading-relaxed">
                    © 2026 CARVIOR. All rights reserved. <br />
                    본 서비스는 원활한 중고차 처리를 돕는 <br />비대면/방문 진단 전문 서비스입니다.
                </p>
            </main>
        </div>
    );
}