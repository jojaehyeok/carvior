'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type Role = 'user' | 'dealer';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole]         = useState<Role>('user');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [pw2, setPw2]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== pw2) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '회원가입 실패'); return; }

      // 가입 즉시 로그인
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.ok) router.push('/');
      else router.push('/login');
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: 'kakao' | 'naver') => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <span className="text-2xl font-black text-gray-900">회원가입</span>
          <p className="text-sm text-gray-400 mt-1">카비어에 오신 것을 환영합니다</p>
        </div>

        {/* 유형 선택 */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          {(['user', 'dealer'] as Role[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {r === 'user' ? '일반 회원' : '딜러'}
            </button>
          ))}
        </div>

        {/* 소셜 */}
        <div className="space-y-2 mb-5">
          <button onClick={() => handleSocial('kakao')}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 2C5.582 2 2 4.837 2 8.333c0 2.27 1.427 4.261 3.574 5.395L4.74 17.01a.25.25 0 0 0 .366.271L9.1 14.63c.296.03.597.037.9.037 4.418 0 8-2.836 8-6.334C18 4.837 14.418 2 10 2z" fill="#191919"/>
            </svg>
            카카오로 시작하기
          </button>
          <button onClick={() => handleSocial('naver')}
            className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
            <span className="font-black text-base leading-none">N</span>
            네이버로 시작하기
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center"><span className="bg-gray-50 px-3 text-xs text-gray-400">이메일로 가입</span></div>
        </div>

        {/* 이메일 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text" required placeholder="이름"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white"
          />
          <input
            type="email" required placeholder="이메일"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white"
          />
          <input
            type="tel" placeholder="전화번호 (선택)"
            value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white"
          />
          <input
            type="password" required placeholder="비밀번호 (8자 이상)"
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white"
          />
          <input
            type="password" required placeholder="비밀번호 확인"
            value={pw2} onChange={e => setPw2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white"
          />

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? '가입 중…' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <button onClick={() => router.push('/login')} className="text-violet-600 font-bold">로그인</button>
        </p>
      </div>
    </div>
  );
}
