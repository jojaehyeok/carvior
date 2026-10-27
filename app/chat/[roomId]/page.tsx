'use client';

// 대화방 — 실시간으로 주고받는 화면.
//
// 처음 들어올 때 지난 대화를 REST로 한 번 불러오고, 그 뒤부터는 웹소켓으로만 받는다.
// 소켓이 끊기면(네트워크·서버 재시작) socket.io가 알아서 다시 붙고, 그때 놓친 메시지를
// 메우려고 다시 한 번 불러온다.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { io, type Socket } from 'socket.io-client';

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
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const apiToken = (session?.user as { apiToken?: string } | undefined)?.apiToken;
  const myId = Number((session?.user as { id?: string } | undefined)?.id ?? 0);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/login?callbackUrl=/chat/${roomId}`);
  }, [status, roomId, router]);

  // 지난 대화 + 방 정보
  const loadHistory = async (token: string) => {
    const headers = { Authorization: `Bearer ${token}` };
    const [r, m] = await Promise.all([
      fetch(`${API}/chat/rooms/${roomId}`, { headers }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API}/chat/rooms/${roomId}/messages`, { headers }).then((res) => (res.ok ? res.json() : [])),
    ]);
    setRoom(r);
    setMessages(Array.isArray(m) ? m : []);
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

      {/* 검차 권유 — 네고 중에 자연스럽게 꺼낼 수 있게 입력창 위에 둔다 */}
      <div className="bg-white border-t border-gray-200">
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
            disabled={!text.trim() || !connected}
            className="shrink-0 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black px-5 py-3 rounded-xl text-sm transition-colors"
          >
            전송
          </button>
        </div>
        <p className="max-w-3xl mx-auto px-5 pb-3 text-[10px] text-gray-400">
          카비어는 거래 당사자가 아닙니다. 계좌이체·선입금 요구는 사기일 수 있으니 주의하세요.
        </p>
      </div>
    </main>
  );
}
