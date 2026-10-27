'use client';

// 내 대화 목록 — 매물 문의로 생긴 방들을 최근 순으로 보여준다.
// 실시간 갱신은 방 안에서만 하고, 목록은 들어올 때 한 번 불러온다(매번 소켓을 붙일 필요가 없다).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useApiToken } from '@/lib/useApiToken';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';

interface Room {
  id: number;
  storeItemId: number;
  title: string;
  photo: string | null;
  askingPrice: number | null;
  partnerName: string;
  role: 'buyer' | 'seller';
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unread: number;
  status: string;
}

const timeAgo = (iso: string | null) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  return `${Math.floor(hour / 24)}일 전`;
};

export default function ChatListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const { token: apiToken, ready: tokenReady } = useApiToken();

  useEffect(() => {
    if (tokenReady && !apiToken && status === 'unauthenticated') router.replace('/login?callbackUrl=/chat');
  }, [tokenReady, apiToken, status, router]);

  useEffect(() => {
    if (!apiToken) { if (tokenReady) setLoading(false); return; }
    fetch(`${API}/chat/rooms`, { headers: { Authorization: `Bearer ${apiToken}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setRooms(Array.isArray(list) ? list : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [apiToken, tokenReady]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-black text-gray-900 mb-1">문의 대화</h1>
        <p className="text-sm text-gray-500 mb-7">매물에 대해 주고받은 대화입니다.</p>

        {loading ? (
          <p className="py-20 text-center text-sm text-gray-400">불러오는 중…</p>
        ) : rooms.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
            <p className="text-sm text-gray-500 mb-6">아직 주고받은 대화가 없습니다.</p>
            <Link
              href="/market"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
            >
              매물 둘러보기
            </Link>
          </div>
        ) : (
          <ul className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
            {rooms.map((room) => (
              <li key={room.id}>
                <Link href={`/chat/${room.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {room.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={room.photo} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900 truncate">{room.title}</span>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">
                        {room.role === 'buyer' ? '구매 문의' : '판매 문의'}
                      </span>
                      {room.status === 'closed' && (
                        <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded shrink-0">
                          거래완료
                        </span>
                      )}
                      {room.status === 'blocked' && (
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          차단
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {room.lastMessageText ?? '대화를 시작해보세요'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-gray-400">{timeAgo(room.lastMessageAt)}</p>
                    {room.unread > 0 && (
                      <span className="inline-block mt-1 bg-violet-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {room.unread}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
