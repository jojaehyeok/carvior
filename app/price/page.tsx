'use client';

import { useState } from 'react';
import Link from 'next/link';
import PriceChart from '@/components/PriceChart';

type SpecMatch = { manufacturer: string; model: string; badge: string; count: number };
type Listing = {
  id: string;
  model: string;
  badge: string;
  year: string;
  mileage: number;
  fuel: string;
  priceManwon: number;
  thumbnailPath: string | null;
};

export default function PricePage() {
  const API = process.env.NEXT_PUBLIC_API_ENDPOINT;

  const [query, setQuery] = useState('');
  const [step, setStep] = useState<'search' | 'listings'>('search');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<SpecMatch[]>([]);
  const [selected, setSelected] = useState<SpecMatch | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [searched, setSearched] = useState(false);
  const [mileageInput, setMileageInput] = useState('');

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

  const handleSelect = async (m: SpecMatch) => {
    setSelected(m);
    setStep('listings');
    setLoading(true);
    setListings([]);
    try {
      const qs = new URLSearchParams({ manufacturer: m.manufacturer, model: m.model, badge: m.badge });
      const res = await fetch(`${API}/external/car-spec/listings?${qs.toString()}`);
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
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

        {loading && (
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
        {!loading && step === 'listings' && (
          <div>
            <button
              onClick={() => setStep('search')}
              className="text-xs text-gray-400 mb-4 hover:text-gray-600"
            >
              ‹ 다시 선택하기
            </button>
            <p className="text-sm font-bold text-gray-900 mb-1">{selected?.manufacturer} {selected?.model}</p>
            <p className="text-xs text-gray-400 mb-5">{selected?.badge} · 실거래 비교매물</p>

            {listings.length > 0 && (
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
                />
              </div>
            )}

            {listings.length === 0 ? (
              <div className="text-center text-gray-400 py-10">비교할 매물을 찾지 못했어요.</div>
            ) : (
              <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                {listings.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{l.badge}</p>
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

        {/* 임시 대안 — 실사 신청 유도는 계속 유지 */}
        <div className="bg-black text-white rounded-2xl p-6 text-left mt-10">
          <p className="text-xs font-black tracking-widest uppercase text-white/40 mb-2">더 정확한 시세를 원하신다면</p>
          <h2 className="text-lg font-black mb-1.5">무료 시세 산정 받기</h2>
          <p className="text-white/50 text-sm mb-5">
            진단사가 직접 방문해 차량을 확인하고<br />
            정확한 시세를 알려드립니다.
          </p>
          <Link
            href="/marketing/carvior-inspection"
            className="inline-block bg-white text-black font-black px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
          >
            무료 시세 산정 신청 →
          </Link>
        </div>
      </div>
    </div>
  );
}
