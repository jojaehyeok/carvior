'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import AuctionAccessGate from '@/components/AuctionAccessGate';
import { fmtKRW } from '@/components/auction/shared';

const LISTING_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '입찰중',
  TARGET_PRICE_MET: '희망가 도달 · 입찰중',
  AWARDED: '낙찰 완료',
  CLOSED: '입찰 마감',
  CANCELLED: '취소됨',
};

interface DealerBid {
  id: number;
  status: string;
  createdAt: string;
  isMine: boolean;
  amount?: number;
}

interface InspectionPhotos {
  exterior?: string[];
  wheel?: string[];
  undercarriage?: string[];
  interior?: string[];
  engine?: string[];
  damage?: string[];
  extra?: string[];
  extraMemo?: string[];
}

interface DealerListingDetail {
  id: number;
  carNumber?: string;
  carModel?: string;
  mileage?: number;
  color?: string;
  askingPrice: number;
  minimumAcceptablePrice?: number | null;
  listingStatus: string;
  biddingStartAt?: string;
  biddingEndAt?: string;
  carHash?: string;
  photos?: InspectionPhotos;
  inspectionDetails?: {
    warningDesc?: string;
    leakDesc?: string;
    optionsDesc?: string;
    driveDesc?: string;
    engineDesc?: string;
  };
  carStatus?: {
    tireTread?: { front: number; back: number };
  };
  checkedDamages?: string[][];
}

interface PhotoItem { url: string; label: string }

