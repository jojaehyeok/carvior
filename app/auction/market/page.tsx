'use client';

// 스마트옥션 입찰 화면 — 딜러가 하루에 수십 번 보는 작업 화면이다.
//
// 필터는 "내 차 사기"(/buy)와 같은 구조로 맞춘다: 차종 알약 한 줄 + 검색 + 정렬.
// 왼쪽 체크박스 사이드바는 같은 서비스 안에서 혼자 다른 조작법이라 어색했다.
// 경매에만 있는 상태(경매 중·마감 임박·종료)만 그 위에 탭으로 따로 둔다.
//
// ⚠ 다른 딜러의 입찰 금액·순위는 화면에 올리지 않는다. 서버가 애초에 안 내려준다(담합 방지).
// 보여줄 수 있는 건 "몇 명이 넣었는지"와 "내가 얼마에 넣었는지"뿐이다.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';

import AuctionAccessGate from '@/components/AuctionAccessGate';
import BidModal from '@/components/auction/BidModal';
import CountdownTimer from '@/components/auction/CountdownTimer';
import { AuctionItem, Bid, fetchItemBids, fmtKRW, getTimeLeftMs, NEW_MS, URGENT_MS } from '@/components/auction/shared';

type TabKey = 'active' | 'urgent' | 'new' | 'mine' | 'closed';
type SortKey = 'ending' | 'newest' | 'priceLow' | 'priceHigh' | 'mileage';

// /buy와 같은 목록 — 한쪽만 고치면 같은 차가 다른 칸에 걸린다
const CAR_TYPES = ['전체', 'SUV', '세단', '해치백', '경차', '소형차', '중형', '대형', 'RV'];

// 마감 매물은 7일 지나면 목록에서 숨긴다(레코드는 그대로 — 다른 화면의 stale 필터와 같은 패턴)
const CLOSED_STALE_MS = 7 * 24 * 60 * 60 * 1000;
function isVisible(item: AuctionItem): boolean {
  if (item.status === 'active') return true;
  if (!item.auctionEndAt) return true;
  return Date.now() - new Date(item.auctionEndAt).getTime() <= CLOSED_STALE_MS;
}

const regionOf = (item: AuctionItem) => item.region?.split(' ')[0] ?? '지역미상';

