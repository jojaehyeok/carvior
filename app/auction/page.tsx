'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { isApprovedDealer } from '@/lib/dealerAccess';

interface AuctionItem {
  id: number;
  carNumber: string;
  carModel?: string;
  address: string;
  preferredDateTime: string;
  completedAt?: string;
  updatedAt?: string;
  assignedDriverName?: string;
  // Inspection data (may be attached)
  mileage?: number;
  color?: string;
  repairCost?: number;
  photos?: { exterior?: string[] };
  carHash?: string;
}

interface Bid {
  itemId: number;
  amount: number;
  dealerName: string;
  timestamp: string;
}

function fmtDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtKRW(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  return `${Math.round(n / 10_000)}만원`;
}
function timeLeft(completedAt?: string): string {
  if (!completedAt) return '마감';
  const end = new Date(completedAt).getTime() + 72 * 60 * 60 * 1000;
  const diff = end - Date.now();
  if (diff <= 0) return '마감';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}시간 ${m}분`;
}

function BidModal({
  item,
  bids,
  onBid,
  onClose,
}: {
  item: AuctionItem;
  bids: Bid[];
  onBid: (itemId: number, amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const myBids = bids.filter(b => b.itemId === item.id);
  const topBid = myBids.reduce((max, b) => Math.max(max, b.amount), 0);

  const handleSubmit = () => {
    const n = Number(amount.replace(/[^0-9]/g, '')) * 10_000;
    if (!n || n < 100_000) { alert('100만원 이상 입력해주세요.'); return; }
    onBid(item.id, n);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-black p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">경매 입찰</p>
              <h2 className="text-white font-black text-lg mt-0.5">{item.carModel ?? item.carNumber}</h2>
              <p className="text-white/40 text-sm mt-0.5">{item.carNumber} · {item.address?.split(' ')[0]}</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none p-1">×</button>
          </div>
          {topBid > 0 && (
            <div className="mt-4 bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white/50 text-xs">내 최고 입찰가</span>
              <span className="text-white font-black">{fmtKRW(topBid)}</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-500 mb-2">입찰가 (만원 단위)</label>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="예: 2500"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <span className="flex items-center text-sm text-gray-400 font-bold">만원</span>
          </div>
          {amount && Number(amount) >= 100 && (
            <p className="text-sm text-gray-500 mb-3">
              총 입찰가: <strong className="text-gray-900">{fmtKRW(Number(amount) * 10_000)}</strong>
            </p>
          )}

          {/* 빠른 금액 버튼 */}
          <div className="flex gap-2 flex-wrap mb-5">
            {[1000, 1500, 2000, 2500, 3000].map(v => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {v >= 10000 ? `${v / 10000}억` : `${v}만`}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
          >
            입찰하기
          </button>
          <p className="text-center text-gray-400 text-xs mt-3">
            데모 버전 · 실제 거래는 어드민을 통해 진행됩니다.
          </p>
        </div>

        {myBids.length > 0 && (
          <div className="border-t border-gray-100 px-5 pb-5">
            <p className="text-xs font-semibold text-gray-400 mt-4 mb-2">내 입찰 내역</p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {[...myBids].reverse().map((b, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-500">
                  <span>{fmtDate(b.timestamp)}</span>
                  <span className="font-semibold text-gray-900">{fmtKRW(b.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuctionContent() {
  const { data: session } = useSession();
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidTarget, setBidTarget] = useState<AuctionItem | null>(null);
  const dealerName = (session?.user as any)?.name ?? '딜러';

  useEffect(() => {
    // 입찰 내역 복원
    try {
      const savedBids = localStorage.getItem('carvior_bids');
      if (savedBids) setBids(JSON.parse(savedBids));
    } catch {}

    fetch('/api/admin/bookings')
      .then(r => r.json())
      .then((data: AuctionItem[]) => setItems(Array.isArray(data) ? data.slice(0, 20) : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleBid = (itemId: number, amount: number) => {
    const newBid: Bid = { itemId, amount, dealerName, timestamp: new Date().toISOString() };
    const updated = [...bids, newBid];
    setBids(updated);
    localStorage.setItem('carvior_bids', JSON.stringify(updated));
    alert(`✓ ${fmtKRW(amount)} 입찰 완료!\n최종 낙찰은 어드민에서 확인됩니다.`);
  };

  const getBidCount = (id: number) => bids.filter(b => b.itemId === id).length;
  const getTopBid = (id: number) => bids.filter(b => b.itemId === id).reduce((max, b) => Math.max(max, b.amount), 0);

  return (
    <>
      {/* 헤더 */}
      <div className="bg-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase">스마트옥션</p>
                <span className="text-[10px] font-black tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase">딜러 전용</span>
              </div>
              <h1 className="text-3xl font-black text-white">진단 완료 차량 경매</h1>
              <p className="text-zinc-400 text-sm mt-1.5">카비어 진단이 완료된 차량을 경매로 직접 낙찰받으세요.</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300 text-sm font-semibold">{dealerName}</span>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: '경매 진행중', value: loading ? '…' : String(items.length) },
              { label: '내 입찰 건수', value: String(new Set(bids.map(b => b.itemId)).size) },
              { label: '낙찰 예정', value: '어드민 확인' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
        <p className="text-amber-700 text-xs font-semibold text-center max-w-7xl mx-auto">
          ⚡ 데모 버전 · 입찰 내역은 로컬에 저장됩니다. 실제 낙찰 처리는 카비어 어드민을 통해 확인해주세요.
        </p>
      </div>

      {/* 차량 목록 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🔨</p>
            <p className="font-semibold">진행 중인 경매가 없습니다.</p>
            <p className="text-sm mt-1">진단 완료 차량이 등록되면 자동으로 나타납니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => {
              const bidCount = getBidCount(item.id);
              const topBid   = getTopBid(item.id);
              const left     = timeLeft(item.completedAt ?? item.updatedAt);
              const closed   = left === '마감';
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border overflow-hidden ${closed ? 'opacity-60' : 'hover:border-gray-300 hover:shadow-lg'} transition-all`}
                >
                  {/* 이미지 영역 */}
                  <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative">
                    <svg viewBox="0 0 500 280" fill="none" className="w-4/5 opacity-10">
                      <rect x="40" y="140" width="420" height="100" rx="20" fill="#000"/>
                      <path d="M110 140 L155 75 H345 L390 140Z" fill="#000"/>
                      <circle cx="130" cy="220" r="40" fill="#333"/>
                      <circle cx="370" cy="220" r="40" fill="#333"/>
                    </svg>
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full">진단완료</span>
                      {closed
                        ? <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">마감</span>
                        : <span className="bg-green-500/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">진행중</span>
                      }
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      #{item.id}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{item.carModel ?? '차종 미상'}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {item.carNumber} · {item.address?.split(' ')[0]} · {item.assignedDriverName ?? '진단사'}
                    </p>

                    <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400">최고 입찰가</p>
                        <p className="text-lg font-black text-gray-900">
                          {topBid > 0 ? fmtKRW(topBid) : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">입찰 {bidCount}건</p>
                        <p className={`text-sm font-bold ${closed ? 'text-red-500' : 'text-green-600'}`}>{left}</p>
                      </div>
                    </div>

                    <button
                      disabled={closed}
                      onClick={() => setBidTarget(item)}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-colors bg-black hover:bg-gray-800 text-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {closed ? '경매 마감' : bidCount > 0 ? '입찰 수정' : '입찰하기'}
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
          bids={bids}
          onBid={handleBid}
          onClose={() => setBidTarget(null)}
        />
      )}
    </>
  );
}

