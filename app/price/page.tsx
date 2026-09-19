'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PriceChart from '@/components/PriceChart';

type SpecMatch = { manufacturer: string; model: string; badge: string; count: number };
// 같은 모델그룹 안의 세대 — 스포티지면 "스포티지 5세대 / 더 볼드 / 4세대..." 처럼 나온다.
// 세대가 다르면 사실상 다른 차라서 시세도 완전히 다르다.
type Generation = { generation: string; count: number; yearMin: number; yearMax: number };
type Listing = {
  id: string;
  model: string;
  badge: string;
  year: string;
  mileage: number;
  fuel: string;
  priceManwon: number;
  thumbnailUrl: string | null;
};

export default function PricePage() {
  return (
    <Suspense fallback={null}>
      <PricePageInner />
    </Suspense>
  );
}

function PricePageInner() {
  const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [step, setStep] = useState<'search' | 'listings'>('search');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<SpecMatch[]>([]);
  const [selected, setSelected] = useState<SpecMatch | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [searched, setSearched] = useState(false);
  const [mileageInput, setMileageInput] = useState('');
  const [generations, setGenerations] = useState<Generation[]>([]);
  // null = 전체 세대(기존 동작). 세대를 고르면 그 세대 매물만으로 시세를 다시 계산한다.
  const [generation, setGeneration] = useState<string | null>(null);

  // 대시보드 등에서 ?manufacturer=&model=&badge=&mileage= 로 딥링크하면 검색 단계를 건너뛰고
  // 바로 그 등급의 그래프를 보여준다.
  useEffect(() => {
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    if (!manufacturer || !model) return;
    const badge = searchParams.get('badge') || '';
    const mileageParam = searchParams.get('mileage');
    if (mileageParam) setMileageInput(mileageParam);
    setQuery(`${manufacturer} ${model}`);
    setSearched(true);
    handleSelect({ manufacturer, model, badge, count: 0 }, searchParams.get('generation'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setStep('search');
    try {
      const res = await fetch(`${API}/external/car-spec/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // 매물 조회 — gen이 있으면 그 세대만, 없으면 기존처럼 모델그룹 전체를 섞어서 본다.
  const fetchListings = async (m: SpecMatch, gen: string | null) => {
    setLoading(true);
    setListings([]);
    try {
      const qs = new URLSearchParams({ manufacturer: m.manufacturer, model: m.model, badge: m.badge });
      if (gen) qs.set('generation', gen);
      const res = await fetch(`${API}/external/car-spec/listings?${qs.toString()}`);
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (m: SpecMatch, gen: string | null = null) => {
    setSelected(m);
    setStep('listings');
    setGeneration(gen);
    setGenerations([]);
    // 세대 목록은 그래프를 막지 않고 따로 받아온다 — 실패해도 전체 세대 기준 시세는 그대로 보인다.
    const qs = new URLSearchParams({ manufacturer: m.manufacturer, model: m.model, badge: m.badge });
    fetch(`${API}/external/car-spec/generations?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => setGenerations(Array.isArray(d) ? d : []))
      .catch(() => setGenerations([]));
    await fetchListings(m, gen);
  };

  const handleGeneration = (gen: string | null) => {
    if (!selected || gen === generation) return;
    setGeneration(gen);
    void fetchListings(selected, gen);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-8">
            <svg width="36" height="36" fill="none" stroke="#6b7280" strokeWidth={1.5} viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">내 차 시세 조회</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            차종을 입력하면 실제 비교 매물의 시세를 바로 보여드려요.
          </p>
        </div>

        {/* 검색창 */}
        <div className="flex gap-2 mb-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="예: 투싼, 그랜저 IG, BMW 320i"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="bg-black text-white font-bold px-6 rounded-xl disabled:opacity-30 hover:bg-gray-800 transition-colors"
          >
            조회
          </button>
        </div>

        {loading && step === 'search' && (
          <div className="text-center text-gray-400 py-10">불러오는 중...</div>
        )}

        {/* 1단계: 등급 선택 */}
        {!loading && step === 'search' && searched && (
          matches.length === 0 ? (
            <div className="text-center text-gray-400 py-10">일치하는 차종을 찾지 못했어요.</div>
          ) : (
            <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {matches.map((m, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(m)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">{m.manufacturer} {m.model}</p>
                    <p className="text-xs text-gray-400 mt-1">{m.badge}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">매물 {m.count}건 ›</span>
                </button>
              ))}
            </div>
          )
        )}

        {/* 2단계: 비교 매물 시세 */}
        {step === 'listings' && (
          <div>
            <button
              onClick={() => setStep('search')}
              className="text-xs text-gray-400 mb-4 hover:text-gray-600"
            >
              ‹ 다시 선택하기
            </button>
            <p className="text-sm font-bold text-gray-900 mb-1">{selected?.manufacturer} {selected?.model}</p>
            <p className="text-xs text-gray-400 mb-5">{selected?.badge} · 실거래 비교매물</p>

            {/* 세대 선택 — 같은 스포티지라도 NQ5와 더 볼드는 시세가 완전히 달라서, 세대를
                안 나누면 전 세대가 한 그래프에 섞여 추세선이 엉뚱하게 나온다. */}
            {generations.length > 1 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 mb-2">세대 선택</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGeneration(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      generation === null
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    전체
                  </button>
                  {generations.map((g) => (
                    <button
                      key={g.generation}
                      onClick={() => handleGeneration(g.generation)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        generation === g.generation
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {g.generation}
                      {g.yearMin > 0 && (
                        <span className="ml-1 font-normal opacity-60">
                          {g.yearMin === g.yearMax ? `${g.yearMin}` : `${g.yearMin}~${g.yearMax}`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && <div className="text-center text-gray-400 py-10">불러오는 중...</div>}

            {!loading && listings.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    value={mileageInput}
                    onChange={(e) => setMileageInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="내 차 주행거리(km)를 입력하면 예상시세를 볼 수 있어요"
                    inputMode="numeric"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <PriceChart
                  listings={listings}
                  targetMileage={mileageInput ? parseInt(mileageInput, 10) : undefined}
                  subtitle={selected ? `${generation || `${selected.manufacturer} ${selected.model}`} · ${selected.badge}` : undefined}
                  depRangeLow={searchParams.get('depLow') ? Number(searchParams.get('depLow')) : undefined}
                  depRangeHigh={searchParams.get('depHigh') ? Number(searchParams.get('depHigh')) : undefined}
                  depLabel={searchParams.get('depLabel') || undefined}
                />
              </div>
            )}

            {loading ? null : listings.length === 0 ? (
              <div className="text-center text-gray-400 py-10">비교할 매물을 찾지 못했어요.</div>
            ) : (
              <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                {listings.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 px-5 py-4">
                    {l.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.thumbnailUrl}
                        alt=""
                        className="w-16 h-12 rounded-lg object-cover shrink-0 bg-gray-100"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-16 h-12 rounded-lg bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{l.badge}</p>
                      {/* 전체 세대를 섞어 볼 때 이 매물이 어느 세대인지 알 수 있어야 한다 */}
                      {l.model && <p className="text-xs text-gray-500 mt-0.5 truncate">{l.model}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {l.year}년식 · {l.mileage?.toLocaleString()}km · {l.fuel}
                      </p>
                    </div>
                    <span className="shrink-0 text-base font-black text-gray-900">
                      {l.priceManwon?.toLocaleString()}만원
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
