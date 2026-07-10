'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// ── 상수 ──────────────────────────────────────────────
const MAX_PHOTOS = 40;
const STEPS = ['차량정보', '사진', '가격·설명', '확인'] as const;
type StepKey = 0 | 1 | 2 | 3;

const PHOTO_CATS = [
  { key: 'exterior', label: '외부 사진', emoji: '🚗', desc: '전면·측면·후면·트렁크 등 외관 전체', required: true },
  { key: 'interior', label: '내부 사진', emoji: '💺', desc: '대시보드·운전석·뒷좌석·계기판 등',   required: true },
  { key: 'extra',    label: '옵션 사진', emoji: '📷', desc: '선루프·네비·특이사항·장점 부각 사진',  required: false },
] as const;

type CatKey = typeof PHOTO_CATS[number]['key'];

const FUEL_OPTIONS = ['가솔린', '디젤', '하이브리드', 'LPG', '전기', '기타'];
const TRANS_OPTIONS = ['자동', '수동'];
const REGION_OPTIONS = ['서울', '경기도', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const SELL_TYPES = ['일반차량', '리스승계차량', '렌트차량'] as const;
const EXCHANGE_RATE = 1350;


function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length > 7) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
  if (d.length > 3) return `${d.slice(0,3)}-${d.slice(3)}`;
  return d;
}

