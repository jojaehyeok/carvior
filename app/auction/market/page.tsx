'use client';

// 스마트옥션 입찰 화면 — 딜러가 하루에 수십 번 보는 작업 화면이다.
//
// 안내문과 큰 사진으로 채우면 한 화면에 세 대밖에 안 들어와서, 입찰하려면 계속 스크롤해야 한다.
// 엔카프로처럼 왼쪽에 필터를 고정하고 카드를 조밀하게 깔아서, 설명 대신 숫자가 먼저 보이게 둔다.
//
// ⚠ 다른 딜러의 입찰 금액·순위는 화면에 올리지 않는다. 서버가 애초에 안 내려준다(담합 방지).
// 보여줄 수 있는 건 "몇 명이 넣었는지"와 "내가 얼마에 넣었는지"뿐이다.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import AuctionAccessGate from '@/components/AuctionAccessGate';
import BidModal from '@/components/auction/BidModal';
import CountdownTimer from '@/components/auction/CountdownTimer';
import { AuctionItem, Bid, fetchItemBids, fmtKRW, getTimeLeftMs, NEW_MS, URGENT_MS } from '@/components/auction/shared';

type TabKey = 'active' | 'urgent' | 'new' | 'mine' | 'closed';
type SortKey = 'ending' | 'newest' | 'priceLow' | 'priceHigh';

// 마감 매물은 7일 지나면 목록에서 숨긴다(레코드는 그대로 — 다른 화면의 stale 필터와 같은 패턴)
const CLOSED_STALE_MS = 7 * 24 * 60 * 60 * 1000;
function isVisible(item: AuctionItem): boolean {
  if (item.status === 'active') return true;
  if (!item.auctionEndAt) return true;
  return Date.now() - new Date(item.auctionEndAt).getTime() <= CLOSED_STALE_MS;
}

// 제조사 칸은 별도 필드가 없어서 차명 첫 낱말로 가른다("기아 더 뉴 쏘렌토" → 기아).
// 정확하진 않지만 목록을 좁히는 용도로는 충분하다.
const makerOf = (item: AuctionItem) => (item.titleKo ?? '').trim().split(/\s+/)[0] || '기타';
const regionOf = (item: AuctionItem) => item.region?.split(' ')[0] ?? '지역미상';

const SORT_LABEL: Record<SortKey, string> = {
  ending: '마감 임박순',
  newest: '최근 등록순',
  priceLow: '희망가 낮은순',
  priceHigh: '희망가 높은순',
};

