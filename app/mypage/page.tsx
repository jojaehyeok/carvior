'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Status = 'pending' | 'active' | 'sold' | 'hidden';

interface StoreItem {
  id: number;
  titleKo: string;
  carNumber: string;
  year: number;
  mileage: number;
  priceKRW: number;
  status: Status;
  photos: Record<string, string[]>;
  registeredAt: string;
}

const STATUS_MAP: Record<Status, { label: string; color: string }> = {
  pending: { label: '검토중',   color: 'bg-yellow-100 text-yellow-700' },
  active:  { label: '판매중',   color: 'bg-green-100 text-green-700'  },
  sold:    { label: '판매완료', color: 'bg-gray-100 text-gray-500'    },
  hidden:  { label: '숨김',     color: 'bg-red-100 text-red-500'      },
};

interface BookingForm {
  address: string;
  detailAddress: string;
  contact: string;
  preferredDateTime: string;
}

export default function MypagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ item: StoreItem; type: 'transport' | 'inspection' } | null>(null);
  const [form, setForm] = useState<BookingForm>({ address: '', detailAddress: '', contact: '', preferredDateTime: '' });
  const [submitting, setSubmitting] = useState(false);

  const user = session?.user as any;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/mypage/store-items')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  const markSold = async (item: StoreItem) => {
    const res = await fetch(`/api/mypage/store-items?id=${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sold' }),
    });
    if (res.ok) setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'sold' } : i));
  };

  const submitBooking = async () => {
    if (!modal) return;
    setSubmitting(true);
    try {
      await fetch('/api/v1/external/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carNumber: modal.item.carNumber,
          carOwner: user?.name,
          contact: form.contact,
          address: form.address,
          detailAddress: form.detailAddress,
          preferredDateTime: form.preferredDateTime,
          source: modal.type === 'transport' ? 'TRANSPORT' : 'INSPECTION',
        }),
      });
      setModal(null);
      alert('신청이 완료되었습니다. 담당자가 연락드릴 예정입니다.');
    } catch {
      alert('신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const thumb = (item: StoreItem) => {
    return (item.photos as any)?.exterior?.[0]
      ?? Object.values(item.photos ?? {}).flat()[0]
      ?? null;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-zinc-800 text-white px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.image ? (
                <img src={user.image} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center text-xl font-black">
                  {user?.name?.[0] ?? '?'}
                </div>
              )}
              <div>
                <p className="font-bold text-lg">{user?.name}</p>
                <p className="text-sm text-white/50">{user?.email}</p>
                {user?.role === 'dealer' && (
                  <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full mt-1 inline-block">딜러</span>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 내 매물 */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gray-900">내 매물</h2>
          <button
            onClick={() => router.push('/sell/register')}
            className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
          >
            + 차량 등록
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-4xl mb-3">🚗</div>
            <p className="text-gray-400 text-sm font-semibold">등록된 매물이 없습니다</p>
            <button
              onClick={() => router.push('/sell/register')}
              className="mt-4 text-xs font-bold text-violet-600 underline"
            >
              지금 등록하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => {
              const s = STATUS_MAP[item.status] ?? STATUS_MAP.hidden;
              const img = thumb(item);
              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="flex">
                    {/* 썸네일 */}
                    <div className="w-28 h-28 shrink-0 bg-gray-100">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🚗</div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{item.titleKo}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.carNumber} · {item.year}년 · {item.mileage?.toLocaleString()}km</p>
                          <p className="text-sm font-black text-violet-600 mt-1">
                            {item.priceKRW ? `${Math.round(Number(item.priceKRW) / 10000).toLocaleString()}만원` : '가격 미정'}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${s.color}`}>{s.label}</span>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {/* 검차 신청: 검토중·판매중 모두 가능 */}
                        {(item.status === 'pending' || item.status === 'active') && (
                          <a
                            href="/inspection"
                            className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-amber-400 text-amber-900 hover:bg-amber-300 transition-colors"
                          >
                            ✦ 검차 신청
                          </a>
                        )}
                        {item.status === 'active' && (
                          <button
                            onClick={() => markSold(item)}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            판매완료
                          </button>
                        )}
                        {item.status === 'sold' && (
                          <button
                            onClick={() => { setModal({ item, type: 'transport' }); setForm({ address: '', detailAddress: '', contact: '', preferredDateTime: '' }); }}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-zinc-700 text-white hover:bg-zinc-800 transition-colors"
                          >
                            탁송 신청
                          </button>
                        )}
                        {item.status === 'pending' && (
                          <p className="text-[11px] text-yellow-600 font-semibold">관리자 검토 후 활성화됩니다</p>
                        )}
                      </div>

                      {/* 검차 유도 메시지 */}
                      {(item.status === 'active' || item.status === 'pending') && (
                        <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                          <span className="text-amber-500 text-xs">💡</span>
                          <p className="text-[10px] text-amber-700 font-semibold leading-snug">
                            검차받은 매물은 평균 <strong>3배 빠르게</strong> 판매됩니다
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 탁송/검차 신청 모달 */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="font-black text-gray-900 text-lg">
                {modal.type === 'inspection' ? '검차 신청' : '탁송 신청'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{modal.item.titleKo} ({modal.item.carNumber})</p>
            </div>

            <div className="space-y-3">
              <input
                type="text" placeholder="주소"
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="text" placeholder="상세주소"
                value={form.detailAddress} onChange={e => setForm(f => ({ ...f, detailAddress: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="tel" placeholder="연락처"
                value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="datetime-local"
                value={form.preferredDateTime} onChange={e => setForm(f => ({ ...f, preferredDateTime: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
              >
                취소
              </button>
              <button
                onClick={submitBooking}
                disabled={submitting || !form.address || !form.contact || !form.preferredDateTime}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-violet-700 transition-colors"
              >
                {submitting ? '신청 중…' : '신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
