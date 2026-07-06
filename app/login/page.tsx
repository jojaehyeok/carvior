'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Tab = 'user' | 'dealer';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('user');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocial = async (provider: 'kakao' | 'naver') => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <span className="text-2xl font-black text-gray-900 tracking-tight">CARVIOR</span>
          <p className="text-sm text-gray-400 mt-1">로그인 후 더 많은 서비스를 이용하세요</p>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 mb-8">
          {([['user', '일반 회원'], ['dealer', '딜러']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tab === t
                  ? 'text-violet-600 border-b-2 border-violet-600 -mb-px'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'dealer' && (
          <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
            <p className="text-xs text-violet-700 font-semibold">딜러 회원 안내</p>
            <p className="text-xs text-violet-500 mt-1">딜러로 가입하면 스마트옥션 및 매매 관리 기능을 이용할 수 있습니다.</p>
          </div>
        )}

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocial('kakao')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading === 'kakao' ? (
              <span className="w-5 h-5 border-2 border-[#191919]/30 border-t-[#191919] rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 2C5.582 2 2 4.837 2 8.333c0 2.27 1.427 4.261 3.574 5.395L4.74 17.01a.25.25 0 0 0 .366.271L9.1 14.63c.296.03.597.037.9.037 4.418 0 8-2.836 8-6.334C18 4.837 14.418 2 10 2z" fill="#191919"/>
              </svg>
            )}
            카카오로 로그인
          </button>

          <button
            onClick={() => handleSocial('naver')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading === 'naver' ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-white font-black text-lg leading-none">N</span>
            )}
            네이버로 로그인
          </button>

          <button
            onClick={() => router.push('/login/email')}
            className="w-full py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            이메일로 로그인
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          계정이 없으신가요?{' '}
          <button
            onClick={() => router.push(tab === 'dealer' ? '/register?role=dealer' : '/register')}
            className="text-violet-600 font-bold"
          >
            {tab === 'dealer' ? '딜러로 가입' : '회원가입'}
          </button>
        </p>
      </div>
    </div>
  );
}