// ── 탭 바 ─────────────────────────────────────────────
function TabBar({ step }: { step: StepKey }) {
  return (
    <div className="flex border-b border-zinc-200 bg-white sticky top-0 z-20">
      {STEPS.map((label, i) => (
        <div
          key={label}
          className={`flex-1 py-3 text-center text-[11px] font-bold transition-colors relative ${
            i === step ? 'text-violet-600' : i < step ? 'text-zinc-400' : 'text-zinc-300'
          }`}
        >
          {i < step && <span className="mr-0.5 text-violet-400">✓ </span>}
          {label}
          {i === step && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── 필드 래퍼 ─────────────────────────────────────────
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <label className="text-xs font-bold text-zinc-500">{label}</label>
        {required && <span className="text-red-400 text-xs">*</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}

const inp = 'w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors bg-white';

// ── 사진 업로드 카드 (드래그앤드롭 + 순서 변경) ──────────
function PhotoCard({
  cat, urls, onAdd, onRemove, onReorder, uploading,
}: {
  cat: typeof PHOTO_CATS[number];
  urls: string[];
  onAdd: (files: FileList) => void;
  onRemove: (idx: number) => void;
  onReorder: (from: number, to: number) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dropOver, setDropOver]   = useState(false);   // 파일 드롭존
  const [dragSrc,  setDragSrc]    = useState<number | null>(null);  // 재정렬 출발
  const [dragDest, setDragDest]   = useState<number | null>(null);  // 재정렬 도착
  const isReordering = useRef(false);

  // 파일 드롭존 — 내부 재정렬 드래그는 무시
  const handleZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isReordering.current || uploading) return;
    setDropOver(true);
  };
  const handleZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropOver(false);
    if (isReordering.current || uploading) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) onAdd(files);
  };

  // 사진 아이템 재정렬
  const handleItemDragStart = (e: React.DragEvent, i: number) => {
    isReordering.current = true;
    setDragSrc(i);
    e.dataTransfer.effectAllowed = 'move';
    // 투명 고스트 제거
    const ghost = document.createElement('div');
    ghost.style.position = 'fixed';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };
  const handleItemDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragSrc === null || dragSrc === i) return;
    setDragDest(i);
  };
  const handleItemDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragSrc !== null && dragSrc !== i) onReorder(dragSrc, i);
    setDragSrc(null);
    setDragDest(null);
    isReordering.current = false;
  };
  const handleItemDragEnd = () => {
    setDragSrc(null);
    setDragDest(null);
    isReordering.current = false;
  };

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.emoji}</span>
          <div>
            <p className="text-sm font-bold text-zinc-900">{cat.label}</p>
            <p className="text-[10px] text-zinc-400">{cat.desc}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-zinc-400">{urls.length}장</span>
      </div>

      <div className="p-3 space-y-2">
        {/* 사진 그리드 — 드래그로 순서 변경 */}
        {urls.length > 0 && (
          <>
            <p className="text-[10px] text-zinc-300 px-0.5">사진을 드래그해서 순서를 바꿀 수 있어요</p>
            <div className="grid grid-cols-3 gap-2">
              {urls.map((url, i) => (
                <div
                  key={url + i}
                  draggable
                  onDragStart={e => handleItemDragStart(e, i)}
                  onDragOver={e => handleItemDragOver(e, i)}
                  onDrop={e => handleItemDrop(e, i)}
                  onDragEnd={handleItemDragEnd}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden bg-zinc-100 group
                    cursor-grab active:cursor-grabbing select-none transition-all
                    ${dragSrc === i ? 'opacity-30 scale-95' : ''}
                    ${dragDest === i && dragSrc !== i ? 'ring-2 ring-violet-500 scale-105' : ''}
                  `}
                >
                  <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                  {/* 순서 번호 */}
                  <span className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[9px] font-black">
                    {i + 1}
                  </span>
                  {/* 이동 핸들 힌트 */}
                  <span className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M8 6h8M8 12h8M8 18h8"/><path stroke="white" strokeWidth="2" d="M8 6h8M8 12h8M8 18h8"/></svg>
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(i); }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 파일 드롭존 */}
        <div
          onDragOver={handleZoneDragOver}
          onDragLeave={() => setDropOver(false)}
          onDrop={handleZoneDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`
            cursor-pointer rounded-xl border-2 border-dashed transition-all
            flex flex-col items-center justify-center gap-1.5 py-5
            ${uploading
              ? 'opacity-50 cursor-not-allowed border-zinc-200 bg-zinc-50'
              : dropOver
                ? 'border-violet-500 bg-violet-50 scale-[1.01]'
                : 'border-zinc-200 bg-zinc-50 hover:border-violet-400 hover:bg-violet-50'
            }
          `}
        >
          {uploading ? (
            <>
              <span className="animate-spin text-xl text-violet-500">⟳</span>
              <p className="text-xs font-bold text-violet-500">업로드 중…</p>
            </>
          ) : dropOver ? (
            <>
              <svg width="22" height="22" fill="none" stroke="#7c3aed" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p className="text-xs font-bold text-violet-600">여기에 놓으세요</p>
            </>
          ) : (
            <>
              <svg width="22" height="22" fill="none" stroke="#a1a1aa" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p className="text-xs font-semibold text-zinc-400">드래그하거나 클릭해서 추가</p>
              <p className="text-[10px] text-zinc-300">여러 장 한 번에 가능</p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && onAdd(e.target.files)}
        />
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function SelfRegisterPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/sell/register');
    }
  }, [status, router]);

  const [step, setStep] = useState<StepKey>(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // 차량 정보
  const [carNumber, setCarNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [looking, setLooking] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [car, setCar] = useState({
    maker: '', model: '', year: '', trim: '',
    fuel: '가솔린', displacement: '', transmission: '자동',
    color: '', mileage: '',
  });

  // 사진
  const [photos, setPhotos] = useState<Record<CatKey, string[]>>({
    exterior: [], interior: [], extra: [],
  });
  const [uploading, setUploading] = useState<CatKey | null>(null);

  // 자동차등록증 OCR
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);
  const [ocrRaw, setOcrRaw] = useState<Record<string, unknown> | null>(null);
  const ocrFileRef = useRef<HTMLInputElement>(null);

  // 가격·설명
  const [sellType, setSellType] = useState<string>('일반차량');
  const [priceKRW, setPriceKRW] = useState('');
  const [region, setRegion] = useState('서울');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [memo, setMemo] = useState('');

  // ── 차량 조회 ──────────────────────────────────────
  const handleLookup = async () => {
    if (!carNumber.trim()) { alert('차량번호를 입력해주세요.'); return; }
    setLooking(true);
    try {
      const res = await fetch('/api/carinfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate: carNumber.replace(/\s/g, ''), ownerName: ownerName.trim() || '조회' }),
      });
      const data = await res.json();
      if (data.errCode && data.errCode !== '0000') {
        alert('차량 정보를 찾을 수 없습니다.\n직접 입력해주세요.');
        setLookupDone(true);
        return;
      }
      // carzen API 응답 파싱 (가능한 필드 자동 반영)
      const d = data?.DATA?.[0] ?? data ?? {};
      setCar(prev => ({
        ...prev,
        maker: d.MAKER_NM || d.maker || '',
        model: d.MDL_NM || d.model || '',
        year: d.PRYE || d.year || '',
        fuel: d.FUEL_NM || d.fuel || prev.fuel,
        displacement: d.DSPL || d.displacement ? String(d.DSPL || d.displacement) : '',
        transmission: d.GRBX_NM || d.transmission || prev.transmission,
        color: d.COLOR_NM || d.color || '',
        trim: d.SPEC_NM || d.trim || '',
      }));
      setLookupDone(true);
    } catch {
      alert('조회 중 오류가 발생했습니다.\n직접 입력해주세요.');
      setLookupDone(true);
    } finally {
      setLooking(false);
    }
  };

  // ── 자동차등록증 OCR ──────────────────────────────────
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const resized = await resizeImage(file, 1200, 0.85);
      const formData = new FormData();
      formData.append('file', resized, 'registration.jpg');
      const res = await fetch('https://carvior.store/api/v1/external/ocr/registration', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) { alert('등록증 인식에 실패했습니다. 직접 입력해주세요.'); return; }
      const data = await res.json();
      if (data.error) { alert('등록증 인식에 실패했습니다. 직접 입력해주세요.'); return; }

      setOcrRaw(data);
      if (data.plateNumber) setCarNumber(String(data.plateNumber));
      if (data.ownerName) setOwnerName(String(data.ownerName));

      const fuelMatch = ['가솔린', '디젤', '하이브리드', 'LPG', '전기', '기타'].find(
        f => data.fuelType?.includes(f)
      );
      const transMatch = ['자동', '수동'].find(t => data.transmission?.includes(t));

      setCar(prev => ({
        ...prev,
        ...(data.carBrand     && { maker: String(data.carBrand) }),
        ...(data.carName      && { model: String(data.carName) }),
        ...(data.modelYear    && { year: String(data.modelYear) }),
        ...(data.displacement && { displacement: String(data.displacement) }),
        ...(fuelMatch         && { fuel: fuelMatch }),
        ...(transMatch        && { transmission: transMatch }),
        ...(data.color        && { color: String(data.color) }),
        ...(data.mileage      && { mileage: String(data.mileage) }),
      }));
      setOcrDone(true);
    } catch {
      alert('등록증 처리 중 오류가 발생했습니다.');
    } finally {
      setOcrLoading(false);
      e.target.value = '';
    }
  };

  // ── 사진 업로드 ───────────────────────────────────
  const resizeImage = (file: File, maxPx = 1600, quality = 0.82): Promise<File> =>
    new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        const scale = Math.min(1, maxPx / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });

  const handlePhotoAdd = useCallback(async (catKey: CatKey, files: FileList) => {
    const current = Object.values(photos).flat().length;
    const remaining = MAX_PHOTOS - current;
    if (remaining <= 0) { alert(`사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있습니다.`); return; }

    setUploading(catKey);
    const newUrls: string[] = [];
    const requestId = `sell-${carNumber.replace(/\s/g,'') || 'unknown'}-${Date.now()}`;
    const limited = Array.from(files).slice(0, remaining);

    for (const raw of limited) {
      const file = raw.type.startsWith('image/') ? await resizeImage(raw) : raw;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('carNumber', carNumber.replace(/\s/g,'') || 'SELF');
      formData.append('category', catKey);
      formData.append('requestId', requestId);
      try {
        const res = await fetch('https://carvior.store/api/v1/external/inspection/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      } catch {
        // 업로드 실패 시 스킵
      }
    }
    setPhotos(prev => ({ ...prev, [catKey]: [...prev[catKey], ...newUrls] }));
    // 번호판·얼굴·주민번호 블러 (백그라운드 처리, 동일 S3 키에 덮어씀)
    if (newUrls.length > 0) {
      fetch('https://carvior.store/api/v1/admin/blur/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: newUrls }),
      }).catch(() => {});
    }
    setUploading(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carNumber, photos]);

  const handlePhotoRemove = (catKey: CatKey, idx: number) => {
    setPhotos(prev => ({ ...prev, [catKey]: prev[catKey].filter((_, i) => i !== idx) }));
  };

  const handlePhotoReorder = (catKey: CatKey, from: number, to: number) => {
    setPhotos(prev => {
      const arr = [...prev[catKey]];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...prev, [catKey]: arr };
    });
  };

  // ── 스텝 이동 ─────────────────────────────────────
  const goNext = () => {
    if (step === 0) {
      if (!carNumber.trim()) { alert('차량번호를 입력해주세요.'); return; }
      if (!car.mileage) { alert('주행거리를 입력해주세요.'); return; }
    }
    if (step === 2) {
      if (!priceKRW || Number(priceKRW) <= 0) { alert('판매가를 입력해주세요.'); return; }
      if (!contact.trim()) { alert('연락처를 입력해주세요.'); return; }
    }
    setStep(prev => Math.min(3, prev + 1) as StepKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep(prev => Math.max(0, prev - 1) as StepKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 최종 제출 ─────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = {
        bookingId: Date.now(),
        carNumber: carNumber.replace(/\s/g,''),
        titleKo: `${car.maker} ${car.model}${car.trim ? ' ' + car.trim : ''}`.trim() || carNumber,
        titleEn: `${car.maker} ${car.model}`.trim(),
        trim: car.trim,
        year: Number(car.year) || new Date().getFullYear(),
        mileage: Number(car.mileage.replace(/,/g,'')) || 0,
        fuel: car.fuel,
        displacement: car.displacement,
        transmission: car.transmission,
        color: car.color,
        colorKo: car.color,
        accident: false,
        priceKRW: Number(priceKRW) * 10000,
        priceUSD: Math.round(Number(priceKRW) * 10000 / EXCHANGE_RATE),
        category: 'SUV',
        region,
        hasReport: false,
        location: 'Korea',
        doors: 5, seats: 5,
        inspectedAt: new Date().toISOString().split('T')[0],
        registeredAt: new Date().toISOString(),
        status: 'pending',
        photos,
        specs: [
          { label: 'Year', value: String(car.year) },
          { label: 'Mileage', value: `${Number(car.mileage.replace(/,/g,'')).toLocaleString()} KM` },
          { label: 'Fuel', value: car.fuel },
          { label: 'Transmission', value: car.transmission },
          { label: 'Color', value: car.color },
          { label: 'Displacement', value: car.displacement },
        ].filter(s => s.value),
        options: [],
        adminMemo: `[셀프등록] 판매구분:${sellType} / 연락처:${contact} / 설명:${description}\n${memo}`,
      };
      const res = await fetch('/api/admin/store-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? '등록 실패. 다시 시도해주세요.');
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── 완료 화면 ─────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" fill="none" stroke="#7c3aed" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-2">등록 완료!</h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-3">
          매물이 접수되었습니다.<br />
          1~2 영업일 내 카비어 검토 후 스토어에 노출됩니다.
        </p>
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 text-xs text-green-800 text-left mb-8 max-w-sm w-full">
          <p className="font-extrabold mb-1.5">🎉 MVP 기간 — 등록비 무료</p>
          <p>별도 납부 없이 바로 검토가 시작됩니다.<br />
          문의: <span className="font-bold">010-2285-6017</span></p>
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={() => router.push('/buy')} className="flex-1 py-3.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600">
            매물 보기
          </button>
          <button onClick={() => router.push('/')} className="flex-1 py-3.5 rounded-xl bg-violet-600 text-white text-sm font-bold">
            홈으로
          </button>
        </div>
      </div>
    );
  }

  const totalPhotos = Object.values(photos).flat().length;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-zinc-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => step === 0 ? router.back() : goBack()} className="w-8 h-8 flex items-center justify-center text-zinc-500">
          ←
        </button>
        <h1 className="text-base font-black text-zinc-900 flex-1 text-center">셀프등록</h1>
        <div className="w-8" />
      </div>

      <TabBar step={step} />

      {/* ══ STEP 0: 차량정보 ══════════════════════════ */}
      {step === 0 && (
        <div className="flex-1 px-4 py-5 space-y-4 max-w-lg mx-auto w-full">

          {/* 자동차등록증 스캔 */}
          {ocrDone ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-green-800">등록증 스캔 완료</p>
                  <p className="text-[11px] text-green-600">아래 정보를 확인·수정해주세요</p>
                </div>
                <button onClick={() => setOcrDone(false)} className="text-zinc-400 text-lg leading-none px-1">×</button>
              </div>
              {ocrRaw && (
                <div className="bg-zinc-900 rounded-2xl p-4 text-[11px] font-mono overflow-x-auto">
                  <p className="text-zinc-400 mb-2 font-sans font-bold text-xs">OCR 원시 결과</p>
                  {Object.entries(ocrRaw).map(([k, v]) => (
                    <div key={k} className="flex gap-2 py-0.5 border-b border-zinc-800 last:border-0">
                      <span className="text-violet-400 shrink-0 w-36">{k}</span>
                      <span className="text-green-300 break-all">{v == null ? <span className="text-zinc-600">null</span> : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : ocrLoading ? (
            <div className="bg-violet-600 rounded-2xl px-4 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="animate-spin text-white text-xl">⟳</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">등록증 분석 중…</p>
                <p className="text-[11px] text-violet-200">차량 정보를 읽고 있어요</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => ocrFileRef.current?.click()}
              className="w-full bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white rounded-2xl px-4 py-4 flex items-center gap-3 transition-all"
            >
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <rect x="7" y="7" width="10" height="10" rx="1"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-extrabold">자동차등록증 스캔</p>
                <p className="text-[11px] text-violet-200 mt-0.5">사진 1장으로 차량 정보 자동 입력</p>
              </div>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
          <input
            ref={ocrFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleOcrUpload}
          />

          {/* 차량번호 조회 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-3">차량번호로 자동 조회</p>
            <div className="space-y-3">
              <Field label="차량번호" required>
                <input
                  value={carNumber}
                  onChange={e => setCarNumber(e.target.value.toUpperCase())}
                  placeholder="예: 12가3456"
                  className={inp}
                />
              </Field>
              <Field label="소유자 이름" hint="조회 정확도를 높이기 위해 입력하면 좋아요 (선택)">
                <input
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="예: 홍길동"
                  className={inp}
                />
              </Field>
              <button
                onClick={handleLookup}
                disabled={looking || !carNumber.trim()}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {looking ? <><span className="animate-spin">⟳</span> 조회 중…</> : '🔍 차량정보 조회'}
              </button>
            </div>
          </div>

          {/* 차량 상세 정보 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
              {lookupDone ? '✅ 조회 완료 — 확인 후 수정 가능' : '직접 입력'}
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="제조사">
                  <input value={car.maker} onChange={e => setCar(p=>({...p,maker:e.target.value}))} placeholder="예: 기아" className={inp} />
                </Field>
                <Field label="모델">
                  <input value={car.model} onChange={e => setCar(p=>({...p,model:e.target.value}))} placeholder="예: 스포티지" className={inp} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="연식">
                  <input value={car.year} onChange={e => setCar(p=>({...p,year:e.target.value}))} placeholder="예: 2021" className={inp} />
                </Field>
                <Field label="주행거리 (km)" required>
                  <input
                    value={car.mileage}
                    onChange={e => setCar(p=>({...p,mileage:e.target.value.replace(/[^0-9]/g,'')}))}
                    placeholder="예: 35000"
                    inputMode="numeric"
                    className={inp}
                  />
                </Field>
              </div>
              <Field label="트림 / 등급">
                <input value={car.trim} onChange={e => setCar(p=>({...p,trim:e.target.value}))} placeholder="예: 노블레스 그래비티" className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="연료">
                  <select value={car.fuel} onChange={e => setCar(p=>({...p,fuel:e.target.value}))} className={inp}>
                    {FUEL_OPTIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="변속기">
                  <select value={car.transmission} onChange={e => setCar(p=>({...p,transmission:e.target.value}))} className={inp}>
                    {TRANS_OPTIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="배기량">
                <input value={car.displacement} onChange={e => setCar(p=>({...p,displacement:e.target.value}))} placeholder="예: 1998cc" className={inp} />
              </Field>
              <Field label="색상">
                {(() => {
                  const COLORS = [
                    { ko: '흰색',    hex: '#F5F5F5' },
                    { ko: '검정',    hex: '#1A1A1A' },
                    { ko: '은색',    hex: '#C8C8C8' },
                    { ko: '회색',    hex: '#787878' },
                    { ko: '빨간색',  hex: '#CC2222' },
                    { ko: '파란색',  hex: '#1A52CC' },
                    { ko: '남색',    hex: '#0A1F6A' },
                    { ko: '하늘색',  hex: '#5BA3D9' },
                    { ko: '초록색',  hex: '#2A7A35' },
                    { ko: '베이지',  hex: '#D4B896' },
                    { ko: '갈색',    hex: '#6B4226' },
                    { ko: '노란색',  hex: '#F5C518' },
                    { ko: '주황색',  hex: '#E67E22' },
                    { ko: '보라색',  hex: '#7D3C98' },
                  ];
                  return (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map(c => (
                          <button
                            key={c.ko}
                            type="button"
                            onClick={() => setCar(p => ({ ...p, color: p.color === c.ko ? '' : c.ko }))}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${car.color === c.ko ? 'border-violet-500 scale-110 shadow-md' : 'border-transparent hover:border-zinc-300'}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.ko}
                          />
                        ))}
                      </div>
                      {car.color && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">선택:</span>
                          <span className="text-xs font-bold text-zinc-700">{car.color}</span>
                          <button type="button" onClick={() => setCar(p=>({...p,color:''}))} className="text-[10px] text-zinc-400 hover:text-zinc-600">✕</button>
                        </div>
                      )}
                      <input
                        value={car.color}
                        onChange={e => setCar(p=>({...p,color:e.target.value}))}
                        placeholder="직접 입력"
                        className={`${inp} text-xs py-2`}
                      />
                    </div>
                  );
                })()}
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 1: 사진 ════════════════════════════ */}
      {step === 1 && (
        <div className="flex-1 px-4 py-5 space-y-3 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-zinc-700">사진 등록</p>
            <span className="text-xs text-zinc-400">총 {totalPhotos}장</span>
          </div>
          <p className="text-xs text-zinc-400 mb-2">사진이 많을수록 딜러 관심도 3배 증가해요. 외관은 필수입니다.</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[11px] text-blue-700 mb-1">
            🔒 업로드된 사진의 번호판·얼굴·주민번호는 자동으로 블러 처리됩니다.
          </div>
          {PHOTO_CATS.map(cat => (
            <PhotoCard
              key={cat.key}
              cat={cat}
              urls={photos[cat.key]}
              uploading={uploading === cat.key}
              onAdd={files => handlePhotoAdd(cat.key, files)}
              onRemove={idx => handlePhotoRemove(cat.key, idx)}
              onReorder={(from, to) => handlePhotoReorder(cat.key, from, to)}
            />
          ))}
          {photos.exterior.length === 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs text-amber-700">
              외관 사진은 필수입니다. 전면·측면·후면을 촬영해주세요.
            </div>
          )}
        </div>
      )}

      {/* ══ STEP 2: 가격·설명 ════════════════════════ */}
      {step === 2 && (
        <div className="flex-1 px-4 py-5 space-y-4 max-w-lg mx-auto w-full">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 space-y-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">판매 정보</p>

            <Field label="판매 구분">
              <div className="flex gap-2">
                {SELL_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setSellType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      sellType === t ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-200 text-zinc-500 bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="희망 판매가" required>
              <div className="relative">
                <input
                  type="number"
                  value={priceKRW}
                  onChange={e => setPriceKRW(e.target.value)}
                  placeholder="예: 2500"
                  inputMode="numeric"
                  className={`${inp} pr-16`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold pointer-events-none">만원</span>
              </div>
              {Number(priceKRW) > 0 && (
                <p className="text-xs text-violet-600 font-bold mt-1.5">
                  = {Number(priceKRW).toLocaleString()}만원 ({(Number(priceKRW) * 10000).toLocaleString()}원)
                </p>
              )}
            </Field>

            <Field label="지역">
              <select value={region} onChange={e => setRegion(e.target.value)} className={inp}>
                {REGION_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 space-y-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">판매자 정보</p>

            <Field label="연락처" required>
              <input
                type="tel"
                value={contact}
                onChange={e => setContact(fmtPhone(e.target.value))}
                placeholder="010-0000-0000"
                inputMode="numeric"
                className={inp}
              />
            </Field>

            <Field label="차량 설명글" hint="사고 여부, 관리 상태, 판매 이유, 특이사항 등">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                placeholder={`▶ 차량설명\n- 관리상태:\n- 내/외관:\n\n▶ 판매이유:\n▶ 문의방법:`}
                className={`${inp} resize-none`}
              />
            </Field>

            <Field label="관리자 전달 메모" hint="내부 참고용 (외부 미노출)">
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                rows={2}
                placeholder="검토자에게 전달할 내용"
                className={`${inp} resize-none`}
              />
            </Field>
          </div>
        </div>
      )}

      {/* ══ STEP 3: 확인 ═════════════════════════════ */}
      {step === 3 && (
        <div className="flex-1 px-4 py-5 space-y-4 max-w-lg mx-auto w-full">
          {/* 등록 요약 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">등록 정보 확인</p>
            <div className="space-y-2.5">
              {[
                { label: '차량번호', value: carNumber },
                { label: '차량', value: `${car.maker} ${car.model} ${car.trim}`.trim() },
                { label: '연식', value: car.year ? `${car.year}년` : '-' },
                { label: '주행거리', value: car.mileage ? `${Number(car.mileage).toLocaleString()} km` : '-' },
                { label: '연료', value: car.fuel },
                { label: '변속기', value: car.transmission },
                { label: '색상', value: car.color || '-' },
                { label: '판매구분', value: sellType },
                { label: '희망 판매가', value: Number(priceKRW) > 0 ? `${Number(priceKRW).toLocaleString()}만원` : '-' },
                { label: '지역', value: region },
                { label: '연락처', value: contact },
                { label: '사진', value: `총 ${totalPhotos}장` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-20 flex-shrink-0">{label}</span>
                  <span className="text-sm font-semibold text-zinc-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 이용요금 */}
          <div className="bg-zinc-950 rounded-2xl p-5">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">이용 요금</p>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-zinc-600 text-xl font-bold line-through tabular-nums">20,000원</span>
              <span className="text-white text-3xl font-black tabular-nums">
                0<span className="text-base font-bold text-zinc-400">원</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-violet-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">MVP 무료</span>
              <p className="text-zinc-500 text-xs">딜러 수수료도 없음</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3.5 text-xs text-green-800 leading-relaxed">
            🎉 MVP 기간 동안 등록비 완전 무료입니다.<br />
            등록 신청 후 <strong>1~2 영업일 내</strong> 검토를 거쳐 스토어에 노출됩니다.
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl transition-all"
          >
            {submitting ? '등록 중…' : '매물 등록 신청하기'}
          </button>
        </div>
      )}

      {/* ── 하단 다음 버튼 ──────────────────────────── */}
      {step < 3 && (
        <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-4 py-3 safe-area-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            {step > 0 && (
              <button onClick={goBack} className="w-20 py-3.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-500">
                이전
              </button>
            )}
            <button
              onClick={goNext}
              disabled={step === 1 && uploading !== null}
              className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-extrabold text-sm transition-colors"
            >
              {step === 1 ? `다음 (사진 ${totalPhotos}장)` : `다음 (${STEPS[step + 1]})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
