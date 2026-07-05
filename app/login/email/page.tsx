'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function EmailLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.ok) router.push('/');
    else setError('이메일 또는 비밀번호가 올바르지 않습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          뒤로
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">이메일 로그인</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email" required placeholder="이메일"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white"
          />
          <input
            type="password" required placeholder="비밀번호"
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white"
          />

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중…' : '로그인'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          계정이 없으신가요?{' '}
          <button onClick={() => router.push('/register')} className="text-violet-600 font-bold">회원가입</button>
        </p>
      </div>
    </div>
  );
}