function AuctionContent() {
  const { data: session } = useSession();
  const dealerId = (session?.user as any)?.id ? Number((session?.user as any).id) : null;
  const dealerName = (session?.user as any)?.name ?? '딜러';

  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidsByItem, setBidsByItem] = useState<Record<string, { count: number; myBids: Bid[] }>>({});
  const [bidTarget, setBidTarget] = useState<AuctionItem | null>(null);

  const [tab, setTab] = useState<TabKey>('active');
  const [selectedType, setSelectedType] = useState('전체');
  const [reportOnly, setReportOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('ending');

  useEffect(() => {
    fetch('/api/admin/store-items')
      .then(r => r.json())
      .then(async (data: AuctionItem[]) => {
        const filtered = Array.isArray(data)
          ? data.filter(i => ['active', 'sold', 'closed'].includes(i.status) && isVisible(i))
          : [];
        setItems(filtered);
        const entries = await Promise.all(
          filtered.map(async item => [item.id, await fetchItemBids(item.id, dealerId ?? undefined)] as const),
        );
        setBidsByItem(Object.fromEntries(entries));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [dealerId]);

  const handleBid = async (itemId: string, amount: number) => {
    try {
      const res = await fetch(`/api/store-items/${itemId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? '입찰에 실패했습니다.'); return; }
    } catch {
      alert('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const fresh = await fetchItemBids(itemId, dealerId ?? undefined);
    setBidsByItem(prev => ({ ...prev, [itemId]: fresh }));
    alert(`✓ ${fmtKRW(amount)} 입찰 완료!\n최종 낙찰은 어드민에서 확인됩니다.`);
  };

  const getBidCount = (id: string) => bidsByItem[id]?.count ?? 0;
  const getMyBids = (id: string) => bidsByItem[id]?.myBids ?? [];
  const myTopBid = (id: string) => {
    const mine = getMyBids(id);
    return mine.length ? Math.max(...mine.map(b => b.amount)) : null;
  };

  // ── 탭별 모수 ────────────────────────────────────────────────
  const activeItems = items.filter(i => i.status === 'active');
  const urgentItems = activeItems.filter(i => {
    const ms = getTimeLeftMs(i.auctionEndAt);
    return ms !== null && ms > 0 && ms <= URGENT_MS;
  });
  const newItems = activeItems.filter(i => {
    if (!i.auctionStartAt) return false;
    const since = Date.now() - new Date(i.auctionStartAt).getTime();
    return since >= 0 && since <= NEW_MS;
  });
  const myItems = items.filter(i => getMyBids(i.id).length > 0);
  const closedItems = items.filter(i => i.status !== 'active');

  const base =
    tab === 'active' ? activeItems
    : tab === 'urgent' ? urgentItems
    : tab === 'new' ? newItems
    : tab === 'mine' ? myItems
    : closedItems;

  const filtered = useMemo(() => {
    const needle = search.trim();
    const list = base
      .filter(i => selectedType === '전체' || i.category === selectedType)
      .filter(i => !reportOnly || i.hasReport)
      .filter(i => !needle || (i.titleKo ?? '').includes(needle) || (i.carNumber ?? '').includes(needle) || (i.region ?? '').includes(needle));

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.auctionStartAt ?? 0).getTime() - new Date(a.auctionStartAt ?? 0).getTime();
      if (sortBy === 'priceLow') return (a.priceKRW ?? 0) - (b.priceKRW ?? 0);
      if (sortBy === 'priceHigh') return (b.priceKRW ?? 0) - (a.priceKRW ?? 0);
      if (sortBy === 'mileage') return (a.mileage ?? 0) - (b.mileage ?? 0);
      return (getTimeLeftMs(a.auctionEndAt) ?? Infinity) - (getTimeLeftMs(b.auctionEndAt) ?? Infinity);
    });
  }, [base, selectedType, reportOnly, search, sortBy]);

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'active', label: '경매 중', count: activeItems.length },
    { key: 'urgent', label: '마감 임박', count: urgentItems.length },
    { key: 'new', label: '신규', count: newItems.length },
    { key: 'mine', label: '내 입찰', count: myItems.length },
    { key: 'closed', label: '종료', count: closedItems.length },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── 머리띠 — /buy와 같은 자리, 같은 모양 ── */}
      <div className="bg-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase">스마트옥션</p>
            <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
              딜러 전용
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">진단 완료 차량 경매</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-zinc-400 text-sm">입찰은 바로 저장되고 수정할 수 있습니다. 다른 딜러의 입찰가는 공개되지 않습니다.</p>
            <Link href="/auction/sale-listings" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
              판매차량 목록 →
            </Link>
            <span className="ml-auto text-xs font-bold text-purple-300">{dealerName}</span>
          </div>
        </div>
      </div>

      {/* ── 경매 상태 탭 — 경매에만 있는 축이라 필터 위에 따로 ── */}
      <div className="border-b border-gray-100 sticky top-0 bg-white z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 -mb-px overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'px-3 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors',
                tab === t.key ? 'border-black text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700',
              )}
            >
              {t.label}
              <span className={clsx('ml-1 text-xs', tab === t.key ? 'text-violet-600' : 'text-gray-300')}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 필터 바 — /buy와 동일한 구조 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            {CAR_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={clsx(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                  selectedType === t
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
                )}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setReportOnly(v => !v)}
              className={clsx(
                'shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                reportOnly
                  ? 'bg-amber-400 text-amber-900 border-amber-400'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
              )}
            >
              ✦ 진단완료만
            </button>
          </div>
          <div className="flex gap-2 shrink-0">
            <input
              type="text"
              placeholder="차종 / 차량번호 / 지역"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 w-44"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
            >
              <option value="ending">마감 임박순</option>
              <option value="newest">최신순</option>
              <option value="priceLow">희망가 낮은순</option>
              <option value="priceHigh">희망가 높은순</option>
              <option value="mileage">주행거리순</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">총 {filtered.length}대</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold">조건에 맞는 차량이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(item => {
              const bidCount = getBidCount(item.id);
              const closed = item.status !== 'active';
              const thumb = item.photos?.exterior?.[0];
              const msLeft = getTimeLeftMs(item.auctionEndAt);
              const urgent = !closed && msLeft !== null && msLeft > 0 && msLeft <= URGENT_MS;
              const mine = myTopBid(item.id);
              const diff = mine != null ? mine - (item.priceKRW ?? 0) : null;

              return (
                <div
                  key={item.id}
                  className={clsx(
                    'rounded-2xl overflow-hidden border bg-white transition-all',
                    closed
                      ? 'border-gray-100 opacity-60'
                      : urgent
                        ? 'border-red-300 ring-2 ring-red-200/50 hover:shadow-lg'
                        : item.hasReport
                          ? 'border-amber-400 ring-2 ring-amber-300/40 hover:ring-amber-400/70 hover:shadow-lg'
                          : 'border-gray-100 hover:border-gray-300 hover:shadow-lg',
                  )}
                >
                  <Link href={`/auction/market/${item.id}`} className="group block relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={item.titleKo ?? item.carNumber}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 500 280" fill="none" className="w-4/5 opacity-20">
                          <rect x="40" y="140" width="420" height="100" rx="20" fill="#000" />
                          <path d="M110 140 L155 75 H345 L390 140Z" fill="#000" />
                          <circle cx="130" cy="220" r="40" fill="#333" />
                          <circle cx="370" cy="220" r="40" fill="#333" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {item.hasReport
                        ? <span className="bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-1 rounded-full">✦ 진단</span>
                        : <span className="bg-white/80 text-gray-500 text-[9px] font-bold px-2 py-1 rounded-full border border-gray-200">개인매물</span>}
                      {closed
                        ? <span className="bg-gray-600/80 text-white text-[9px] font-bold px-2 py-1 rounded-full">{item.status === 'sold' ? '낙찰완료' : '마감'}</span>
                        : urgent
                          ? <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full">🔥 마감임박</span>
                          : null}
                    </div>
                    {/* 남은 시간은 사진 위 오른쪽 아래 — 목록을 훑을 때 제일 먼저 보는 값 */}
                    {!closed && (
                      <div className="absolute bottom-2 right-2 bg-black/70 rounded-lg px-2 py-1">
                        <CountdownTimer endAt={item.auctionEndAt} size={16} />
                      </div>
                    )}
                  </Link>

                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-0.5">
                      {[item.year ? `${item.year}년` : null, regionOf(item)].filter(Boolean).join(' · ')}
                    </p>
                    <Link href={`/auction/market/${item.id}`} className="block font-bold text-gray-900 leading-snug mb-2 line-clamp-1 hover:underline">
                      {item.titleKo ?? '차종 미상'}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{item.mileage ? `${item.mileage.toLocaleString()} km` : '주행거리 미상'}</span>
                      <span>·</span>
                      <span className="font-mono">{item.carNumber}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-bold">희망가</span>
                        <span className="font-black text-gray-900 text-sm">{fmtKRW(item.priceKRW)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-bold">내 입찰가</span>
                        {mine != null ? (
                          <span className="font-black text-violet-600">
                            {fmtKRW(mine)}
                            {diff != null && diff !== 0 && (
                              <span className={clsx('ml-1 font-bold', diff > 0 ? 'text-emerald-600' : 'text-red-500')}>
                                ({diff > 0 ? '+' : '-'}{fmtKRW(Math.abs(diff))})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-bold">미입찰</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-bold">입찰</span>
                        <span className="font-bold text-gray-600">{bidCount}건</span>
                      </div>
                    </div>

                    <button
                      disabled={closed}
                      onClick={() => setBidTarget(item)}
                      className={clsx(
                        'w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-colors text-white disabled:bg-gray-100 disabled:text-gray-400',
                        urgent ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-gray-800',
                      )}
                    >
                      {closed
                        ? item.status === 'sold' ? '낙찰완료' : '경매 마감'
                        : mine != null ? '입찰 수정' : '입찰하기'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {bidTarget && (
        <BidModal
          item={bidTarget}
          bids={getMyBids(bidTarget.id)}
          onBid={handleBid}
          onClose={() => setBidTarget(null)}
        />
      )}
    </div>
  );
}

export default function AuctionMarketPage() {
  return (
    <AuctionAccessGate>
      <AuctionContent />
    </AuctionAccessGate>
  );
}