function AuctionIntro() {
  return (
    <div className="bg-gradient-to-br from-zinc-900 via-purple-950 to-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <p className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-purple-300/60 border border-purple-400/20 px-3 py-1 rounded-full mb-5">
          카비어 스마트옥션
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.15] mb-4 max-w-2xl">
          진단 완료 차량을<br />가장 먼저, 가장 합리적으로.
        </h1>
        <p className="text-white/50 text-base mb-10 leading-relaxed max-w-xl">
          딜러 · 수출업자 · 폐차업자를 위한 공개 경쟁 입찰 플랫폼입니다.<br />
          카비어 평가사가 진단한 차량 정보를 실시간으로 확인하고 직접 입찰하세요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-3xl">
          {[
            { icon: '✦', title: '진단 데이터 공개', desc: '사고·침수 이력, 주행거리까지 투명하게' },
            { icon: '⚡', title: '수수료 없는 입찰', desc: '원하는 가격에 자유롭게 제안' },
            { icon: '🌏', title: '딜러 전용 네트워크', desc: '검증된 딜러 · 수출업자만 참여' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
              <p className="text-lg mb-2">{f.icon}</p>
              <p className="text-white font-black text-sm">{f.title}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="#login"
            className="bg-purple-600 hover:bg-purple-500 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors"
          >
            딜러 인증하고 입찰하기
          </a>
          <a
            href="mailto:partner@carvior.store"
            className="border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
          >
            딜러 · 파트너 신청 문의
          </a>
        </div>
      </div>
    </div>
  );
}

function AuctionGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (!isApprovedDealer(session)) {
    return (
      <div className="bg-black flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 mx-auto">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-purple-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold mb-1.5">딜러 승인 후 이용 가능합니다</h2>
            <p className="text-white/40 text-sm mb-6">
              {session
                ? '딜러 승인이 완료되지 않은 계정입니다. 승인 완료 후 다시 로그인해주세요.'
                : '실시간 매물과 입찰은 승인된 딜러 계정으로 로그인해야 볼 수 있어요.'}
            </p>
            <div className="flex flex-col gap-2.5">
              {session ? (
                <a href="mailto:partner@carvior.store"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                  딜러 승인 문의하기
                </a>
              ) : (
                <Link href="/login"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                  로그인
                </Link>
              )}
              <Link href="/register"
                className="w-full border border-white/10 text-white/70 hover:text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                딜러 회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuctionPage() {
  return (
    <div className="min-h-screen bg-white">
      <AuctionIntro />
      <div id="login">
        <AuctionGate>
          <AuctionContent />
        </AuctionGate>
      </div>
    </div>
  );
}
