'use client';

// 대화방 — 실시간으로 주고받는 화면.
//
// 처음 들어올 때 지난 대화를 REST로 한 번 불러오고, 그 뒤부터는 웹소켓으로만 받는다.
// 소켓이 끊기면(네트워크·서버 재시작) socket.io가 알아서 다시 붙고, 그때 놓친 메시지를
// 메우려고 다시 한 번 불러온다.
//
// 상태가 세 가지다. active(대화중) / blocked(차단) / closed(거래완료).
// 차단·거래완료는 REST로 처리하고, 서버가 소켓으로 'room'을 쏴주면 상대 화면도 같이 바뀐다.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { io, type Socket } from 'socket.io-client';
import { useApiToken } from '@/lib/useApiToken';
import ReportModal from '@/components/ReportModal';
import TradeReviewModal from '@/components/TradeReviewModal';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://carvior.store/api/v1';
const WS_BASE = API.replace(/\/api\/v1\/?$/, '');

interface Message {
  id: number;
  roomId: number;
  senderUserId: number;
  text: string;
  type: 'text' | 'system' | 'inspection';
  createdAt: string;
}

interface RoomInfo {
  id: number;
  storeItemId: number;
  myRole: 'buyer' | 'seller';
  status: 'active' | 'closed' | 'blocked';
  blockedByUserId: number | null;
  closedReason: 'completed' | 'sold_elsewhere' | null;
  item: { id: number; titleKo: string; askingPrice: number | null; photo: string | null } | null;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [myReview, setMyReview] = useState<{ rating: number } | null>(null);
  const [working, setWorking] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { token: apiToken, ready: tokenReady } = useApiToken();
  const myId = Number((session?.user as { id?: string } | undefined)?.id ?? 0);

  useEffect(() => {
    if (tokenReady && !apiToken && status === 'unauthenticated') router.replace(`/login?callbackUrl=/chat/${roomId}`);
  }, [tokenReady, apiToken, status, roomId, router]);

  // 지난 대화 + 방 정보 + 내가 쓴 후기
  const loadHistory = async (token: string) => {
    const headers = { Authorization: `Bearer ${token}` };
    const [r, m, rev] = await Promise.all([
      fetch(`${API}/chat/rooms/${roomId}`, { headers }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API}/chat/rooms/${roomId}/messages`, { headers }).then((res) => (res.ok ? res.json() : [])),
      fetch(`${API}/trade-reviews/rooms/${roomId}`, { headers }).then((res) => (res.ok ? res.json() : null)),
    ]);
    setRoom(r);
    setMessages(Array.isArray(m) ? m : []);
    setMyReview(rev?.mine ?? null);
  };

  useEffect(() => {
    if (!apiToken || !roomId) return;
    loadHistory(apiToken);

    const socket = io(`${WS_BASE}/chat`, {
      auth: { token: apiToken },
      transports: ['websocket', 'polling'], // 웹소켓이 막히면 폴링으로 내려간다
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', { roomId: Number(roomId) });
      // 끊겼다 붙은 경우 놓친 메시지를 메운다
      loadHistory(apiToken);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('message', (msg: Message) => {
      setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, msg]));
    });
    // 상대가 차단하거나 판매자가 거래완료를 누른 경우 — 방 정보를 다시 읽는다
    socket.on('room', () => loadHistory(apiToken));

    return () => {
      socket.emit('leave', { roomId: Number(roomId) });
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiToken, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = () => {
    const body = text.trim();
    if (!body || !socketRef.current) return;
    socketRef.current.emit('send', { roomId: Number(roomId), text: body });
    setText('');
  };

  // 차단·차단해제·거래완료 — 결과는 소켓 'room'으로도 오지만, 누른 사람 화면은 바로 바꿔준다
  const act = async (path: 'block' | 'unblock' | 'complete', confirmText?: string) => {
    if (!apiToken || working) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setWorking(true);
    try {
      const res = await fetch(`${API}/chat/rooms/${roomId}/${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.message ?? '처리하지 못했습니다.');
        return;
      }
      await loadHistory(apiToken);
      setMenuOpen(false);
    } finally {
      setWorking(false);
    }
  };

