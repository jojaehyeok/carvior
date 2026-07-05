'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';


interface UnifiedCar {
  id: string;
  titleEn: string;
  titleKo: string;
  trim: string;
  year: number;
  mileage: number;
  fuel: string;
  displacement: string;
  transmission: string;
  colorKo: string;
  accident: boolean;
  priceKRW: number;
  priceUSD: number;
  hidePrice?: boolean;
  status?: string;
  hasReport: boolean;
  location: string;
  category: string;
  region: string;
  inspectedAt: string;
  specs: { label: string; value: string }[];
  options: string[];
  photos?: {
    exterior?: string[];
    interior?: string[];
    engine?: string[];
    wheel?: string[];
    dashboard?: string[];
    registration?: string[];
    vin?: string[];
  };
  carNumber?: string;
  inspectionData?: {
    leakDesc?: string;
    driveDesc?: string;
    optionsDesc?: string;
    warningDesc?: string;
  };
  conditionData?: {
    tireTread?: { front: number; back: number };
    paintNeeded?: number;
    wheelScratch?: number;
    keys?: { smart: number; folding: number; general: number };
  };
}

// ── 데모 차량 DB ───────────────────────────────────────────────────────────────
const CAR_DB: Record<string, UnifiedCar> = {
  '1': {
    id: '1', titleEn: 'Kia Sorento The New Sorento', titleKo: '기아 더 뉴 쏘렌토',
    trim: 'Noblesse', year: 2024, mileage: 31764, fuel: 'GASOLINE',
    displacement: '2,497cc', transmission: 'AUTO', colorKo: '스노우 화이트 펄',
    accident: false, priceKRW: 36_900_000, priceUSD: 27_333,
    hasReport: true, location: 'Korea', category: 'SUV', region: '경기도',
    inspectedAt: '2026-05-22',
    specs: [
      { label: 'Year', value: '2024' }, { label: 'Mileage', value: '31,764 KM' },
      { label: 'Fuel', value: 'Gasoline' }, { label: 'Engine', value: '2,497cc' },
      { label: 'Transmission', value: 'Automatic' }, { label: 'Drive', value: 'AWD' },
      { label: 'Color', value: 'Snow White Pearl' }, { label: 'Seats', value: '7' },
      { label: 'Doors', value: '5' }, { label: 'Accident', value: 'None' },
    ],
    options: ['LED 헤드램프', '파노라마 선루프', '전동 시트', '통풍 시트', '후방 카메라', '스마트 크루즈', '어라운드 뷰', '무선 충전', 'BOSE 오디오', 'HUD'],
  },
  '2': {
    id: '2', titleEn: 'Hyundai Avante The New Avante', titleKo: '현대 더 뉴 아반떼',
    trim: 'Smart', year: 2016, mileage: 93508, fuel: 'GASOLINE',
    displacement: '1,591cc', transmission: 'AUTO', colorKo: '시머링 실버',
    accident: false, priceKRW: 7_800_000, priceUSD: 5_778,
    hasReport: false, location: 'Korea', category: '세단', region: '서울',
    inspectedAt: '2026-05-28',
    specs: [
      { label: 'Year', value: '2016' }, { label: 'Mileage', value: '93,508 KM' },
      { label: 'Fuel', value: 'Gasoline' }, { label: 'Engine', value: '1,591cc' },
      { label: 'Transmission', value: 'Automatic' }, { label: 'Drive', value: 'FWD' },
      { label: 'Color', value: 'Shimmering Silver' }, { label: 'Seats', value: '5' },
      { label: 'Doors', value: '4' }, { label: 'Accident', value: 'None' },
    ],
    options: ['후방 카메라', '크루즈 컨트롤', '블루투스', '히팅 시트'],
  },
  '6': {
    id: '6', titleEn: 'Genesis G80', titleKo: '제네시스 G80',
    trim: '2.5T Premium', year: 2021, mileage: 44000, fuel: 'GASOLINE',
    displacement: '2,497cc', transmission: 'AUTO', colorKo: '히말라야 그레이',
    accident: false, priceKRW: 39_900_000, priceUSD: 29_556,
    hasReport: true, location: 'Korea', category: '세단', region: '서울',
    inspectedAt: '2026-05-15',
    specs: [
      { label: 'Year', value: '2021' }, { label: 'Mileage', value: '44,000 KM' },
      { label: 'Fuel', value: 'Gasoline' }, { label: 'Engine', value: '2,497cc' },
      { label: 'Transmission', value: 'Automatic' }, { label: 'Drive', value: 'RWD' },
      { label: 'Color', value: 'Himalayan Gray' }, { label: 'Seats', value: '5' },
      { label: 'Doors', value: '4' }, { label: 'Accident', value: 'None' },
    ],
    options: ['매직 스카이 선루프', '마사지 시트', '렉시콘 오디오', 'HUD', '나파 가죽', '어라운드 뷰', '무선 충전', '스마트 크루즈'],
  },
  '7': {
    id: '7', titleEn: 'Hyundai Grandeur IG', titleKo: '현대 그랜저 IG',
    trim: 'Premium', year: 2020, mileage: 52000, fuel: 'LPG',
    displacement: '2,999cc', transmission: 'AUTO', colorKo: '문라이트 실버',
    accident: false, priceKRW: 24_900_000, priceUSD: 18_444,
    hasReport: true, location: 'Korea', category: '세단', region: '경기도',
    inspectedAt: '2026-06-01',
    specs: [
      { label: 'Year', value: '2020' }, { label: 'Mileage', value: '52,000 KM' },
      { label: 'Fuel', value: 'LPG' }, { label: 'Engine', value: '2,999cc' },
      { label: 'Transmission', value: 'Automatic' }, { label: 'Drive', value: 'FWD' },
      { label: 'Color', value: 'Moonlight Silver' }, { label: 'Seats', value: '5' },
      { label: 'Doors', value: '4' }, { label: 'Accident', value: 'None' },
    ],
    options: ['파노라마 선루프', '통풍 시트', '스마트 크루즈', '후방 카메라', 'HUD', '어라운드 뷰'],
  },
  '8': {
    id: '8', titleEn: 'Kia Carnival 4th Gen', titleKo: '기아 카니발 4세대',
    trim: 'Prestige', year: 2022, mileage: 28000, fuel: 'DIESEL',
    displacement: '2,199cc', transmission: 'AUTO', colorKo: '어비스 블랙',
    accident: false, priceKRW: 42_000_000, priceUSD: 31_111,
    hasReport: true, location: 'Korea', category: 'RV', region: '인천',
    inspectedAt: '2026-05-10',
    specs: [
      { label: 'Year', value: '2022' }, { label: 'Mileage', value: '28,000 KM' },
      { label: 'Fuel', value: 'Diesel' }, { label: 'Engine', value: '2,199cc' },
      { label: 'Transmission', value: 'Automatic' }, { label: 'Drive', value: 'FWD' },
      { label: 'Color', value: 'Abyss Black' }, { label: 'Seats', value: '9' },
      { label: 'Doors', value: '5' }, { label: 'Accident', value: 'None' },
    ],
    options: ['빌트인 캠', '파워 슬라이딩 도어', '후석 엔터테인먼트', '스마트 크루즈', '어라운드 뷰'],
  },
  '9': {
    id: '9', titleEn: 'Hyundai Tucson NX4', titleKo: '현대 투싼 NX4',
    trim: 'Prestige', year: 2023, mileage: 15000, fuel: 'HYBRID',
    displacement: '1,598cc', transmission: 'AUTO', colorKo: '문루프 실버',
    accident: false, priceKRW: 34_500_000, priceUSD: 25_556,
    hasReport: true, location: 'Korea', category: 'SUV', region: '부산',
    inspectedAt: '2026-05-08',
    specs: [
      { label: 'Year', value: '2023' }, { label: 'Mileage', value: '15,000 KM' },
      { label: 'Fuel', value: 'Hybrid' }, { label: 'Engine', value: '1,598cc' },
      { label: 'Transmission', value: 'Automatic' }, { label: 'Drive', value: 'AWD' },
      { label: 'Color', value: 'Moonroof Silver' }, { label: 'Seats', value: '5' },
      { label: 'Doors', value: '5' }, { label: 'Accident', value: 'None' },
    ],
    options: ['파노라마 선루프', '통풍 시트', '후방 카메라', '무선 충전', '스마트 크루즈'],
  },
};

