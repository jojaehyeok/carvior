'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_ENDPOINT;
const MIN_QUALIFYING_COUNT = 10;

function openChannelTalk() {
  (window as any).ChannelIO?.('show');
}

const FEATURES = [
  { icon: '🔗', title: '우리 회사 전용 URL', desc: '가입 즉시 "carvior.store/diagnosis/우리회사" 전용 페이지가 생겨요. 코드 작업, 대기 기간 없이 바로 씁니다.' },
  { icon: '📋', title: '신청내역 한눈에', desc: '우리 회사가 요청한 검차 건들만 모아서 보여드려요. 상태(대기·진행·완료)까지 실시간 확인 가능.' },
  { icon: '📄', title: '리포트 모아보기', desc: '완료된 진단 리포트를 건마다 찾아다닐 필요 없이 한 화면에서 모아볼 수 있어요.' },
  { icon: '✍️', title: '계약 정보 관리', desc: '계약자성함·구전 등 우리 쪽 거래 진행 정보를 직접 기록하고 관리할 수 있어요.' },
  { icon: '🔔', title: '완료 알림', desc: '진단이 끝나면 담당자 번호로 바로 알림이 가서 놓치는 건 없이 확인됩니다.' },
  { icon: '💳', title: '후정산 지원', desc: '건별 결제 대신 월 단위로 모아서 정산하는 것도 가능해요.' },
];

const STEPS = [
  { num: '01', title: '자격 확인', desc: '검차 신청했던 연락처로 개별 이용 횟수를 확인해요.' },
  { num: '02', title: '제휴 신청', desc: '조건을 충족하면 바로 신청 폼이 열려요.' },
  { num: '03', title: '전용페이지 개설', desc: '확인 후 카비어가 전용 관리 계정을 만들어드려요.' },
];

type CheckState = 'idle' | 'checking' | 'eligible' | 'ineligible' | 'submitted';

export default function PartnerPanelPage() {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<CheckState>('idle');
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheck = async () => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) { alert('연락처를 정확히 입력해주세요.'); return; }
    setState('checking');
    try {
      const res = await fetch(`${API}/external/request/individual-count?phone=${clean}`);
      const data = await res.json();
      const n = data.count ?? 0;
      setCount(n);
      setState(n >= MIN_QUALIFYING_COUNT ? 'eligible' : 'ineligible');
    } catch {
      alert('확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setState('idle');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { alert('이름을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/external/partner-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone: phone.replace(/[^0-9]/g, ''), email, companyName, message,
          qualifyingCount: count,
        }),
      });
      if (!res.ok) throw new Error();
      setState('submitted');
    } catch {
      alert('신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 */}
      <div className="bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-zinc-900 to-zinc-900 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            개별 검차 {MIN_QUALIFYING_COUNT}회 이상 고객 전용 제안
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.2] mb-5">
            검차 요청할 때마다 흩어지던 이력,<br />
            <span className="text-violet-400">우리 회사 전용 페이지</span>로 모아드립니다.
          </h1>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            렌트 만기·판매 전환 등으로 검차를 자주 요청해오셨다면, 이미 저희와 충분히 거래해오신 거예요.
            매번 따로 연락하고 리포트 찾을 필요 없이, 회사 전용 관리페이지 하나로 신청부터 리포트까지 관리해드립니다.
          </p>
          <a
            href="#check"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-xl text-sm transition-colors"
          >
            내 자격 확인하기 →
          </a>
        </div>
      </div>

      {/* 기능 소개 */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">WHAT YOU GET</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">가입하시면 이런 게 생겨요</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-black text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 진행 절차 */}
      <div className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-500 mb-3">HOW IT WORKS</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">복잡한 절차 없이, 3단계면 끝</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="flex gap-5">
                <span className="text-4xl font-black leading-none shrink-0 text-violet-600">{s.num}</span>
                <div>
                  <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 자격 확인 + 신청 */}
      <div id="check" className="bg-violet-600 py-20">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {state === 'submitted' ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-3">🎉</p>
                <p className="font-black text-gray-900 mb-1.5">신청 완료!</p>
                <p className="text-sm text-gray-400">확인 후 담당자가 연락드릴게요.</p>
              </div>
            ) : (state === 'eligible') ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center mb-2">
                  <p className="text-sm font-black text-green-700">🎉 자격 확인 완료! (개별 검차 {count}회)</p>
                  <p className="text-xs text-green-600 mt-0.5">전용 관리페이지 신청이 가능합니다</p>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="이름"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 (선택)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500" />
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="회사명 (선택)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="전달하실 내용 (선택)" rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500" />
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-violet-600 text-white text-sm font-black disabled:opacity-50 hover:bg-violet-500 transition-colors"
                >
                  {submitting ? '신청 중…' : '전용 관리페이지 신청하기'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-black text-gray-900 mb-1">검차 신청하셨던 연락처를 입력해주세요</p>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleCheck}
                  disabled={state === 'checking'}
                  className="w-full py-3.5 rounded-xl bg-violet-600 text-white text-sm font-black disabled:opacity-50 hover:bg-violet-500 transition-colors"
                >
                  {state === 'checking' ? '확인 중…' : '자격 확인하기'}
                </button>
                {state === 'ineligible' && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-gray-500">
                      아직은 조건({MIN_QUALIFYING_COUNT}회 이상)에 못 미쳐요 — 현재 개별 검차 {count}회
                    </p>
                    <button onClick={openChannelTalk} className="text-xs font-bold text-violet-600 underline mt-2">
                      그래도 문의하고 싶어요
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-center text-violet-200 text-xs mt-4">가입비·월 이용료 없이 무료로 제공됩니다.</p>
        </div>
      </div>
    </div>
  );
}
