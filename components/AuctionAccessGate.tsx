'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { isApprovedDealer } from '@/lib/dealerAccess';

function openChannelTalk() {
  (window as any).ChannelIO?.('show');
}

interface DocFile {
  file: File | null;
  url: string;
  uploading: boolean;
  uploaded: boolean;
}

function emptyDoc(): DocFile {
  return { file: null, url: '', uploading: false, uploaded: false };
}

function DocUploadField({
  label, required, doc, onChange,
}: {
  label: string; required?: boolean; doc: DocFile; onChange: (d: DocFile) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ file, url: '', uploading: true, uploaded: false });

    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/upload-doc`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) onChange({ file, url: data.url, uploading: false, uploaded: true });
      else { onChange({ file, url: '', uploading: false, uploaded: false }); alert('업로드 실패. 다시 시도해주세요.'); }
    } catch {
      onChange({ file, url: '', uploading: false, uploaded: false });
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-white/60 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl px-4 py-3.5 text-center transition-colors
          ${doc.uploaded ? 'border-green-500/50 bg-green-500/10' : 'border-white/15 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/5'}`}
      >
        <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
        {doc.uploading ? (
          <p className="text-xs text-purple-300 font-bold animate-pulse">업로드 중…</p>
        ) : doc.uploaded ? (
          <div className="flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5}><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-xs text-green-400 font-bold truncate max-w-[160px]">{doc.file?.name}</p>
          </div>
        ) : (
          <p className="text-xs text-white/30">클릭하여 파일 선택 (JPG, PNG, PDF)</p>
        )}
      </div>
    </div>
  );
}

function DealerApplyForm({ userId, onDone }: { userId?: string; onDone: () => void }) {
  const [licenseDoc, setLicenseDoc] = useState<DocFile>(emptyDoc());
  const [businessDoc, setBusinessDoc] = useState<DocFile>(emptyDoc());
  const [hasBusiness, setHasBusiness] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!licenseDoc.uploaded) { setError('자동차 매매종사원증을 업로드해주세요.'); return; }
    if (hasBusiness && !businessDoc.uploaded) { setError('사업자등록증을 업로드해주세요.'); return; }
    if (!userId) { setError('로그인이 필요합니다.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/${userId}/apply-dealer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.NEXT_PUBLIC_STORE_ITEMS_INTERNAL_KEY ?? '' },
        body: JSON.stringify({
          dealerLicenseUrl: licenseDoc.url,
          businessRegUrl: hasBusiness ? businessDoc.url : undefined,
          businessNumber: hasBusiness ? businessNumber : undefined,
          companyName: hasBusiness ? companyName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? '신청 실패'); return; }
      onDone();
    } catch {
      setError('서버와 통신할 수 없습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <DocUploadField label="자동차 매매종사원증" required doc={licenseDoc} onChange={setLicenseDoc} />

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <div
          onClick={() => setHasBusiness(v => !v)}
          className={`w-9 h-5 rounded-full transition-colors relative ${hasBusiness ? 'bg-purple-600' : 'bg-white/15'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasBusiness ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-xs font-bold text-white/60">사업자등록증도 등록할게요</span>
      </label>

      {hasBusiness && (
        <div className="space-y-3 pl-1">
          <DocUploadField label="사업자등록증" required doc={businessDoc} onChange={setBusinessDoc} />
          <input
            type="text" placeholder="상호명" value={companyName} onChange={e => setCompanyName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
          />
          <input
            type="text" placeholder="사업자등록번호 (000-00-00000)" value={businessNumber} onChange={e => setBusinessNumber(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
      >
        {submitting ? '제출 중…' : '딜러 승인 신청하기'}
      </button>
    </div>
  );
}

function GateCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 mx-auto">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-purple-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AuctionAccessGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [applied, setApplied] = useState(false);

  if (status === 'loading') return null;

  if (isApprovedDealer(session)) return <>{children}</>;

  // 비로그인
  if (!session) {
    return (
      <GateCard>
        <h2 className="text-white text-xl font-bold mb-1.5">딜러 전용 서비스입니다</h2>
        <p className="text-white/40 text-sm mb-6">
          실시간 매물과 입찰은 승인된 딜러 계정으로 로그인해야 볼 수 있어요.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link href="/login" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
            로그인
          </Link>
          <Link href="/register" className="w-full border border-white/10 text-white/70 hover:text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
            딜러 회원가입
          </Link>
        </div>
      </GateCard>
    );
  }

  const user = session.user as any;

  // 신청 완료 직후
  if (applied) {
    return (
      <GateCard>
        <h2 className="text-white text-xl font-bold mb-1.5">신청 완료</h2>
        <p className="text-white/40 text-sm">
          서류 검토 후 승인되면 이용하실 수 있어요.<br />
          승인 완료 후에는 재로그인하면 반영됩니다.
        </p>
      </GateCard>
    );
  }

  // 승인 대기 / 거절
  if (user.role === 'dealer' && (user.dealerStatus === 'pending' || user.dealerStatus === 'rejected')) {
    return (
      <GateCard>
        <h2 className="text-white text-xl font-bold mb-1.5">
          {user.dealerStatus === 'pending' ? '승인 대기 중입니다' : '승인이 보류되었습니다'}
        </h2>
        <p className="text-white/40 text-sm mb-6">
          {user.dealerStatus === 'pending'
            ? '제출하신 서류를 검토 중이에요. 영업일 기준 1~2일 내 완료됩니다.'
            : '서류 확인이 필요해요. 채팅으로 문의해주시면 빠르게 도와드릴게요.'}
        </p>
        <button
          onClick={openChannelTalk}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
        >
          채팅으로 문의하기
        </button>
      </GateCard>
    );
  }

  // 일반 회원: 딜러 서류 등록 유도
  return (
    <GateCard>
      <h2 className="text-white text-xl font-bold mb-1.5">딜러 인증이 필요합니다</h2>
      <p className="text-white/40 text-sm mb-6">
        자동차 매매종사원증(또는 사업자등록증)을 등록하면<br />
        검토 후 스마트옥션을 이용하실 수 있어요.
      </p>
      <DealerApplyForm userId={user.id} onDone={() => setApplied(true)} />
      <button
        onClick={openChannelTalk}
        className="w-full mt-3 text-white/40 hover:text-white/70 font-bold py-2 rounded-xl text-xs transition-colors"
      >
        서류 관련 문의는 채팅으로
      </button>
    </GateCard>
  );
}