  const blocked = room?.status === 'blocked';
  const closed = room?.status === 'closed';
  const blockedByMe = blocked && room?.blockedByUserId === myId;
  const canWrite = !!room && room.status === 'active' && connected;
  // 후기는 이 사람과 실제로 거래가 끝난 방에서만(판매자가 다른 사람과 거래해 닫힌 방은 제외)
  const canReview = closed && room?.closedReason === 'completed' && !myReview;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* 매물 정보 — 무슨 차 얘기 중인지 항상 위에 보이게 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/chat" className="text-gray-400 hover:text-gray-700 text-lg shrink-0">←</Link>
          {room?.item && (
            <Link href={`/market/${room.item.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80">
              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {room.item.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={room.item.photo} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{room.item.titleKo}</p>
                <p className="text-xs text-violet-600 font-bold">
                  {room.item.askingPrice ? `${Math.round(room.item.askingPrice / 10000).toLocaleString()}만원` : '가격 문의'}
                </p>
              </div>
            </Link>
          )}

          <span className={`text-[10px] font-bold shrink-0 ${connected ? 'text-green-500' : 'text-gray-300'}`}>
            {connected ? '● 연결됨' : '○ 연결 중'}
          </span>

          {/* 판매자만 보이는 거래완료 — 누르면 매물이 판매완료로 내려간다 */}
          {room?.myRole === 'seller' && room.status === 'active' && (
            <button
              onClick={() =>
                act(
                  'complete',
                  '이 분과 거래를 완료 처리할까요?\n매물이 판매완료로 바뀌고, 같은 매물의 다른 대화도 닫힙니다.',
                )
              }
              disabled={working}
              className="shrink-0 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white text-[11px] font-black px-3 py-1.5 rounded-full transition-colors"
            >
              거래완료
            </button>
          )}

          {/* 신고·차단 */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 text-lg leading-none"
              aria-label="더보기"
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-[200]" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-[205] w-44 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                  <button
                    onClick={() => { setMenuOpen(false); setReporting(true); }}
                    className="w-full text-left text-xs font-bold text-slate-700 px-4 py-3 hover:bg-slate-50"
                  >
                    신고하기
                  </button>
                  {blocked ? (
                    blockedByMe ? (
                      <button
                        onClick={() => act('unblock')}
                        disabled={working}
                        className="w-full text-left text-xs font-bold text-slate-700 px-4 py-3 hover:bg-slate-50 border-t border-slate-100"
                      >
                        차단 해제
                      </button>
                    ) : (
                      <p className="text-[11px] text-slate-400 px-4 py-3 border-t border-slate-100">
                        상대방이 차단한 대화입니다
                      </p>
                    )
                  ) : (
                    !closed && (
                      <button
                        onClick={() => act('block', '이 상대를 차단할까요?\n양쪽 모두 더 이상 메시지를 보낼 수 없습니다.')}
                        disabled={working}
                        className="w-full text-left text-xs font-bold text-red-500 px-4 py-3 hover:bg-red-50 border-t border-slate-100"
                      >
                        차단하기
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 대화 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-3">
          {messages.map((m) => {
            if (m.type === 'system') {
              return (
                <p key={m.id} className="text-center text-[11px] text-gray-400 bg-gray-100 rounded-full px-4 py-2 mx-auto w-fit max-w-md">
                  {m.text}
                </p>
              );
            }
            const mine = m.senderUserId === myId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      mine ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{fmtTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 아래쪽 — 상태에 따라 입력창 / 차단 안내 / 거래완료 안내로 바뀐다 */}
      <div className="bg-white border-t border-gray-200">
        {closed ? (
          <div className="max-w-3xl mx-auto px-5 py-5 text-center">
            <p className="text-sm font-black text-slate-800 mb-1">
              {room?.closedReason === 'completed' ? '거래가 완료되었습니다' : '판매완료된 매물입니다'}
            </p>
            <p className="text-xs text-slate-400 mb-4">
              {room?.closedReason === 'completed'
                ? '후기를 남기면 상대방의 다음 거래에 도움이 됩니다.'
                : '판매자가 다른 분과 거래를 완료했습니다.'}
            </p>
            {canReview && (
              <button
                onClick={() => setReviewing(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
              >
                거래 후기 남기기
              </button>
            )}
            {myReview && (
              <p className="text-xs font-bold text-amber-500">
                {'★'.repeat(myReview.rating)}
                <span className="text-slate-300">{'★'.repeat(5 - myReview.rating)}</span>
                <span className="text-slate-400 font-normal ml-2">후기를 남기셨습니다</span>
              </p>
            )}
          </div>
        ) : blocked ? (
          <div className="max-w-3xl mx-auto px-5 py-6 text-center">
            <p className="text-sm font-black text-slate-800 mb-1">차단된 대화입니다</p>
            <p className="text-xs text-slate-400 mb-4">
              {blockedByMe ? '차단을 해제하면 다시 대화할 수 있습니다.' : '상대방이 이 대화를 차단했습니다.'}
            </p>
            {blockedByMe && (
              <button
                onClick={() => act('unblock')}
                disabled={working}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
              >
                차단 해제
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 검차 권유 — 네고 중에 자연스럽게 꺼낼 수 있게 입력창 위에 둔다 */}
            <div className="max-w-3xl mx-auto px-5 pt-3">
              <Link
                href="/call-evaluator"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors"
              >
                🔍 차량 상태가 궁금하면 평가사 부르기
              </Link>
            </div>
            <div className="max-w-3xl mx-auto px-5 py-3 flex items-end gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="메시지를 입력하세요 (Enter 전송, Shift+Enter 줄바꿈)"
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 max-h-32"
              />
              <button
                onClick={send}
                disabled={!text.trim() || !canWrite}
                className="shrink-0 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black px-5 py-3 rounded-xl text-sm transition-colors"
              >
                전송
              </button>
            </div>
            <p className="max-w-3xl mx-auto px-5 pb-3 text-[10px] text-gray-400">
              카비어는 거래 당사자가 아닙니다. 계좌이체·선입금 요구는 사기일 수 있으니 주의하세요.
            </p>
          </>
        )}
      </div>

      {reporting && (
        <ReportModal targetType="chat" targetId={Number(roomId)} token={apiToken} onClose={() => setReporting(false)} />
      )}
      {reviewing && (
        <TradeReviewModal
          roomId={Number(roomId)}
          token={apiToken}
          onClose={() => setReviewing(false)}
          onDone={() => {
            setReviewing(false);
            if (apiToken) loadHistory(apiToken);
          }}
        />
      )}
    </main>
  );
}