function AuctionContent() {
  const { data: session } = useSession();
  const dealerId = (session?.user as any)?.id ? Number((session?.user as any).id) : null;
  const dealerName = (session?.user as any)?.name ?? '딜러';

  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidsByItem, setBidsByItem] = useState<Record<string, { count: number; myBids: Bid[] }>>({});
  const [bidTarget, setBidTarget] = useState<AuctionItem | null>(null);

  const [tab, setTab] = useState<TabKey>('active');
  const [sort, setSort] = useState<SortKey>('ending');
  const [q, setQ] = useState('');
  const [makers, setMakers] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [reportOnly, setReportOnly] = useState(false);

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

  // 필터 칸은 지금 탭에 실제로 있는 것만 — 눌러도 0건인 항목을 깔아두면 고르기만 번거롭다
  const makerCounts = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach(i => m.set(makerOf(i), (m.get(makerOf(i)) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [base]);

  const regionCounts = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach(i => m.set(regionOf(i), (m.get(regionOf(i)) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [base]);

  const displayItems = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = base.filter(i => {
      if (reportOnly && !i.hasReport) return false;
      if (makers.length && !makers.includes(makerOf(i))) return false;
      if (regions.length && !regions.includes(regionOf(i))) return false;
      if (needle) {
        const hay = `${i.titleKo ?? ''} ${i.carNumber ?? ''} ${i.trim ?? ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === 'ending') return (getTimeLeftMs(a.auctionEndAt) ?? Infinity) - (getTimeLeftMs(b.auctionEndAt) ?? Infinity);
      if (sort === 'newest') return new Date(b.auctionStartAt ?? 0).getTime() - new Date(a.auctionStartAt ?? 0).getTime();
      if (sort === 'priceLow') return (a.priceKRW ?? 0) - (b.priceKRW ?? 0);
      return (b.priceKRW ?? 0) - (a.priceKRW ?? 0);
    });
  }, [base, q, makers, regions, reportOnly, sort]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const resetFilters = () => { setMakers([]); setRegions([]); setReportOnly(false); setQ(''); };

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'active', label: '경매 중', count: activeItems.length },
    { key: 'urgent', label: '마감 임박', count: urgentItems.length },
    { key: 'new', label: '신규', count: newItems.length },
    { key: 'mine', label: '내 입찰', count: myItems.length },
    { key: 'closed', label: '종료', count: closedItems.length },
  ];

  const filterOn = makers.length > 0 || regions.length > 0 || reportOnly || q.trim() !== '';

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── 머리띠: 제목 + 탭. 안내문은 한 줄로 줄였다 ── */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-5">
          <div className="flex items-center gap-3 h-14">
            <span className="font-black text-zinc-900">스마트옥션</span>
            <span className="text-[10px] font-black bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">
              딜러 전용
            </span>
            <Link href="/auction/sale-listings" className="text-xs font-bold text-zinc-400 hover:text-zinc-700">
              판매차량 목록
            </Link>
            <span className="ml-auto text-xs font-bold text-zinc-500 truncate">{dealerName}</span>
          </div>

          <div className="flex items-center gap-1 -mb-px overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? 'border-violet-600 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {t.label}
                <span className={`ml-1 text-xs ${tab === t.key ? 'text-violet-600' : 'text-zinc-300'}`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-5 flex gap-5 items-start">
        {/* ── 왼쪽 필터 ── */}
        <aside className="hidden lg:block w-[200px] shrink-0 sticky top-[116px]">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black text-zinc-900">필터</p>
              {filterOn && (
                <button onClick={resetFilters} className="text-[11px] font-bold text-violet-600 hover:underline">
                  초기화
                </button>
              )}
            </div>

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-xs font-bold text-zinc-600">진단 완료만</span>
              <input
                type="checkbox"
                checked={reportOnly}
                onChange={e => setReportOnly(e.target.checked)}
                className="w-4 h-4 accent-violet-600"
              />
            </label>

            <div className="border-t border-zinc-100 mt-2 pt-3">
              <p className="text-[11px] font-black text-zinc-400 mb-1.5">제조사</p>
              {makerCounts.length === 0 && <p className="text-[11px] text-zinc-300 py-1">해당 없음</p>}
              {makerCounts.map(([m, c]) => (
                <label key={m} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={makers.includes(m)}
                    onChange={() => toggle(makers, setMakers, m)}
                    className="w-3.5 h-3.5 accent-violet-600"
                  />
                  <span className="text-xs text-zinc-600 group-hover:text-zinc-900 truncate flex-1">{m}</span>
                  <span className="text-[11px] text-zinc-300">{c}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-zinc-100 mt-2 pt-3">
              <p className="text-[11px] font-black text-zinc-400 mb-1.5">지역</p>
              {regionCounts.map(([r, c]) => (
                <label key={r} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={regions.includes(r)}
                    onChange={() => toggle(regions, setRegions, r)}
                    className="w-3.5 h-3.5 accent-violet-600"
                  />
                  <span className="text-xs text-zinc-600 group-hover:text-zinc-900 truncate flex-1">{r}</span>
                  <span className="text-[11px] text-zinc-300">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── 목록 ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <h1 className="text-lg font-black text-zinc-900">
              {TABS.find(t => t.key === tab)?.label} 차량 <span className="text-violet-600">{displayItems.length}</span>대
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="차량번호 · 차종 검색"
                className="w-44 sm:w-56 text-xs border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
              />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="text-xs font-bold border border-zinc-200 rounded-lg px-2 py-2 outline-none focus:border-violet-500 bg-white"
              >
                {(Object.keys(SORT_LABEL) as SortKey[]).map(k => (
                  <option key={k} value={k}>{SORT_LABEL[k]}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 mb-3">
            입찰은 즉시 저장되고 수정할 수 있습니다. 최종 낙찰 확정은 카비어 어드민에서 진행됩니다.
            다른 딜러의 입찰 금액은 공개되지 않습니다.
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-zinc-200 animate-pulse h-52" />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl text-center py-20 text-zinc-400">
              <p className="font-bold text-sm">조건에 맞는 차량이 없습니다.</p>
              {filterOn && (
                <button onClick={resetFilters} className="mt-3 text-xs font-bold text-violet-600 hover:underline">
                  필터 초기화
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {displayItems.map(item => {
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
                    className={`bg-white border rounded-xl overflow-hidden transition-colors ${
                      closed ? 'border-zinc-200 opacity-70' : urgent ? 'border-red-200' : 'border-zinc-200 hover:border-violet-300'
                    }`}
                  >
                    {/* 머리줄 — 상태와 남은 시간. 엔카프로처럼 카드 맨 위에 둔다 */}
                    <div className="flex items-center justify-between px-3 h-8 border-b border-zinc-100">
                      <span
                        className={`text-[11px] font-black ${
                          closed ? 'text-zinc-400' : urgent ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {closed ? (item.status === 'sold' ? '낙찰완료' : '마감') : urgent ? '마감임박' : '경매 중'}
                      </span>
                      {!closed && <CountdownTimer endAt={item.auctionEndAt} size={18} />}
                    </div>

                    {/* 차량 */}
                    <Link href={`/auction/market/${item.id}`} className="flex gap-3 p-3 hover:bg-zinc-50 transition-colors">
                      <div className="w-24 h-[66px] rounded-lg bg-zinc-100 overflow-hidden shrink-0 relative">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-300">
                            사진없음
                          </div>
                        )}
                        {item.hasReport && (
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            진단
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-zinc-900 truncate">{item.titleKo ?? '차종 미상'}</p>
                        {item.trim && <p className="text-[11px] text-zinc-400 truncate">{item.trim}</p>}
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {[
                            item.year ? `${String(item.year).slice(2)}년` : null,
                            item.mileage ? `${Math.round((item.mileage / 10000) * 10) / 10}만km` : null,
                            regionOf(item),
                          ].filter(Boolean).join(' · ')}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{item.carNumber}</p>
                      </div>
                    </Link>

                    {/* 숫자줄 — 설명 대신 이것부터 보이게 */}
                    <div className="px-3 pb-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-bold">희망가</span>
                        <span className="font-black text-zinc-900">{fmtKRW(item.priceKRW)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-bold">내 입찰가</span>
                        {mine != null ? (
                          <span className="font-black text-violet-600">
                            {fmtKRW(mine)}
                            {diff != null && diff !== 0 && (
                              <span className={`ml-1 font-bold ${diff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                ({diff > 0 ? '+' : '-'}{fmtKRW(Math.abs(diff))})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-zinc-300 font-bold">미입찰</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-bold">입찰</span>
                        <span className="font-bold text-zinc-600">{bidCount}건</span>
                      </div>

                      <button
                        disabled={closed}
                        onClick={() => setBidTarget(item)}
                        className={`w-full mt-2 py-2.5 rounded-lg text-xs font-black transition-colors text-white disabled:bg-zinc-100 disabled:text-zinc-400 ${
                          urgent ? 'bg-red-500 hover:bg-red-600' : 'bg-zinc-900 hover:bg-zinc-700'
                        }`}
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