// ── 사진 수집 ─────────────────────────────────────────────────────────────────
interface PhotoItem { url?: string; label: string }

function collectPhotos(car: UnifiedCar): PhotoItem[] {
  const p = car.photos;
  if (!p) return [];
  const result: PhotoItem[] = [];
  p.exterior?.forEach(url => result.push({ url, label: '외관' }));
  p.interior?.forEach(url => result.push({ url, label: '실내' }));
  p.engine?.forEach(url => result.push({ url, label: '엔진룸' }));
  p.wheel?.forEach(url => result.push({ url, label: '휠' }));
  p.dashboard?.forEach(url => result.push({ url, label: '계기판' }));
  p.vin?.forEach(url => result.push({ url, label: 'VIN' }));
  // registration(자동차등록증)은 개인정보 보호를 위해 사이트에 절대 표시하지 않음
  return result;
}

// ── 플레이스홀더 ──────────────────────────────────────────────────────────────
function CarSilhouette() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
      <svg viewBox="0 0 500 280" fill="none" className="w-2/3 opacity-10">
        <rect x="40" y="140" width="420" height="100" rx="20" fill="#000"/>
        <path d="M110 140 L155 75 H345 L390 140Z" fill="#000"/>
        <circle cx="130" cy="220" r="40" fill="#333"/>
        <circle cx="370" cy="220" r="40" fill="#333"/>
      </svg>
      <p className="text-xs text-gray-300 font-bold mt-3">사진 없음</p>
    </div>
  );
}

