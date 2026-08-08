'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT;

export default function MypageSettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setImage(user.image ?? '');
  }, [user]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/mypage/marketing-consent')
      .then(r => r.json())
      .then(data => setMarketingConsent(!!data.marketingConsent))
      .catch(() => {});
  }, [status]);

  // 세션엔 phone이 안 들어있어서(next-auth 콜백에 phone 미포함) 백엔드에서 직접 조회
  useEffect(() => {
    if (status !== 'authenticated' || !user?.email) return;
    fetch(`${API}/users/by-email?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => setPhone(data?.phone ?? ''))
      .catch(() => {});
  }, [status, user?.email]);

  const toggleMarketingConsent = async () => {
    const next = !marketingConsent;
    setMarketingConsent(next);
    setConsentSaving(true);
    try {
      await fetch('/api/mypage/marketing-consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketingConsent: next }),
      });
    } catch {
      setMarketingConsent(!next);
    } finally {
      setConsentSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/users/upload-doc`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setImage(data.url);
      else alert('이미지 업로드에 실패했습니다.');
    } catch {
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${API}/users/${user.id}/admin-info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, profileImage: image }),
      });
      if (!res.ok) throw new Error();
      await update({ name, image });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPassword = async () => {
    if (!user?.id) return;
    if (newPassword.length < 8) { alert('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (newPassword !== newPassword2) { alert('비밀번호가 일치하지 않습니다.'); return; }
    setPwSaving(true);
    setPwSaved(false);
    try {
      const res = await fetch(`${API}/users/${user.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error();
      setNewPassword('');
      setNewPassword2('');
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2000);
    } catch {
      alert('비밀번호 설정에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPwSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-zinc-800 text-white px-6 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/mypage" className="text-white/50 hover:text-white transition-colors">←</Link>
          <p className="font-bold text-lg">계정 설정</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* 프로필 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-6">
          <p className="text-xs font-black text-gray-700 mb-4">프로필</p>

          <div className="flex flex-col items-center mb-5">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-100 group"
            >
              {image ? (
                <img src={image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-violet-500 flex items-center justify-center text-2xl font-black text-white">
                  {name?.[0] ?? '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                {uploading ? '업로드 중…' : '사진 변경'}
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <label className="block">
            <span className="text-xs font-bold text-gray-500 mb-1.5 block">닉네임</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
            />
          </label>

          <label className="block mt-4">
            <span className="text-xs font-bold text-gray-500 mb-1.5 block">휴대폰번호</span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">검차 신청 내역 확인 등에 사용돼요.</span>
          </label>

          <button
            onClick={handleSave}
            disabled={saving || uploading || !name.trim()}
            className="w-full mt-4 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-violet-500 transition-colors"
          >
            {saving ? '저장 중…' : saved ? '저장됨 ✓' : '저장하기'}
          </button>
        </div>

        {/* 비밀번호 설정 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-6">
          <p className="text-xs font-black text-gray-700 mb-1">이메일 로그인 비밀번호</p>
          <p className="text-[11px] text-gray-400 mb-4">
            카카오·네이버로 가입하셨어도 여기서 비밀번호를 설정하면 이메일+비밀번호로도 로그인하실 수 있어요.
          </p>
          <div className="space-y-2.5">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
            />
            <input
              type="password"
              value={newPassword2}
              onChange={e => setNewPassword2(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <button
            onClick={handleSetPassword}
            disabled={pwSaving || !newPassword || !newPassword2}
            className="w-full mt-3 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-violet-500 transition-colors"
          >
            {pwSaving ? '설정 중…' : pwSaved ? '설정됨 ✓' : '비밀번호 설정하기'}
          </button>
        </div>

        {/* 계정 설정 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-6">
          <p className="text-xs font-black text-gray-700 mb-3">알림 설정</p>

          <label className="flex items-center justify-between gap-2.5 cursor-pointer select-none">
            <span className="text-sm text-gray-700">광고성 정보 수신 동의</span>
            <div
              onClick={toggleMarketingConsent}
              className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${consentSaving ? 'opacity-50' : ''} ${marketingConsent ? 'bg-violet-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${marketingConsent ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </label>

          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
            <a href="/policy/privacy" target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-400 underline">개인정보처리방침</a>
            <a href="/policy/terms" target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-400 underline">이용약관</a>
          </div>
        </div>
      </div>
    </div>
  );
}
