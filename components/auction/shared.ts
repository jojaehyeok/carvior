const USD_RATE = 1350;

export interface AuctionItem {
  id: string;
  carNumber: string;
  titleKo?: string;
  titleEn?: string;
  trim?: string;
  year?: number;
  mileage?: number;
  fuel?: string;
  displacement?: string;
  transmission?: string;
  colorKo?: string;
  accident?: boolean;
  priceKRW: number;
  priceUSD?: number;
  region?: string;
  status: 'active' | 'sold' | 'hidden' | 'pending' | 'closed';
  auctionStartAt?: string;
  auctionEndAt?: string;
  carHash?: string;
  hasReport?: boolean;
  photos?: Record<string, string[]>;
  specs?: { label: string; value: string }[];
  options?: string[];
  inspectedAt?: string;
  adminMemo?: string;
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

// 백엔드 bids 테이블(carvior-back/src/bids/entities/bid.entity.ts)과 동일한 필드
export interface Bid {
  id?: number;
  storeItemId: number;
  dealerId?: number | null;
  dealerName: string;
  amount: number;
  createdAt: string;
}

// 매물 하나의 실제 입찰 목록 — /external/store-items/:id/bids 그대로 반환
// 다른 딜러의 입찰 금액/이름은 절대 내려주지 않음(경쟁입찰 담합 방지) — 서버가 이미
// dealerId 기준으로 걸러서 myBids만 주고, 전체는 count(인원수)로만 알려준다.
export async function fetchItemBids(itemId: string | number, dealerId?: number | null): Promise<{ count: number; myBids: Bid[] }> {
  const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const KEY = process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '';
  try {
    const qs = dealerId != null ? `?dealerId=${dealerId}` : '';
    const res = await fetch(`${API}/external/store-items/${itemId}/bids${qs}`, {
      headers: { 'x-internal-key': KEY },
    });
    if (!res.ok) return { count: 0, myBids: [] };
    const data = await res.json();
    return { count: data?.count ?? 0, myBids: Array.isArray(data?.myBids) ? data.myBids : [] };
  } catch {
    return { count: 0, myBids: [] };
  }
}

export function fmtDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function fmtKRW(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  return `${Math.round(n / 10_000)}만원`;
}

export function getUSD(item: AuctionItem) {
  if (item.priceUSD && item.priceUSD > 0) return item.priceUSD;
  return item.priceKRW ? Math.round(item.priceKRW / USD_RATE) : 0;
}

export function getTimeLeftMs(endAt?: string): number | null {
  if (!endAt) return null;
  return new Date(endAt).getTime() - Date.now();
}

export function timeLeftLabel(endAt?: string): string | null {
  const diff = getTimeLeftMs(endAt);
  if (diff === null) return null;
  if (diff <= 0) return '마감';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}시간 ${m}분 남음` : `${m}분 남음`;
}

// 마감 임박 기준: 6시간 이내
export const URGENT_MS = 6 * 60 * 60 * 1000;
// 신규매물 기준: 게시 12시간 이내
export const NEW_MS = 12 * 60 * 60 * 1000;
