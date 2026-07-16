'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import AuctionAccessGate from '@/components/AuctionAccessGate';
import BidModal from '@/components/auction/BidModal';
import { AuctionItem, Bid, fmtKRW, getUSD, loadBids, saveBid } from '@/components/auction/shared';

interface PhotoItem { url: string; label: string; }

function collectPhotos(item: AuctionItem): PhotoItem[] {
  const p = item.photos;
  if (!p) return [];
  const result: PhotoItem[] = [];
  p.exterior?.forEach(url => result.push({ url, label: '외관' }));
  p.interior?.forEach(url => result.push({ url, label: '실내' }));
  p.extra?.forEach(url => result.push({ url, label: '옵션' }));
  p.engine?.forEach(url => result.push({ url, label: '엔진룸' }));
  p.wheel?.forEach(url => result.push({ url, label: '휠' }));
  p.dashboard?.forEach(url => result.push({ url, label: '계기판' }));
  // registration/vin(개인정보)은 표시하지 않음
  return result;
}

function CarSilhouette() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 500 280" fill="none" className="w-1/2 opacity-10">
        <rect x="40" y="140" width="420" height="100" rx="20" fill="#000"/>
        <path d="M110 140 L155 75 H345 L390 140Z" fill="#000"/>
        <circle cx="130" cy="220" r="40" fill="#333"/>
        <circle cx="370" cy="220" r="40" fill="#333"/>
      </svg>
    </div>
  );
}

function AuctionDetailContent() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data: session } = useSession();
  const dealerName = (session?.user as any)?.name ?? '딜러';

  const [item, setItem] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidOpen, setBidOpen] = useState(false);

  useEffect(() => {
    setBids(loadBids());
    fetch('/api/admin/store-items')
      .then(r => r.json())
      .then((items: AuctionItem[]) => {
        const found = Array.isArray(items) ? items.find(i => String(i.id) === String(id)) : null;
        setItem(found ?? null);
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBid = (itemId: string, amount: number) => {
    const updated = saveBid(bids, itemId, amount, dealerName);
    setBids(updated);
    alert(`✓ ${fmtKRW(amount)} 입찰 완료!\n최종 낙찰은 어드민에서 확인됩니다.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-400">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-bold">매물을 찾을 수 없습니다</p>
        <Link href="/auction/market" className="mt-4 text-sm underline">목록으로 돌아가기</Link>
      </div>
    );
  }

  const photos = collectPhotos(item);
  const hasPhotos = photos.length > 0;
  const myBids = bids.filter(b => b.itemId === item.id);
  const topBid = myBids.reduce((max, b) => Math.max(max, b.amount), 0);
  const closed = item.status !== 'active';

  const specRows: [string, string | number | undefined][] = [
    ['연식', item.year],
    ['주행거리', item.mileage ? `${item.mileage.toLocaleString()} km` : undefined],
    ['연료', item.fuel],
    ['배기량', item.displacement],
    ['변속기', item.transmission],
    ['색상', item.colorKo],
    ['사고이력', item.accident === undefined ? undefined : (item.accident ? '있음' : '없음')],
    ['지역', item.region],
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/auction" className="hover:text-black transition-colors">스마트옥션</Link>
          <span>/</span>
          <Link href="/auction/market" className="hover:text-black transition-colors">경매장</Link>
          <span>/</span>
          <span className="text-gray-600 font-semibold truncate max-w-[200px]">{item.titleKo ?? item.carNumber}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* 왼쪽: 사진 갤러리 */}
          <div>
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden border border-gray-100 rounded-2xl">
              {hasPhotos ? (
                <img src={photos[activePhoto].url} alt={photos[activePhoto].label} className="w-full h-full object-cover" />
              ) : (
                <CarSilhouette />
              )}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full">진단완료</span>
                {closed
                  ? <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">{item.status === 'sold' ? '낙찰완료' : '마감'}</span>
                  : <span className="bg-green-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">진행중</span>
                }
              </div>
              {hasPhotos && (
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {activePhoto + 1} / {photos.length}
                </div>
              )}
            </div>

            {hasPhotos && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`relative shrink-0 w-[90px] h-[60px] overflow-hidden rounded-lg border-2 transition-all ${
                      activePhoto === i ? 'border-black' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded">{p.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 스펙 */}
            <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-500 mb-3">차량 정보</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {specRows.filter(([, v]) => v !== undefined && v !== '').map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {item.adminMemo && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-xs font-bold text-amber-700 mb-2">평가사 코멘트</p>
                <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{item.adminMemo}</p>
              </div>
            )}
          </div>

          {/* 오른쪽: 입찰 패널 */}
          <div>
            <div className="sticky top-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h1 className="text-xl font-black text-gray-900 mb-1">{item.titleKo ?? '차종 미상'}</h1>
              <p className="text-xs text-gray-400 mb-5">{item.carNumber} · {item.trim ?? ''}</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-gray-400">예상 낙찰가</p>
                  <p className="text-lg font-black text-gray-900">{fmtKRW(item.priceKRW)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-gray-400">예상 수출가</p>
                  <p className="text-lg font-black text-gray-900">${getUSD(item).toLocaleString()}</p>
                </div>
              </div>

              {topBid > 0 && (
                <div className="mb-5 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-violet-500 font-bold">내 최고 입찰가</span>
                  <span className="text-violet-700 font-black">{fmtKRW(topBid)}</span>
                </div>
              )}

              <button
                disabled={closed}
                onClick={() => setBidOpen(true)}
                className="w-full py-4 rounded-xl text-sm font-bold transition-colors bg-black hover:bg-gray-800 text-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                {closed ? (item.status === 'sold' ? '낙찰완료' : '경매 마감') : myBids.length > 0 ? '입찰 수정' : '입찰하기'}
              </button>
              <p className="text-center text-gray-400 text-[11px] mt-3">
                데모 버전 · 실제 거래는 어드민을 통해 진행됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {bidOpen && (
        <BidModal
          item={item}
          bids={bids}
          onBid={handleBid}
          onClose={() => setBidOpen(false)}
        />
      )}
    </div>
  );
}

export default function AuctionDetailPage() {
  return (
    <AuctionAccessGate>
      <AuctionDetailContent />
    </AuctionAccessGate>
  );
}
