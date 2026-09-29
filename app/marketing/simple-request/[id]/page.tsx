'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';
import PrivacyModal from '@/components/PrivacyModal';

const COMPANY_LABELS: Record<string, string> = {
    'anyone-motors': '애니원 모터스',
    'gwangmyeong-motors': '광명모터스',
    'carvatar': '차바타',
};

function DateTimeSelector({ onDateTimeSelect }: { onDateTimeSelect: (date: string, time: string) => void }) {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');

    const dates = Array.from({ length: 60 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            dayName: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
            dateNum: d.getDate(),
            isWeekend: d.getDay() === 0 || d.getDay() === 6,
        };
    });

    const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

    useEffect(() => {
        if (selectedDate && selectedTime) {
            onDateTimeSelect(selectedDate, selectedTime);
        }
    }, [selectedDate, selectedTime, onDateTimeSelect]);

    return (
        <div className="space-y-5">
            <div>
                <label className="text-[10px] font-extrabold text-zinc-500 mb-3 block uppercase tracking-widest">방문 날짜</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {dates.map((item) => (
                        <button
                            key={item.full}
                            type="button"
                            onClick={() => setSelectedDate(item.full)}
                            className={clsx(
                                'flex-shrink-0 w-13 h-[72px] rounded-xl flex flex-col items-center justify-center transition-all border',
                                selectedDate === item.full
                                    ? 'bg-violet-600 border-violet-600 shadow-lg scale-105'
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
                                    ? 'bg-violet-600 border-violet-600 text-white'
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

    // 카톡으로 받은 접수 내용을 붙여넣어 폼을 자동으로 채우는 기능 —
    // 접수 직원이 손으로 옮겨 적던 걸 대신한다. 채우기만 하고 제출은 사람이 한다.
    const [pasteText, setPasteText] = useState('');
    const [parsing, setParsing] = useState(false);
    const [parseMsg, setParseMsg] = useState('');
    const [ocrLoading, setOcrLoading] = useState(false);
    const [isSelfOwned, setIsSelfOwned] = useState(false);

    const [formData, setFormData] = useState({
        carNumber: '',
        carOwner: '',
        carModel: '',
        carYear: '',
        desiredPrice: '',
        dealerName: '',
        contact: '',
        customerContact: '',
        address: '',
        detailAddress: '',
        preferredDateTime: '',
        additionalMemo: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 타이핑할 때마다 서버를 때리지 않도록 300ms 쉬었을 때만 조회한다.
    const fetchDealerSuggests = useCallback((keyword: string) => {
        if (!keyword.trim() || !companyId) {
            setDealerSuggests([]);
            return;
        }
        fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/external/request/dealer-suggest?source=${encodeURIComponent(companyId)}&q=${encodeURIComponent(keyword)}`)
            .then(r => (r.ok ? r.json() : []))
            .then(list => {
                setDealerSuggests(Array.isArray(list) ? list : []);
                setShowDealerSuggests(true);
            })
            .catch(() => setDealerSuggests([]));
    }, [companyId]);

    useEffect(() => {
        const t = setTimeout(() => fetchDealerSuggests(formData.dealerName), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.dealerName]);
    const [carError, setCarError] = useState<string | null>(null);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // 다음 우편번호 검색은 도로명주소만 색인돼 있어 "벤츠강남전시장" 같은 전시장/상호명으로는
    // 검색이 안 됨 — 카카오 로컬 키워드검색(대시보드 지도 화면과 동일 REST 키)으로 교체
    // 딜러 자동완성 — 같은 딜러가 반복해서 접수하는데 매번 연락처를 찾아 입력해야 해서,
    // 지난 접수 기록에서 이름으로 찾아 연락처까지 한 번에 채워준다.
    const [dealerSuggests, setDealerSuggests] = useState<{ dealerName: string; contact: string; count: number }[]>([]);
    const [showDealerSuggests, setShowDealerSuggests] = useState(false);
    // 번호 없이 접수됐던 딜러를 고르면 연락처 칸으로 바로 커서를 옮긴다 — 그 자리에서 번호를
    // 넣으면 이번 접수와 함께 저장돼, 다음부터는 자동완성이 번호까지 채워준다.
    const contactInputRef = useRef<HTMLInputElement>(null);

    const [placeQuery, setPlaceQuery] = useState('');
    const [placeResults, setPlaceResults] = useState<{ name: string; address: string }[]>([]);
    const [showPlaceResults, setShowPlaceResults] = useState(false);
    const [searchingPlace, setSearchingPlace] = useState(false);

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

    // 붙여넣은 글에서 항목을 뽑아 빈칸을 채운다. 이미 입력해둔 값은 덮어쓰지 않는다 —
    // 사람이 고쳐둔 값을 자동 채우기가 되돌리면 알아채기 어렵다.
    const handleAutoFill = async () => {
        if (!pasteText.trim()) { setParseMsg('붙여넣을 내용을 입력해주세요.'); return; }
        setParsing(true);
        setParseMsg('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/external/request/parse-intake`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: pasteText }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || '내용을 읽지 못했습니다.');

            applyParsed(data);
        } catch (e) {
            setParseMsg(e instanceof Error ? e.message : '내용을 읽지 못했습니다.');
        } finally {
            setParsing(false);
        }
    };

    // 카톡 화면 캡처·명함 사진에서 글자를 읽어 같은 방식으로 채운다.
    // 사진 1장당 OCR 호출 1건이 과금되므로(월 100건 무료, 초과 시 건당 약 3원)
    // 글로 받은 내용은 붙여넣기를 쓰고 사진일 때만 사용한다.
    const runOcr = async (file: File) => {
        setOcrLoading(true);
        setParseMsg('');
        try {
            const form = new FormData();
            form.append('image', file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/external/request/parse-intake/image`, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || '사진에서 글자를 읽지 못했습니다.');
            // 읽어낸 원문을 붙여넣기 칸에 보여준다 — 잘못 읽은 곳을 눈으로 확인하고 고칠 수 있게.
            if (data.text) setPasteText(data.text);
            applyParsed(data);
        } catch (err) {
            setParseMsg(err instanceof Error ? err.message : '사진에서 글자를 읽지 못했습니다.');
        } finally {
            setOcrLoading(false);
        }
    };

    const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // 같은 사진을 다시 고를 수 있게 초기화
        if (file) await runOcr(file);
    };

    // 캡처를 파일로 저장하지 않고 Ctrl+V로 바로 붙여넣는 경우 — 클립보드에 이미지가 있으면
    // 그걸 OCR로 보낸다. 글자를 붙여넣은 경우에는 평소대로 입력칸에 들어가게 둔다.
    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const item = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith('image/'));
        const file = item?.getAsFile();
        if (!file) return;
        e.preventDefault();
        await runOcr(file);
    };

    // 캡처 파일을 끌어다 놓는 경우도 같은 경로로 처리한다.
    const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
        const file = Array.from(e.dataTransfer?.files ?? []).find(f => f.type.startsWith('image/'));
        if (!file) return;
        e.preventDefault();
        await runOcr(file);
    };

    // 파서가 돌려준 항목을 폼에 채운다(글·사진 공통).
    const applyParsed = (data: { fields?: Record<string, string> }) => {
            const f: Record<string, string> = data.fields ?? {};
            const filled: string[] = [];
            setFormData(prev => {
                const next = { ...prev };
                const labels: Record<string, string> = {
                    carNumber: '차량번호', carOwner: '소유자', carModel: '차량명', carYear: '연식', desiredPrice: '희망가',
                    dealerName: '딜러', contact: '딜러 연락처', customerContact: '고객 연락처',
                    detailAddress: '상세주소', additionalMemo: '특이사항',
                };
                for (const key of Object.keys(labels)) {
                    if (f[key] && !String(prev[key as keyof typeof prev] || '').trim()) {
                        (next as Record<string, string>)[key] = f[key];
                        filled.push(labels[key]);
                    }
                }
                return next;
            });
            // 주소는 검색으로 확정해야 좌표가 잡힌다 — 검색창에 넣어만 두고 확인은 사람이 한다.
            if (f.address) setPlaceQuery(f.address);

            setParseMsg(
                filled.length === 0 && !f.address
                    ? '채울 수 있는 항목을 찾지 못했어요. 직접 입력해주세요.'
                    : `${filled.join(', ')}${filled.length ? ' 을(를) 채웠어요.' : ''}${f.address ? ' 주소는 아래에서 검색을 눌러 확인해주세요.' : ''}`.trim(),
            );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const cleanValue = name === 'carNumber' ? value.replace(/\s/g, '') : value;
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
        if (name === 'carNumber') setCarError(null);
    };

    const handleCarBlur = () => {
        if (formData.carNumber) checkDuplicateCar(formData.carNumber);
    };

    const searchPlace = async () => {
        if (!placeQuery.trim()) return;
        setSearchingPlace(true);
        try {
            const res = await fetch(
                `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(placeQuery)}`,
                { headers: { Authorization: 'KakaoAK 5d73c6482159874735a29becf6849e11' } },
            );
            const data = await res.json();
            const docs = (data?.documents ?? []).slice(0, 8).map((d: any) => ({
                name: d.place_name as string,
                address: (d.road_address_name || d.address_name) as string,
            }));
            setPlaceResults(docs);
            setShowPlaceResults(true);
        } catch {
            alert('위치 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setSearchingPlace(false);
        }
    };

    const selectPlace = (p: { name: string; address: string }) => {
        setFormData(prev => ({ ...prev, address: p.name ? `${p.address} (${p.name})` : p.address }));
        setShowPlaceResults(false);
        setPlaceQuery('');
        document.getElementById('detailAddress')?.focus();
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || carError) return;
        if (!privacyAgreed) {
            alert('개인정보 수집·이용에 동의해주세요.');
            return;
        }
        if (!formData.address.trim()) {
            alert('진단 장소를 검색해서 선택해주세요.');
            return;
        }
        if (!formData.preferredDateTime) {
            alert('방문 날짜와 시간을 선택해주세요.');
            return;
        }
        if (!formData.contact.trim() && !formData.customerContact.trim()) {
            alert('딜러 연락처 또는 고객 연락처 중 최소 하나는 입력해주세요.');
            return;
        }
        if (!companyId) {
            alert('잘못된 접근입니다. 올바른 신청 링크를 사용해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 딜러가 신청 시점엔 차량번호/소유자를 모르는 경우가 대부분이라
            // 비워두면 "미정"으로 접수하고, 진단 방문 시 평가사가 실제 정보로 채운다.
            const submitData = {
                ...formData,
                carNumber: formData.carNumber || '미정',
                carOwner: formData.carOwner || '미정',
            };
            const dbResponse = await fetch('https://carvior.store/api/v1/external/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...submitData, source: isSelfOwned ? `self-${companyId}` : companyId, additionalMemo: formData.additionalMemo.trim(), privacyAgreed }),
            });

            const dbResult = await dbResponse.json();

            if (dbResponse.ok) {
                await fetch('/api/kakao/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dealerName: formData.dealerName,
                        contact: formData.contact,
                        carNumber: submitData.carNumber,
                        preferredDateTime: formData.preferredDateTime,
                    }),
                });

                alert(
                    dbResult.restricted
                        ? `✅ 접수 완료!\n${dbResult.message}`
                        : `✅ 신청 완료!\n정상적으로 접수되었습니다.`
                );
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
        <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-violet-50 font-sans">
            {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
            {/* ── NAV ── */}
            <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex justify-center items-center gap-2 sticky top-0 z-50">
                {companyLabel && (
                    <span className="text-sm font-bold text-zinc-700">{companyLabel}</span>
                )}
                <span className="text-[10px] bg-violet-600 text-white px-2.5 py-1 rounded-full font-extrabold tracking-wide">B2B</span>
            </nav>
            {/* ── 지역 안내 ── */}
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-2.5 text-center">
                <p className="text-[11px] text-zinc-500">📍 현재 <strong className="text-zinc-700">서울 · 경기 · 인천 (수도권)</strong> 지역에서 운영 중입니다. 타 지역은 순차적으로 확대 예정입니다.</p>
            </div>

            {/* ── HERO ── */}
            <div className="bg-gradient-to-b from-white to-violet-50/60 px-6 pt-12 pb-10 border-b border-violet-100">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest">딜러 전용 · 간편 신청</span>
                        <span className="text-zinc-300">|</span>
                        <span className="text-[10px] font-bold text-zinc-400">📍 서울 · 경기 · 인천</span>
                    </div>
                    <h1 className="text-3xl font-black leading-tight mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                        진단 신청서
                    </h1>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        차량 정보를 입력하면 카비어 진단 평가사가 직접 방문합니다.<br />
                        <span className="text-zinc-700 font-semibold">수도권(서울·경기·인천) 지역</span> 운영 중
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer select-none mt-3">
                        <input
                            type="checkbox"
                            checked={isSelfOwned}
                            onChange={e => setIsSelfOwned(e.target.checked)}
                            className="w-4 h-4 accent-zinc-900"
                        />
                        <span className="text-sm font-medium text-zinc-600">자체 신청 접수</span>
                    </label>
                </div>
            </div>

            {/* ── FORM ── */}
            <main className="max-w-xl mx-auto px-4 py-6 pb-16">
                <form onSubmit={handleFormSubmit} className="space-y-3">

                    {/* 00. 카톡 내용 붙여넣기 — 접수 직원이 손으로 옮겨 적던 걸 대신한다 */}
                    <div className="bg-white rounded-3xl p-6 border border-violet-100 shadow-sm shadow-violet-100/60">
                        <p className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest mb-2">
                            빠른 접수 · 선택
                        </p>
                        <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                            카톡으로 받은 내용을 그대로 붙여넣고 자동 채우기를 누르면 아래 항목이 채워집니다.
                            캡처 이미지는 저장하지 않고 이 칸에 <span className="font-bold text-zinc-700">Ctrl+V로 바로 붙여넣거나</span> 끌어다 놓아도 됩니다.
                            채워진 내용은 꼭 확인하고 제출해주세요.
                        </p>
                        <textarea
                            value={pasteText}
                            onChange={e => setPasteText(e.target.value)}
                            onPaste={handlePaste}
                            onDrop={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            rows={4}
                            placeholder={'예)\n차량번호 : 31루 8635\n차종 : 투싼 ix\n주행거리 : 24만km\n청담동 40-24\n차주 : 010-0000-0000'}
                            className="w-full border border-violet-100 bg-violet-50/40 rounded-2xl p-3 text-sm outline-none focus:border-violet-400 focus:bg-white transition-colors placeholder:text-zinc-300 text-zinc-900"
                        />
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                type="button"
                                onClick={handleAutoFill}
                                disabled={parsing || !pasteText.trim()}
                                className="bg-violet-600 disabled:bg-violet-200 text-white px-4 py-2 rounded-xl text-xs font-extrabold active:scale-95 transition-transform whitespace-nowrap"
                            >
                                {parsing ? '읽는 중' : '자동 채우기'}
                            </button>
                            <label className="bg-white border border-violet-200 text-violet-700 px-4 py-2 rounded-xl text-xs font-extrabold active:scale-95 hover:bg-violet-50 transition-colors whitespace-nowrap cursor-pointer">
                                {ocrLoading ? '사진 읽는 중' : '사진으로 접수'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={ocrLoading}
                                    onChange={handlePhotoPick}
                                />
                            </label>
                            {parseMsg && <p className="text-xs text-zinc-500 flex-1">{parseMsg}</p>}
                        </div>
                    </div>

                    {/* 01. 차량 확인 */}
                    <div className="bg-white rounded-3xl p-6 border border-violet-100 shadow-sm shadow-violet-100/60">
                        <p className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest mb-1.5">01 · 차량 확인</p>
                        <p className="text-sm font-semibold text-zinc-400 mb-5">차량번호·소유자 정보는 선택사항입니다</p>
                        <div className="space-y-4">
                            <div>
                                <input
                                    value={formData.carNumber}
                                    name="carNumber"
                                    placeholder="차량번호 (예: 123가4567)"
                                    className={clsx(
                                        'w-full text-lg font-black border-b-2 pb-2 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900',
                                        carError ? 'border-red-400' : 'border-zinc-100 focus:border-violet-500'
                                    )}
                                    onChange={handleChange}
                                    onBlur={handleCarBlur}
                                />
                                {carError && <p className="text-red-500 text-xs mt-2">{carError}</p>}
                            </div>
                            <input
                                value={formData.carOwner}
                                name="carOwner"
                                placeholder="차량 소유자 성함"
                                className="w-full border-b-2 border-violet-100 pb-2 focus:border-violet-500 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                            <input
                                value={formData.carModel}
                                name="carModel"
                                placeholder="차량명 (선택 · 예: S450L, 그랜드 체로키)"
                                className="w-full border-b-2 border-violet-100 pb-2 focus:border-violet-500 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 02. 차량 상태 */}
                    <div className="bg-white rounded-3xl p-6 border border-violet-100 shadow-sm shadow-violet-100/60">
                        <p className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest mb-1.5">02 · 차량 상태</p>
                        <p className="text-sm font-semibold text-zinc-400 mb-5">차량 연식·희망 매입가는 선택사항입니다</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-1.5 block">차량 연식</label>
                                <select
                                    value={formData.carYear}
                                    name="carYear"
                                    onChange={handleChange}
                                    className="w-full border-b-2 border-violet-100 pb-2 focus:border-violet-500 outline-none transition-colors bg-transparent text-zinc-700 font-medium"
                                >
                                    <option value="">연식 선택</option>
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                        <option key={y} value={y}>{y}년</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-1.5 block">희망 매입가</label>
                                <input
                                    type="number"
                                    value={formData.desiredPrice}
                                    name="desiredPrice"
                                    placeholder="예: 1500"
                                    min="0"
                                    className="w-full border-b-2 border-violet-100 pb-2 pr-10 focus:border-violet-500 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                    onChange={handleChange}
                                />
                                <span className="absolute right-0 bottom-2 text-xs text-zinc-400 font-bold">만원</span>
                            </div>
                        </div>
                    </div>

                    {/* 03. 딜러 정보 */}
                    <div className="bg-white rounded-3xl p-6 border border-violet-100 shadow-sm shadow-violet-100/60">
                        <p className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest mb-5">03 · 딜러 정보</p>
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    required
                                    name="dealerName"
                                    autoComplete="off"
                                    value={formData.dealerName}
                                    placeholder="딜러 성함 또는 상사명"
                                    className="w-full border-b-2 border-violet-100 pb-2 focus:border-violet-500 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                    onChange={handleChange}
                                    onFocus={() => dealerSuggests.length > 0 && setShowDealerSuggests(true)}
                                    // 목록을 누르는 순간 blur가 먼저 일어나 목록이 사라지면 선택이 안 된다 —
                                    // 클릭이 처리될 시간을 주고 닫는다.
                                    onBlur={() => setTimeout(() => setShowDealerSuggests(false), 150)}
                                />
                                {showDealerSuggests && dealerSuggests.length > 0 && (
                                    <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                                        {dealerSuggests.map((d) => (
                                            <li key={`${d.dealerName}-${d.contact}`}>
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition-colors"
                                                    onClick={() => {
                                                        // 이름과 연락처를 한 번에 채운다 — 이게 이 기능의 목적이다.
                                                        // 번호 없는 후보면 이름만 채우고, 이미 입력해둔 연락처는 지우지 않는다.
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            dealerName: d.dealerName,
                                                            contact: d.contact || prev.contact,
                                                        }));
                                                        setShowDealerSuggests(false);
                                                        if (!d.contact) setTimeout(() => contactInputRef.current?.focus(), 0);
                                                    }}
                                                >
                                                    <span className="block text-sm font-semibold text-zinc-900">{d.dealerName}</span>
                                                    <span className="block text-xs text-zinc-500 mt-0.5">
                                                        {d.contact || <span className="text-zinc-400">번호 없음 · 선택 후 직접 입력</span>}
                                                        {d.count > 1 && <span className="ml-2 text-zinc-400">이전 접수 {d.count}건</span>}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <input
                                ref={contactInputRef}
                                type="tel"
                                name="contact"
                                value={formData.contact}
                                placeholder="딜러 연락처 (선택 · - 제외)"
                                className="w-full border-b-2 border-violet-100 pb-2 focus:border-violet-500 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                            <div>
                                <input
                                    type="tel"
                                    value={formData.customerContact}
                                    name="customerContact"
                                    placeholder="고객 연락처 (선택 · - 제외)"
                                    className="w-full border-b-2 border-violet-100 pb-2 focus:border-violet-500 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                    onChange={handleChange}
                                />
                                <p className="text-[11px] text-zinc-400 mt-1.5">
                                    평가사가 전시장이 아닌 고객에게 직접 방문해야 하면 입력해주세요. 전시장 방문이면 비워두세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 04. 장소 및 시간 */}
                    <div className="bg-white rounded-3xl p-6 space-y-6 border border-violet-100 shadow-sm shadow-violet-100/60">
                        <p className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest">04 · 장소 및 시간</p>
                        <DateTimeSelector onDateTimeSelect={handleDateTimeChange} />
                        <div className="pt-4 border-t border-zinc-50 space-y-4">
                            {formData.address ? (
                                <div className="flex items-start justify-between gap-3">
                                    <p className="flex-1 pb-2 border-b-2 border-violet-100 text-zinc-700 font-medium">{formData.address}</p>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, address: '' }))}
                                        className="text-xs text-zinc-400 shrink-0 hover:text-zinc-600"
                                    >
                                        변경
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input
                                            value={placeQuery}
                                            onChange={e => setPlaceQuery(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchPlace(); } }}
                                            placeholder="장소를 입력한 후 검색을 눌러주세요 (예: 벤츠강남전시장)"
                                            className="flex-1 border-b-2 border-violet-100 pb-2 bg-transparent text-zinc-700 outline-none font-medium placeholder:text-zinc-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={searchPlace}
                                            disabled={searchingPlace}
                                            className="bg-violet-600 disabled:bg-violet-200 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold active:scale-95 transition-transform whitespace-nowrap"
                                        >
                                            {searchingPlace ? '검색 중' : '검색'}
                                        </button>
                                    </div>
                                    {showPlaceResults && placeResults.length > 0 && (
                                        <div className="mt-2 border border-zinc-100 rounded-xl overflow-hidden divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                                            {placeResults.map((p, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => selectPlace(p)}
                                                    className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors"
                                                >
                                                    <p className="text-sm font-bold text-zinc-800">{p.name}</p>
                                                    <p className="text-xs text-zinc-400 mt-0.5">{p.address}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* 시골 지번주소 등 카카오 검색에 안 잡히는 주소를 위한 폴백 —
                                        검색 결과가 없을 때 등록 방법이 없다는 인상을 주지 않도록 안내 */}
                                    {showPlaceResults && placeQuery.trim() && (
                                        placeResults.length === 0 ? (
                                            <div className="mt-2 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                                                <p className="text-xs text-zinc-500 mb-3">
                                                    검색 결과가 없어요. 시골 지번주소 등은 검색에 안 잡힐 수 있으니, 입력하신 주소를 그대로 등록해드릴게요.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => selectPlace({ name: '', address: placeQuery.trim() })}
                                                    className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold py-3 rounded-xl transition-colors"
                                                >
                                                    &ldquo;{placeQuery.trim()}&rdquo; 그대로 등록하기
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => selectPlace({ name: '', address: placeQuery.trim() })}
                                                className="w-full text-left px-4 py-3 mt-2 border border-dashed border-violet-200 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                                            >
                                                검색결과에 없나요? <span className="font-bold text-zinc-900">&ldquo;{placeQuery.trim()}&rdquo;</span> 그대로 등록하기
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                            <input
                                id="detailAddress"
                                value={formData.detailAddress}
                                name="detailAddress"
                                placeholder="상세주소 (층, 구역 등)"
                                className="w-full border-b-2 border-violet-100 pb-2 focus:border-violet-500 outline-none transition-colors placeholder:text-zinc-300 text-zinc-900 font-medium"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 추가 전달사항 */}
                    <div className="bg-white rounded-3xl p-6 border border-violet-100 shadow-sm shadow-violet-100/60">
                        <p className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest mb-4">추가 전달사항 (선택)</p>
                        <textarea
                            value={formData.additionalMemo}
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

                    {/* 개인정보 동의 */}
                    <label className="flex items-start gap-3 cursor-pointer bg-white rounded-3xl px-4 py-4 border border-violet-100 shadow-sm shadow-violet-100/60">
                        <div
                            onClick={() => setPrivacyAgreed(v => !v)}
                            className={clsx(
                                'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5',
                                privacyAgreed ? 'bg-violet-600 border-violet-600' : 'border-zinc-300'
                            )}
                        >
                            {privacyAgreed && <span className="text-white text-[11px] font-black leading-none">✓</span>}
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            <span className="font-extrabold text-red-500">필수</span>{' '}
                            <span className="underline underline-offset-2 text-zinc-700 cursor-pointer" onClick={e => { e.stopPropagation(); setShowPrivacyModal(true); }}>
                                개인정보 수집·이용
                            </span>에 동의합니다.{' '}
                            <span className="text-zinc-400">
                                (차량번호, 연락처, 주소를 진단 서비스 제공 목적으로 수집하며 완료 후 1년 보관합니다.)
                            </span>
                        </p>
                    </label>

                    <button
                        type="submit"
                        disabled={isSubmitting || !!carError || !privacyAgreed}
                        className={clsx(
                            'w-full py-5 rounded-2xl text-base font-extrabold transition-all',
                            (isSubmitting || !!carError || !privacyAgreed)
                                ? 'bg-zinc-300 text-zinc-400 cursor-not-allowed'
                                : 'bg-violet-600 text-white active:scale-[0.98] shadow-lg shadow-violet-200'
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
