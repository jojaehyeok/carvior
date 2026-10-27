'use client';

// 개인 직거래 매물 상세 — 정찰가로 올라온 차 한 대를 보여준다.
//
// 돈이 되는 지점은 두 곳이다. 리포트가 이미 있으면 "리포트 보기"로 신뢰를 주고,
// 없으면 "이 차 검차 신청"으로 보낸다(구매 전 검차 = 카비어 매출).
// 판매자 연락처는 화면에 바로 띄우지 않는다 — 번호가 그대로 노출되면 영업 전화에 털린다.
// 2단계에서 채팅이 붙으면 "문의하기"가 채팅방으로 연결된다.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SideRail from '@/components/SideRail';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { pushRecent } from '@/lib/garage';
import HeartButton from '@/components/HeartButton';
import ReportModal from '@/components/ReportModal';
import { tokenErrorMessage, useApiToken } from '@/lib/useApiToken';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

interface Listing {
  id: number;
  titleKo: string;
  trim?: string;
  year: number;
  mileage: number;
  fuel?: string;
  displacement?: number;
  transmission?: string;
  colorKo?: string;
  accident: boolean;
  askingPrice: number | null;
  category?: string;
  region?: string;
  location?: string;
  photos?: Record<string, string[] | undefined>;
  hasReport?: boolean | number;
  carHash?: string | null;
  registeredAt?: string;
  sellerUserId?: number | null;
  sellerRating?: number | null;
  sellerReviewCount?: number;
}

interface SellerReview {
  id: number;
  rating: number;
  text: string | null;
  createdAt: string;
  writerName: string;
}

