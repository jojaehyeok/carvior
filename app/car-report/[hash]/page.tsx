'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// 마이페이지 "내 검차 신청" 카드에서 클릭했을 때 보여주는 상세 — /auction/market/[id](스마트옥션
// 매물 상세)와 같은 레이아웃(사진 스트림 + 정보 한 줄씩 + 차량번호 복사버튼)으로 통일해달라는
// 요청 반영. /report/[id]는 PDF 다운로드용 다국어 리포트 페이지라 이 용도와는 다르게 유지하고,
// 여기서는 같은 by-hash 공개 API를 재사용해 마켓 스타일로만 다시 그린다.
interface ReportData {
  car_info: { number: string; type: string; mileage: number; color: string };
  evaluation: { leakDesc: string; driveDesc: string; optionsDesc: string; warningDesc: string; engineDesc: string };
  images: {
    wheel?: string[];
    engine?: string[];
    exterior?: string[];
    interior?: string[];
    undercarriage?: string[];
    damage?: string[];
    extra?: string[];
  };
}

interface PhotoItem { url: string; label: string }

function collectPhotos(images?: ReportData['images']): PhotoItem[] {
  if (!images) return [];
  const result: PhotoItem[] = [];
  images.exterior?.forEach(url => result.push({ url, label: '외관' }));
  images.wheel?.forEach(url => result.push({ url, label: '휠&트레드' }));
  images.interior?.forEach(url => result.push({ url, label: '실내' }));
  images.extra?.forEach(url => result.push({ url, label: '옵션' }));
  images.engine?.forEach(url => result.push({ url, label: '엔진룸' }));
  images.undercarriage?.forEach(url => result.push({ url, label: '하부 & 누유' }));
  images.damage?.forEach(url => result.push({ url, label: '내외판 데미지' }));
  return result;
}

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

export default function CarReportViewPage() {
  const params = useParams();
  const hash = typeof params.hash === 'string' ? params.hash : '';

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (!hash) return;
    fetch(`https://carvior.store/api/v1/external/inspection/report/by-hash/${hash}`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [hash]);

  const handleCopyCarNumber = async () => {
    if (!data?.car_info?.number) return;
    try {
      await navigator.clipboard.writeText(data.car_info.number);
    } catch {
      window.prompt('아래 차량번호를 복사하세요', data.car_info.number);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">불러오는 중...</div>;
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">리포트를 찾을 수 없습니다.</div>;
  }

  const photos = collectPhotos(data.images);
  const hasPhotos = photos.length > 0;
  const prevPhoto = () => setActivePhoto(p => (p - 1 + photos.length) % photos.length);
  const nextPhoto = () => setActivePhoto(p => (p + 1) % photos.length);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    delta > 0 ? prevPhoto() : nextPhoto();
  };

  const specRows = [
    { label: '차량번호', value: data.car_info.number || '-' },
    { label: '차종',     value: data.car_info.type || '-' },
    { label: '주행거리', value: data.car_info.mileage ? `${data.car_info.mileage.toLocaleString()} KM` : '-' },
    { label: '색상',     value: data.car_info.color || '-' },
  ];

  const diagRows = [
    { label: '누유·누수', value: data.evaluation?.leakDesc || '없음' },
    { label: '경고등',    value: data.evaluation?.warningDesc || '없음' },
    { label: '주행 상태', value: data.evaluation?.driveDesc || '이상 없음' },
    { label: '옵션 작동', value: data.evaluation?.optionsDesc || '이상 없음' },
    { label: '엔진',      value: data.evaluation?.engineDesc || '이상 없음' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/mypage" className="hover:text-black transition-colors">마이페이지</Link>
          <span>/</span>
          <span className="text-gray-600 font-semibold">{data.car_info.type || data.car_info.number}</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
        {/* 메인 사진 */}
        <div
          className="relative aspect-[4/3] bg-gray-50 overflow-hidden border border-gray-100 rounded-xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {hasPhotos ? (
            <img src={photos[activePhoto]?.url} alt={photos[activePhoto]?.label} className="w-full h-full object-cover" />
          ) : (
            <CarSilhouette />
          )}
          {hasPhotos && (
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              {activePhoto + 1} / {photos.length}
            </span>
          )}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button
                type="button"
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
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 ${i === activePhoto ? 'border-violet-600' : 'border-transparent opacity-70'}`}
              >
                <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* 차량정보 */}
        <h3 className="text-base font-black text-gray-900 mt-6 mb-3">차량정보</h3>
        <div className="border-t border-gray-100 mb-8">
          {specRows.map(s => (
            <div key={s.label} className="flex items-baseline gap-4 py-3 border-b border-gray-100">
              <span className="w-24 shrink-0 text-sm text-gray-400">{s.label}</span>
              <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {s.value}
                {s.label === '차량번호' && data.car_info.number && (
                  <button
                    type="button"
                    onClick={handleCopyCarNumber}
                    className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    {copied ? '복사됨' : '복사'}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>

        <h3 className="text-base font-black text-gray-900 mb-3">카비어 진단</h3>
        <div className="border-t border-gray-100 mb-8">
          {diagRows.map(d => (
            <div key={d.label} className="flex items-baseline gap-4 py-3 border-b border-gray-100">
              <span className="w-24 shrink-0 text-sm text-gray-400">{d.label}</span>
              <span className="text-sm font-bold text-gray-900">{d.value}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/report/${hash}?public=1`}
          className="block w-full text-center py-3 rounded-xl text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
        >
          전체 진단 리포트 보기 (사고이력·손상부위·PDF) →
        </Link>
      </div>
    </div>
  );
}