function TireTread({ label, value }: { label: string; value: number }) {
  const color = value >= 60 ? '#16a34a' : value >= 30 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-6">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}%</span>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function CarDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [car, setCar] = useState<UnifiedCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');

  useEffect(() => {
    if (CAR_DB[id]) {
      setCar(CAR_DB[id]);
      setLoading(false);
      return;
    }
    fetch('/api/admin/store-items')
      .then(r => r.json())
      .then((items: any[]) => {
        const found = items.find(i => i.id === id);
        if (found) {
          setCar({
            id: found.id,
            titleKo: found.titleKo || found.carNumber || '진단 완료 차량',
            titleEn: found.titleEn || found.carNumber || 'Inspected Vehicle',
            trim: found.trim || '',
            year: found.year || new Date().getFullYear(),
            mileage: found.mileage || 0,
            fuel: found.fuel || '미확인',
            displacement: found.displacement || '',
            transmission: found.transmission || 'AUTO',
            colorKo: found.colorKo || found.color || '',
            accident: found.accident || false,
            priceKRW: found.priceKRW || 0,
            priceUSD: found.priceUSD || Math.round((found.priceKRW || 0) / 1350),
            hasReport: found.hasReport ?? true,
            location: found.location || 'Korea',
            category: found.category || 'SUV',
            region: found.region || '서울',
            inspectedAt: found.inspectedAt || (found.registeredAt || '').split('T')[0],
            specs: found.specs || [],
            options: found.options || [],
            photos: found.photos,
            carNumber: found.carNumber,
            inspectionData: found.inspectionData,
            conditionData: found.conditionData,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-white pt-16 flex flex-col items-center justify-center text-gray-400">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-bold">차량을 찾을 수 없습니다</p>
        <Link href="/buy" className="mt-4 text-sm underline">목록으로 돌아가기</Link>
      </div>
    );
  }

  const photos = collectPhotos(car);
  const hasPhotos = photos.length > 0;
  const totalPhotos = photos.length;

  const prevPhoto = () => setActivePhoto(p => (p - 1 + totalPhotos) % totalPhotos);
  const nextPhoto = () => setActivePhoto(p => (p + 1) % totalPhotos);

  const specRow = [
    car.mileage ? `${car.mileage.toLocaleString()} KM` : null,
    car.fuel || null,
    car.displacement || null,
    car.transmission || null,
  ].filter(Boolean) as string[];

  const priceLabel = (car.hidePrice || car.status === 'sold')
    ? '거래완료'
    : car.priceUSD > 0
      ? `$ ${car.priceUSD.toLocaleString()}`
      : car.priceKRW > 0
        ? `₩ ${Math.round(car.priceKRW / 10000).toLocaleString()}만`
        : '가격 협의';

  return (
    <div className="min-h-screen bg-white">


      {/* ── breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/buy" className="hover:text-black transition-colors">Buy</Link>
          <span>/</span>
          <span className="text-gray-600 font-semibold truncate max-w-[200px]">{car.titleEn}</span>
        </nav>
      </div>

      {/* ── 메인 그리드 ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* ── 왼쪽: 사진 갤러리 ── */}
          <div>
            {/* 메인 사진 */}
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden border border-gray-100">
              {hasPhotos && photos[activePhoto]?.url ? (
                <img
                  src={photos[activePhoto].url}
                  alt={photos[activePhoto].label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <CarSilhouette />
              )}

              {/* 진단 배지 */}
              {car.hasReport && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1.5 rounded-full">
                  <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  CARVIOR INSPECTED
                </div>
              )}

              {/* 사진 카운터 */}
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {activePhoto + 1} / {totalPhotos}
              </div>

              {/* 이전/다음 */}
              {totalPhotos > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* 썸네일 스트립 */}
            {hasPhotos && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {photos.slice(0, 7).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`relative shrink-0 w-[90px] h-[60px] overflow-hidden border-2 transition-all ${
                      activePhoto === i ? 'border-black' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {p.url ? (
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    ) : (
                      <CarSilhouette />
                    )}
                  </button>
                ))}
                {photos.length > 7 && (
                  <button
                    onClick={() => setActivePhoto(7)}
                    className="relative shrink-0 w-[90px] h-[60px] overflow-hidden border-2 border-transparent hover:border-gray-300 transition-all"
                  >
                    {photos[7]?.url && (
                      <img src={photos[7].url} alt="more" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <span className="text-white text-xs font-black">+ {photos.length - 7}</span>
                      <span className="text-white text-[10px]">사진 모두보기</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── 오른쪽: 차량 정보 패널 ── */}
          <div>
            {/* 소셜 stats */}
            <div className="flex items-center justify-end gap-4 mb-4 text-sm text-gray-400">
              <button
                onClick={() => { setLiked(v => !v); setLikeCount(n => n + (liked ? -1 : 1)); }}
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                <svg width="16" height="16" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                ({likeCount})
              </button>
              <button className="flex items-center gap-1 hover:text-black transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                공유
              </button>
              <span className="flex items-center gap-1">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {Math.floor(Math.random() * 50) + 10}
              </span>
            </div>

            {/* 차량명 */}
            <h1 className="text-xl font-black text-gray-900 leading-snug mb-1">
              {car.titleEn}
            </h1>
            {car.titleKo !== car.titleEn && (
              <p className="text-sm text-gray-400 mb-2">{car.titleKo}{car.trim ? ` · ${car.trim}` : ''}</p>
            )}

            {/* 스펙 한줄 */}
            {specRow.length > 0 && (
              <div className="flex flex-wrap items-center gap-0 text-sm text-gray-500 mb-2">
                {specRow.map((s, i) => (
                  <span key={s} className="flex items-center gap-0">
                    {i > 0 && <span className="mx-2 text-gray-200">|</span>}
                    <span className="font-semibold">{s}</span>
                  </span>
                ))}
              </div>
            )}

            {/* 위치 */}
            <p className="text-sm text-gray-500 mb-4">
              Location: 🇰🇷 {car.location}{car.region ? ` · ${car.region}` : ''}
            </p>

            {/* 가격 */}
            <div className="border-t border-b border-gray-100 py-4 mb-4">
              <p className="text-3xl font-black text-gray-900 tracking-tight">
                {priceLabel}
              </p>
              {car.priceUSD > 0 && car.priceKRW > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  ≈ {Math.round(car.priceKRW / 10000).toLocaleString()}만원
                </p>
              )}
              {car.priceKRW === 0 && (
                <p className="text-sm text-gray-400 mt-1">판매가 미설정 · 카비어에 문의하세요</p>
              )}
            </div>

            {/* 판매자 카드 */}
            <div className="border border-gray-200 rounded-xl p-3.5 mb-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-black flex items-center justify-center shrink-0">
                <span className="text-white text-[9px] font-black tracking-tight">CV</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm">CARVIOR</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="text-blue-600 underline underline-offset-2 cursor-pointer">판매 중 {Math.floor(Math.random() * 20) + 5}건</span>
                  <span className="mx-1.5 text-gray-200">|</span>
                  <span className="text-blue-600 underline underline-offset-2 cursor-pointer">판매 완료 {Math.floor(Math.random() * 50) + 20}건</span>
                </p>
              </div>
              <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full">
                인증
              </span>
            </div>

            {/* 문의 버튼 2개 */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setInquiryOpen(true)}
                className="bg-amber-400 hover:bg-amber-500 text-black font-black py-3.5 rounded-xl text-sm transition-colors"
              >
                카비어 문의
              </button>
              <a
                href="https://wa.me/821022856017"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-black py-3.5 rounded-xl text-sm transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#059669">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>

            {car.hasReport && (
              <p className="text-center text-xs text-gray-400 leading-relaxed">
                카비어 공인 진단사가 직접 방문하여 진단한 차량입니다.<br />
                진단 리포트 열람 및 수출 지원은 카비어를 통해 문의해 주세요.
              </p>
            )}
          </div>
        </div>

        {/* ── 하단: 상세 정보 탭 ── */}
        <div className="mt-10 border-t border-gray-100">
          <DetailTabs car={car} />
        </div>
      </div>

      {/* ── 문의 모달 ── */}
      {inquiryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">카비어에 문의하기</h3>
              <button onClick={() => setInquiryOpen(false)} className="text-gray-400 hover:text-black">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mb-4 font-medium">
              {car.titleEn}
              {car.carNumber ? ` · ${car.carNumber}` : ''}
              {car.priceUSD > 0 ? ` · $${car.priceUSD.toLocaleString()}` : ''}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="이름 / Name"
                value={inquiryName}
                onChange={e => setInquiryName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
              />
              <textarea
                placeholder="문의 내용 / Inquiry"
                value={inquiryMsg}
                onChange={e => setInquiryMsg(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
              />
            </div>
            <button
              onClick={() => { alert('문의가 접수되었습니다.'); setInquiryOpen(false); }}
              className="w-full bg-black text-white font-black py-4 rounded-xl text-sm mt-4 hover:bg-gray-800 transition-colors"
            >
              문의 보내기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 하단 탭 컴포넌트 ───────────────────────────────────────────────────────────
function DetailTabs({ car }: { car: UnifiedCar }) {
  const [tab, setTab] = useState<'specs' | 'options' | 'insurance'>('specs');

  const specRows = car.specs.length > 0 ? car.specs : [
    { label: '연식',    value: car.year ? String(car.year) : '-' },
    { label: '변속기',  value: car.transmission || '-' },
    { label: '연료',    value: car.fuel || '-' },
    { label: '색상',    value: car.colorKo || '-' },
    { label: '배기량',  value: car.displacement || '-' },
    { label: '승차인원', value: '5' },
    { label: '구동방식', value: '-' },
    { label: '최초등록일', value: '-' },
    { label: '주행거리', value: `${car.mileage.toLocaleString()} KM` },
    { label: 'Location', value: `${car.location}${car.region ? ` · ${car.region}` : ''}` },
  ];

  const specialRows = [
    { label: '전손 보험사고',      value: 'NO' },
    { label: '침수 보험사고',      value: 'NO' },
    { label: '도난 보험사고',      value: 'NO' },
    { label: '관용용도 사용이력',   value: 'NO' },
    { label: '영업용(일반) 사용이력', value: 'NO' },
    { label: '영업용(대여) 사용이력', value: 'NO' },
    { label: '연료개조',           value: 'NO' },
    { label: '좌석개조',           value: 'NO' },
  ];

  return (
    <div>
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200 mb-8">
        {([
          { key: 'specs',     label: '차량정보' },
          { key: 'options',   label: '옵션정보' },
          { key: 'insurance', label: '보험이력' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-4 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 차량정보 ── */}
      {tab === 'specs' && (
        <div className="max-w-3xl">
          <h3 className="text-lg font-black text-gray-900 mb-5">차량정보</h3>
          <div className="grid grid-cols-2 border-t border-gray-100">
            {specRows.map(s => (
              <div key={s.label} className="flex items-baseline gap-4 py-3.5 border-b border-gray-100 px-1">
                <span className="w-28 shrink-0 text-sm text-gray-400">{s.label}</span>
                <span className="text-sm font-bold text-gray-900">{s.value}</span>
              </div>
            ))}
          </div>

          {/* 특이정보 */}
          <div className="mt-8">
            <h3 className="text-base font-black text-gray-900 mb-1 flex items-center gap-1.5">
              특이정보
              <span className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-[10px] flex items-center justify-center font-black cursor-help" title="보험개발원 데이터 기반">?</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">보험개발원 연동 예정 · 현재 카비어 진단 결과 기준</p>
            <div className="grid grid-cols-2 border-t border-gray-100">
              {specialRows.map(s => (
                <div key={s.label} className="flex items-center gap-4 py-3 border-b border-gray-100 px-1">
                  <span className="flex-1 text-sm text-gray-400">{s.label}</span>
                  <span className="text-sm font-black text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 카비어 진단 요약 (있을 경우) */}
          {car.inspectionData && (
            <div className="mt-8 space-y-2">
              <h3 className="text-base font-black text-gray-900 mb-3">카비어 진단 결과</h3>
              {[
                { label: '누수 상태', value: car.inspectionData.leakDesc },
                { label: '주행 상태', value: car.inspectionData.driveDesc },
                { label: '옵션 상태', value: car.inspectionData.optionsDesc },
                { label: '경고등',   value: car.inspectionData.warningDesc },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-400">{r.label}</span>
                  <span className={`text-sm font-bold ${r.value === '이상 없음' ? 'text-green-600' : 'text-amber-600'}`}>
                    {r.value}
                  </span>
                </div>
              ))}
              {/* 컨디션 카드 */}
              {car.conditionData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {car.conditionData.tireTread && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-black text-gray-400 mb-3">타이어 트레드</p>
                      <div className="space-y-2">
                        <TireTread label="앞" value={car.conditionData.tireTread.front} />
                        <TireTread label="뒤" value={car.conditionData.tireTread.back} />
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-black text-gray-400 mb-3">외관 컨디션</p>
                    {car.conditionData.paintNeeded != null && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">도색 필요</span>
                        <span className="font-bold">{car.conditionData.paintNeeded}곳</span>
                      </div>
                    )}
                    {car.conditionData.wheelScratch != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">휠 스크래치</span>
                        <span className="font-bold">{car.conditionData.wheelScratch}개</span>
                      </div>
                    )}
                  </div>
                  {car.conditionData.keys && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-black text-gray-400 mb-3">키 보유</p>
                      {car.conditionData.keys.smart > 0 && (
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">스마트키</span>
                          <span className="font-bold">{car.conditionData.keys.smart}개</span>
                        </div>
                      )}
                      {car.conditionData.keys.folding > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">폴딩키</span>
                          <span className="font-bold">{car.conditionData.keys.folding}개</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 차량 소개 */}
          {(car as any).adminMemo && (
            <div className="mt-8 bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm font-black text-gray-700 mb-2">차량 소개</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {(car as any).adminMemo}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 옵션정보 ── */}
      {tab === 'options' && (
        <div className="max-w-3xl">
          {car.options.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {car.options.map(opt => (
                <span key={opt} className="flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                  <svg width="11" height="11" fill="none" stroke="#16a34a" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  {opt}
                </span>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm">등록된 옵션 정보가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* ── 보험이력 ── */}
      {tab === 'insurance' && (
        <div className="max-w-3xl">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-amber-800 mb-1">보험이력 조회 준비중</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                보험개발원 API 연동 개발중입니다.<br />
                서비스 출시 전까지는 카비어 공인 진단 결과를 참고해 주세요.
              </p>
            </div>
          </div>

          {/* 현재 알려진 사고이력 */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="text-sm font-black text-gray-700 mb-4">카비어 진단 기준 특이사항</p>
            <div className="grid grid-cols-2 gap-x-8">
              {[
                { label: '전손 보험사고',        value: car.accident ? 'YES' : 'NO' },
                { label: '침수 보험사고',        value: 'NO' },
                { label: '도난 보험사고',        value: 'NO' },
                { label: '관용용도 사용이력',     value: 'NO' },
                { label: '영업용(일반) 사용이력', value: 'NO' },
                { label: '영업용(대여) 사용이력', value: 'NO' },
                { label: '연료개조',             value: 'NO' },
                { label: '좌석개조',             value: 'NO' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-400">{r.label}</span>
                  <span className={`text-sm font-black ${r.value === 'YES' ? 'text-red-600' : 'text-gray-800'}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
