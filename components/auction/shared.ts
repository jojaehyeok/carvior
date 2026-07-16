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

export interface Bid {
  itemId: string;
  amount: number;
  dealerName: string;
  timestamp: string;
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

export function loadBids(): Bid[] {
  try {
    const saved = localStorage.getItem('carvior_bids');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export function saveBid(bids: Bid[], itemId: string, amount: number, dealerName: string): Bid[] {
  const updated = [...bids, { itemId, amount, dealerName, timestamp: new Date().toISOString() }];
  localStorage.setItem('carvior_bids', JSON.stringify(updated));
  return updated;
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