function collectPhotos(photos?: InspectionPhotos): PhotoItem[] {
  if (!photos) return [];
  const result: PhotoItem[] = [];
  photos.exterior?.forEach(url => result.push({ url, label: '외관' }));
  photos.wheel?.forEach(url => result.push({ url, label: '휠&트레드' }));
  photos.interior?.forEach(url => result.push({ url, label: '실내' }));
  photos.extra?.forEach(url => result.push({ url, label: '옵션' }));
  photos.engine?.forEach(url => result.push({ url, label: '엔진룸' }));
  photos.undercarriage?.forEach(url => result.push({ url, label: '하부 & 누유' }));
  photos.damage?.forEach(url => result.push({ url, label: '내외판 데미지' }));
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

function SaleListingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const embed = searchParams.get('embed') === '1';
  const id = typeof params.id === 'string' ? params.id : '';

  const { data: session } = useSession();
  const dealerId = (session?.user as any)?.id ? Number((session?.user as any).id) : undefined;
  const dealerName = (session?.user as any)?.name ?? '딜러';

  const [item, setItem] = useState<DealerListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef(0);
  const [bids, setBids] = useState<DealerBid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);

  const loadBids = () => {
    const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
    fetch(`${API}/external/sale-listings/${id}/bids${dealerId ? `?dealerId=${dealerId}` : ''}`, {
      headers: { 'x-internal-key': process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '' },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setBids(Array.isArray(data) ? data : []))
      .catch(() => setBids([]));
  };

  useEffect(() => {
    if (!id) return;
    const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
    fetch(`${API}/external/sale-listings/${id}`, {
      headers: { 'x-internal-key': process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
    loadBids();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dealerId]);

  const submitBid = async () => {
    const amount = Number(bidAmount.replace(/,/g, ''));
    if (!amount || amount <= 0) { alert('입찰가를 입력해주세요.'); return; }
    setBidding(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const res = await fetch(`${API}/external/sale-listings/${id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '' },
        body: JSON.stringify({ dealerId, dealerName, amount }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message ?? '입찰에 실패했습니다.'); return; }
      setBidAmount('');
      loadBids();
      const API2 = process.env.NEXT_PUBLIC_API_ENDPOINT;
      fetch(`${API2}/external/sale-listings/${id}`, {
        headers: { 'x-internal-key': process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '' },
      }).then(r => r.ok ? r.json() : null).then(d => d && setItem(d)).catch(() => {});
      alert(`✓ ${fmtKRW(amount)} 입찰 완료!`);
    } catch {
      alert('서버와 통신할 수 없습니다.');
    } finally {
      setBidding(false);
    }
  };

  const handleCopyCarNumber = async () => {
    if (!item?.carNumber) return;
    try {
      await navigator.clipboard.writeText(item.carNumber);
    } catch {
      window.prompt('아래 차량번호를 복사하세요', item.carNumber);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <div className="min-h-[300px] flex items-center justify-center text-gray-400 text-sm">불러오는 중...</div>;
  }
  if (!item) {
    return <div className="min-h-[300px] flex items-center justify-center text-gray-400 text-sm">매물을 찾을 수 없습니다.</div>;
  }

  const photos = collectPhotos(item.photos);
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
    { label: '차량번호', value: item.carNumber || '-' },
    { label: '차종',     value: item.carModel || '-' },
    { label: '주행거리', value: item.mileage ? `${item.mileage.toLocaleString()} KM` : '-' },
    { label: '색상',     value: item.color || '-' },
  ];

  const diagRows = [
    { label: '누유·누수', value: item.inspectionDetails?.leakDesc || '없음' },
    { label: '경고등',    value: item.inspectionDetails?.warningDesc || '없음' },
    { label: '주행 상태', value: item.inspectionDetails?.driveDesc || '이상 없음' },
    { label: '옵션 작동', value: item.inspectionDetails?.optionsDesc || '이상 없음' },
    { label: '엔진',      value: item.inspectionDetails?.engineDesc || '이상 없음' },
  ];

  return (
    <div className={embed ? 'bg-white' : 'min-h-screen bg-white'}>
      {!embed && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4 pb-2">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/auction/sale-listings" className="hover:text-black transition-colors">판매차량 목록</Link>
            <span>/</span>
            <span className="text-gray-600 font-semibold">{item.carModel || item.carNumber}</span>
          </nav>
        </div>
      )}

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

        {/* 썸네일 스트립 — 쭉쭉 이어지는 사진 목록 */}
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

        {/* 가격 */}
        <div className="border-t border-b border-gray-100 py-4 mt-5 mb-5">
          <p className="text-[11px] font-bold text-gray-400 mb-1">차주 희망가</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{fmtKRW(item.askingPrice)}</p>
        </div>

        {/* 차량정보 — 라벨/값 한 줄씩 */}
        <h3 className="text-base font-black text-gray-900 mb-3">차량정보</h3>
        <div className="border-t border-gray-100 mb-8">
          {specRows.map(s => (
            <div key={s.label} className="flex items-baseline gap-4 py-3 border-b border-gray-100">
              <span className="w-24 shrink-0 text-sm text-gray-400">{s.label}</span>
              <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {s.value}
                {s.label === '차량번호' && item.carNumber && (
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

        {/* 입찰 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-gray-900">입찰</h3>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            item.listingStatus === 'AWARDED' ? 'bg-violet-100 text-violet-700'
              : item.listingStatus === 'ACTIVE' || item.listingStatus === 'TARGET_PRICE_MET' ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {LISTING_STATUS_LABEL[item.listingStatus] ?? item.listingStatus}
          </span>
        </div>

        {(item.listingStatus === 'ACTIVE' || item.listingStatus === 'TARGET_PRICE_MET') ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 mb-6 space-y-2.5">
            <p className="text-xs text-gray-500">입찰 {bids.length}건 {bids.some(b => b.isMine) && '· 내 입찰 있음'}</p>
            <div className="flex gap-2">
              <input
                type="text" inputMode="numeric" placeholder="입찰가 (원)"
                value={bidAmount} onChange={e => setBidAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={submitBid}
                disabled={bidding || !bidAmount}
                className="px-6 py-3 rounded-xl bg-black text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800 transition-colors"
              >
                {bidding ? '입찰 중…' : '입찰하기'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-center mb-6">
            <p className="text-sm font-bold text-gray-500">
              {item.listingStatus === 'AWARDED' ? '🎉 낙찰이 확정된 매물입니다' : '입찰이 종료된 매물입니다'}
            </p>
          </div>
        )}

        {bids.length > 0 && (
          <div className="border-t border-gray-100">
            {bids.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  {b.isMine ? '내 입찰' : '다른 딜러'}
                  {b.status === 'WINNER' && <span className="ml-1.5 text-[10px] font-black text-violet-600">낙찰</span>}
                  {b.status === 'LOST' && <span className="ml-1.5 text-[10px] font-black text-gray-400">미낙찰</span>}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {b.isMine && typeof b.amount === 'number' ? fmtKRW(b.amount) : '비공개'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SaleListingDetailPage() {
  return (
    <AuctionAccessGate>
      <SaleListingDetailContent />
    </AuctionAccessGate>
  );
}
