'use client';

import { useEffect, useState, useCallback } from 'react';

interface DealerSession {
  code: string;
  name: string;
  company: string;
}

interface Props {
  children: React.ReactNode;
}

export default function DealerGate({ children }: Props) {
  const [dealer, setDealer] = useState<DealerSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('carvior_dealer');
      if (raw) setDealer(JSON.parse(raw));
    } catch {}
    setChecked(true);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dealer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '로그인 실패'); return; }
      localStorage.setItem('carvior_dealer', JSON.stringify(data.dealer));
      setDealer(data.dealer);
    } catch {
      setError('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [code]);

  if (!checked) return null;

  if (!dealer) {
    return (
      <div className="bg-black flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* 카드 */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-purple-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h1 className="text-white text-xl font-bold">딜러 전용 서비스</h1>
              <p className="text-white/40 text-sm mt-1.5 text-center">
                이 서비스는 카비어 파트너 딜러만 이용할 수 있습니다.<br />
                딜러 코드를 입력해주세요.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="딜러 코드 입력 (예: DEALER2025)"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm font-mono tracking-wider focus:outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-xs flex items-center gap-1.5">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2"/><circle cx="12" cy="16" r="1" fill="white"/></svg>
                  {error}
                </p>
              )}
              <button
                onClick={handleLogin}
                disabled={loading || !code.trim()}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                {loading ? '확인 중…' : '딜러 인증'}
              </button>
            </div>

            <p className="text-center text-white/20 text-xs mt-6">
              딜러 코드가 없으신가요?{' '}
              <a href="mailto:partner@carvior.store" className="text-purple-400 hover:underline">
                파트너 신청
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
