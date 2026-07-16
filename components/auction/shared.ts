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
  status: 'active' | 'sold' | 'hidden' | 'pending';
  photos?: Record<string, string[]>;
  specs?: { label: string; value: string }[];
  options?: string[];
  inspectedAt?: string;
  adminMemo?: string;
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
