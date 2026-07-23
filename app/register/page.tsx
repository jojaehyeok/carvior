'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type Role = 'user' | 'dealer';

interface DocFile {
  file: File | null;
  url: string;
  uploading: boolean;
  uploaded: boolean;
}

function emptyDoc(): DocFile {
  return { file: null, url: '', uploading: false, uploaded: false };
}

function FileUploadField({
  label,
  required,
  hint,
  doc,
  onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  doc: DocFile;
  onChange: (d: DocFile) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ file, url: '', uploading: true, uploaded: false });

    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload/dealer-doc', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        onChange({ file, url: data.url, uploading: false, uploaded: true });
      } else {
        onChange({ file, url: '', uploading: false, uploaded: false });
        alert('업로드 실패. 다시 시도해주세요.');
      }
    } catch {
      onChange({ file, url: '', uploading: false, uploaded: false });
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl px-4 py-4 text-center transition-colors
          ${doc.uploaded ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-violet-400 hover:bg-violet-50'}`}
      >
        <input
          ref={ref}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFile}
        />
        {doc.uploading ? (
          <p className="text-sm text-violet-500 font-bold animate-pulse">업로드 중…</p>
        ) : doc.uploaded ? (
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5}>
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            <p className="text-sm text-green-600 font-bold truncate max-w-[180px]">{doc.file?.name}</p>
          </div>
        ) : (
          <div>
            <svg className="mx-auto mb-1.5 text-gray-300" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <p className="text-xs text-gray-400">클릭하여 파일 선택</p>
            <p className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, PDF 가능</p>
          </div>
        )}
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

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
  const [marketingConsent, setMarketingConsent] = useState(false);

  // 딜러 전용
  const [licenseDoc,    setLicenseDoc]    = useState<DocFile>(emptyDoc());
  const [businessDoc,   setBusinessDoc]   = useState<DocFile>(emptyDoc());
  const [hasBusiness,   setHasBusiness]   = useState(false);
  const [businessNum,   setBusinessNum]   = useState('');
  const [companyName,   setCompanyName]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== pw2)        { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 8)     { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (role === 'dealer' && !licenseDoc.uploaded) {
      setError('자동차 매매종사원증을 업로드해주세요.'); return;
    }
    if (hasBusiness && !businessDoc.uploaded) {
      setError('사업자등록증을 업로드해주세요.'); return;
    }

    setLoading(true);
    try {
      const body: Record<string, string | boolean> = { email, password, name, phone, role, marketingConsent };
      if (role === 'dealer') {
        body.dealerLicenseUrl = licenseDoc.url;
        if (hasBusiness) {
          body.businessRegUrl = businessDoc.url;
          body.businessNumber = businessNum;
          body.companyName    = companyName;
        }
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '회원가입 실패'); return; }

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

        {/* 일반 회원: 소셜 로그인 */}
        {role === 'user' && (
          <>
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
          </>
        )}

        {/* 딜러: 안내 */}
        {role === 'dealer' && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-black text-violet-700 mb-1">딜러 회원 안내</p>
            <p className="text-xs text-violet-500 leading-relaxed">
              자동차 매매종사원증 필수 · 가입 후 서류 검토 후 승인됩니다.<br />
              사업자가 있으면 세금계산서 발행이 가능합니다.<br />
              가입 시 <a href="/policy/terms" target="_blank" rel="noopener noreferrer" className="underline font-bold">온라인 자동차 매매정보제공 이용약관</a>에 동의하게 됩니다.
            </p>
          </div>
        )}

        {/* 이메일 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" required placeholder="이름"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white" />
          <input type="email" required placeholder="이메일"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white" />
          <input type="tel" placeholder="전화번호 (선택)"
            value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white" />
          <input type="password" required placeholder="비밀번호 (8자 이상)"
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white" />
          <input type="password" required placeholder="비밀번호 확인"
            value={pw2} onChange={e => setPw2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white" />

          {/* 딜러 서류 업로드 */}
          {role === 'dealer' && (
            <div className="space-y-4 pt-2">
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-black text-gray-700 mb-3">서류 업로드</p>

                <div className="space-y-3">
                  <FileUploadField
                    label="자동차 매매종사원증"
                    required
                    hint="사진 또는 스캔본 (JPG, PNG, PDF)"
                    doc={licenseDoc}
                    onChange={setLicenseDoc}
                  />

                  {/* 사업자 여부 토글 */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div
                      onClick={() => setHasBusiness(v => !v)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${hasBusiness ? 'bg-violet-600' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasBusiness ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">사업자 있어요 (세금계산서 발행)</span>
                  </label>

                  {hasBusiness && (
                    <div className="space-y-3 pl-1">
                      <FileUploadField
                        label="사업자등록증"
                        required
                        hint="사진 또는 스캔본 (JPG, PNG, PDF)"
                        doc={businessDoc}
                        onChange={setBusinessDoc}
                      />
                      <input type="text" placeholder="사업자등록번호 (000-00-00000)"
                        value={businessNum} onChange={e => setBusinessNum(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white" />
                      <input type="text" placeholder="상호명"
                        value={companyName} onChange={e => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 bg-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <div className="pt-1 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setMarketingConsent(v => !v)}
                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${marketingConsent ? 'bg-violet-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${marketingConsent ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-xs text-gray-500">(선택) 이벤트·혜택 등 광고성 정보 수신에 동의합니다</span>
            </label>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              가입 시 <a href="/policy/terms" target="_blank" rel="noopener noreferrer" className="underline">이용약관</a> 및{' '}
              <a href="/policy/privacy" target="_blank" rel="noopener noreferrer" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
            </p>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? '가입 중…' : role === 'dealer' ? '딜러 가입 신청' : '회원가입'}
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