const fmtPrice = (n: number | null) => {
  if (!n) return '가격 문의';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  return `${Math.round(n / 10_000).toLocaleString()}만원`;
};

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [opening, setOpening] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reviews, setReviews] = useState<SellerReview[] | null>(null);
  const { token: apiToken, ready: tokenReady, status: authStatus, error: tokenError } = useApiToken();
  const router = useRouter();

  // 문의하기 — 로그인한 사람만. 이미 대화한 적 있으면 그 방으로 들어간다.
  const openChat = async () => {
    // 토큰을 아직 받아오는 중이면 아무것도 하지 않는다 — 이미 로그인한 사람을 로그인으로 보내면 안 된다
    if (!tokenReady) return;
    if (!apiToken) {
      // 로그인 자체가 안 된 사람만 로그인으로 보낸다
      if (authStatus === 'authenticated') { alert(tokenErrorMessage(tokenError)); return; }
      router.push(`/login?callbackUrl=/market/${id}`);
      return;
    }
    setOpening(true);
    try {
      const res = await fetch(`${API}/chat/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({ storeItemId: Number(id) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.message ?? '문의를 시작하지 못했습니다.');
        return;
      }
      const { roomId } = await res.json();
      router.push(`/chat/${roomId}`);
    } finally {
      setOpening(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/public/personal-listings/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  // 본 차를 기록해둔다(오른쪽 '최근 본 차량'에서 다시 찾을 수 있게)
  useEffect(() => {
    if (!item) return;
    pushRecent({
      id: item.id,
      title: item.titleKo,
      photo: item.photos?.exterior?.[0] ?? null,
      price: item.askingPrice,
    });
  }, [item]);

  // 판매자 후기 — 평점이 있을 때만 불러온다(없는 사람에게 빈 목록을 조회할 필요가 없다)
  const loadReviews = async () => {
    if (!item?.sellerUserId) return;
    const list = await fetch(`${API}/trade-reviews/users/${item.sellerUserId}`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
    setReviews(Array.isArray(list) ? list : []);
  };

  if (loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">불러오는 중…</main>;
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5">
        <p className="text-sm text-gray-500">매물을 찾을 수 없습니다. 이미 거래가 끝났을 수 있어요.</p>
        <Link href="/market" className="text-sm font-bold text-violet-600 hover:underline">← 매물 목록으로</Link>
      </main>
    );
  }

  // 사진은 카테고리별로 나뉘어 있는데(외관·실내·엔진룸…) 상세에선 한 줄로 합쳐서 넘겨본다
  const photos = Object.values(item.photos ?? {}).flat().filter(Boolean) as string[];
  const hasReport = !!item.hasReport;

  const SPECS: { label: string; value?: string | number | null }[] = [
    { label: '연식', value: item.year ? `${item.year}년` : null },
    { label: '주행거리', value: item.mileage ? `${item.mileage.toLocaleString()}km` : null },
    { label: '연료', value: item.fuel },
    { label: '변속기', value: item.transmission },
    { label: '배기량', value: item.displacement ? `${item.displacement.toLocaleString()}cc` : null },
    { label: '색상', value: item.colorKo },
    { label: '지역', value: item.region },
    { label: '사고 여부', value: item.accident ? '사고 이력 있음' : '무사고(신고 기준)' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/market" className="text-sm font-bold text-gray-400 hover:text-violet-600">← 매물 목록</Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
          {/* 사진 */}
          <div className="lg:col-span-3">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden">
              {photos[photoIdx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[photoIdx]} alt={item.titleKo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">사진 준비 중</div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={p + i}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${i === photoIdx ? 'border-violet-500' : 'border-transparent'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 정보 + 행동 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {hasReport && (
                <span className="inline-block bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-black px-2.5 py-1 rounded-full mb-3">
                  🔍 카비어 진단 완료
                </span>
              )}
              <h1 className="text-2xl font-black text-gray-900">{item.titleKo}</h1>
              {item.trim && <p className="text-sm text-gray-400 mt-1">{item.trim}</p>}

              <div className="flex items-center justify-between gap-3 mt-5">
                <p className="text-3xl font-black text-violet-700">{fmtPrice(item.askingPrice)}</p>
                <HeartButton
                  car={{ id: item.id, title: item.titleKo, photo: item.photos?.exterior?.[0] ?? null, price: item.askingPrice }}
                  className="shrink-0"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">판매자가 정한 가격입니다. 문의로 조정하실 수 있어요.</p>

              {/* 판매자 평점 — 개인 거래는 상대가 어떤 사람인지가 가장 큰 정보다 */}
              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                {item.sellerReviewCount ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500">판매자 거래 후기</p>
                      <p className="text-sm font-black text-slate-800">
                        <span className="text-amber-500">★</span> {item.sellerRating}
                        <span className="text-xs font-bold text-slate-400 ml-1">({item.sellerReviewCount})</span>
                      </p>
                    </div>
                    {reviews === null ? (
                      <button onClick={loadReviews} className="text-[11px] font-bold text-violet-600 hover:underline mt-2">
                        후기 보기
                      </button>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {reviews.map((r) => (
                          <li key={r.id} className="text-[11px] leading-relaxed">
                            <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
                            <span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span>
                            <span className="text-slate-400 ml-1.5">{r.writerName}</span>
                            {r.text && <span className="block text-slate-600">{r.text}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    아직 거래 후기가 없는 판매자입니다. 계약 전에 차량 상태를 꼭 직접 확인하세요.
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={openChat}
                  disabled={opening}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-3.5 rounded-xl text-sm transition-colors"
                >
                  {opening ? '여는 중…' : '판매자에게 문의하기'}
                </button>

                {hasReport && item.carHash ? (
                  <Link
                    href={`/car-report/${item.carHash}`}
                    className="block w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors"
                  >
                    진단 리포트 보기
                  </Link>
                ) : (
                  <Link
                    href="/call-evaluator"
                    className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-3.5 rounded-xl text-sm text-center transition-colors"
                  >
                    이 차, 평가사 부르기
                  </Link>
                )}
              </div>

              {!hasReport && (
                <p className="text-[12px] leading-relaxed text-gray-500 mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  이 차는 아직 카비어 진단을 받지 않았습니다. 개인 간 거래는 상태를 확인하기 어렵습니다 —
                  <strong className="font-bold"> 계약 전에 평가사를 불러 확인해보시는 것을 권합니다.</strong>
                </p>
              )}
            </div>

            {/* 제원 */}
            <div className="bg-white rounded-2xl border border-gray-200 mt-5 divide-y divide-gray-100">
              {SPECS.filter((s) => s.value).map((s) => (
                <div key={s.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs font-bold text-gray-400">{s.label}</span>
                  <span className="text-sm font-bold text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] leading-relaxed text-gray-400 mt-4">
              카비어는 개인 간 직거래를 연결만 하며 거래 당사자가 아닙니다. 차량 상태·명의이전·대금은
              당사자끼리 확인하셔야 합니다.
            </p>

            <button
              onClick={() => {
                // 신고는 로그인한 사람만 — 익명 신고를 받으면 장난 신고를 막을 수 없다
                if (!tokenReady) return;
                if (!apiToken) {
                  if (authStatus === 'authenticated') { alert(tokenErrorMessage(tokenError)); return; }
                  router.push(`/login?callbackUrl=/market/${id}`);
                  return;
                }
                setReporting(true);
              }}
              className="mt-3 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              🚩 이 매물 신고하기
            </button>
          </div>
        </div>
      </div>
      <SideRail />
      {reporting && (
        <ReportModal targetType="listing" targetId={item.id} token={apiToken} onClose={() => setReporting(false)} />
      )}
    </main>
  );
}
