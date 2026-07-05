'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';


const FUEL_OPTIONS   = ['가솔린', '디젤', '하이브리드', 'LPG', '전기'];
const CAT_OPTIONS    = ['SUV', '세단', '해치백', '경차', '소형차', '중형', '대형', 'RV'];
const TRANS_OPTIONS  = ['자동', '수동'];
const REGION_OPTIONS = ['서울', '경기도', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const EXCHANGE_RATE = 1350;

function fmtKRW(n: number) {
  if (!n) return '';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  return `${Math.round(n / 10_000)}만원`;
}

export default function SelfRegisterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    titleKo: '', titleEn: '', trim: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuel: '가솔린',
    displacement: '',
    transmission: '자동',
    color: '', colorKo: '',
    accident: false,
    priceKRW: 0,
    category: 'SUV',
    region: '서울',
    carNumber: '',
    adminMemo: '',
  });

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.titleKo || !form.carNumber || form.priceKRW <= 0) {
      alert('차량명, 차량번호, 판매가는 필수 입력 항목입니다.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        bookingId: Date.now(),
        titleEn: form.titleEn || form.titleKo,
        priceUSD: Math.round(form.priceKRW / EXCHANGE_RATE),
        hasReport: false,
        location: 'Korea',
        doors: 5, seats: 5,
        inspectedAt: new Date().toISOString().split('T')[0],
        registeredAt: new Date().toISOString(),
        status: 'hidden',
        photos: { exterior: [], interior: [], engine: [], wheel: [], undercarriage: [], damage: [], extra: [] },
        specs: [
          { label: 'Year', value: String(form.year) },
          { label: 'Mileage', value: `${form.mileage.toLocaleString()} KM` },
          { label: 'Fuel', value: form.fuel },
          { label: 'Transmission', value: form.transmission },
          { label: 'Color', value: form.colorKo || form.color },
          { label: 'Displacement', value: form.displacement },
        ].filter(s => s.value),
        options: [],
      };
      const res = await fetch('/api/admin/store-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? '등록 실패');
        return;
      }
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" fill="none" stroke="#16a34a" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">등록 완료!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            매물이 접수되었습니다.<br />
            어드민 검토 후 스토어에 노출됩니다.<br />
            보통 1~2 영업일 내에 처리됩니다.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setDone(false); setForm(f => ({ ...f, titleKo: '', carNumber: '', priceKRW: 0 })); }} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              추가 등록
            </button>
            <button onClick={() => router.push('/buy')} className="px-6 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors">
              매물 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
        <div className="bg-zinc-950">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase mb-2">일반인 · 딜러 · 수출 모두 가능</p>
            <h1 className="text-2xl font-black text-white">셀프 매물 등록</h1>
            <p className="text-zinc-400 text-sm mt-1">검토 후 1~2 영업일 내 카비어 스토어에 노출됩니다.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Field label="차량명 (한국어)" required>
              <input value={form.titleKo} onChange={e => set('titleKo', e.target.value)} placeholder="예: 기아 더 뉴 쏘렌토" className={inp} />
            </Field>
            <Field label="차량명 (영어)">
              <input value={form.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="예: Kia Sorento" className={inp} />
            </Field>

            <Field label="차량번호" required>
              <input value={form.carNumber} onChange={e => set('carNumber', e.target.value)} placeholder="예: 12가 3456" className={inp} />
            </Field>
            <Field label="트림">
              <input value={form.trim} onChange={e => set('trim', e.target.value)} placeholder="예: Noblesse" className={inp} />
            </Field>

            <Field label="연식">
              <input type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} className={inp} />
            </Field>
            <Field label="주행거리 (km)">
              <input type="number" value={form.mileage || ''} onChange={e => set('mileage', Number(e.target.value))} placeholder="예: 30000" className={inp} />
            </Field>

            <Field label="연료">
              <select value={form.fuel} onChange={e => set('fuel', e.target.value)} className={inp}>
                {FUEL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="변속기">
              <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className={inp}>
                {TRANS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>

            <Field label="배기량">
              <input value={form.displacement} onChange={e => set('displacement', e.target.value)} placeholder="예: 2,497cc" className={inp} />
            </Field>
            <Field label="카테고리">
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inp}>
                {CAT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>

            <Field label="색상 (한국어)">
              <input value={form.colorKo} onChange={e => set('colorKo', e.target.value)} placeholder="예: 스노우 화이트 펄" className={inp} />
            </Field>
            <Field label="지역">
              <select value={form.region} onChange={e => set('region', e.target.value)} className={inp}>
                {REGION_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>

            <Field label="판매가 (원)" required className="md:col-span-2">
              <div className="relative">
                <input
                  type="number"
                  value={form.priceKRW || ''}
                  onChange={e => set('priceKRW', Number(e.target.value))}
                  placeholder="예: 36900000"
                  className={`${inp} pr-36`}
                />
                {form.priceKRW > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm font-bold pointer-events-none">
                    {fmtKRW(form.priceKRW)} / ${Math.round(form.priceKRW / EXCHANGE_RATE).toLocaleString()}
                  </span>
                )}
              </div>
            </Field>

            <Field label="사고 이력" className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer mt-1">
                <input type="checkbox" checked={form.accident} onChange={e => set('accident', e.target.checked)} className="w-4 h-4 accent-purple-600" />
                <span className="text-sm text-gray-700">사고 이력 있음</span>
              </label>
            </Field>

            <Field label="메모 (내부 참고용)" className="md:col-span-2">
              <textarea value={form.adminMemo} onChange={e => set('adminMemo', e.target.value)} rows={3} placeholder="검토자에게 전달할 내용 (외부 미노출)" className={`${inp} resize-none`} />
            </Field>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <strong>안내</strong> · 셀프 등록 매물은 어드민 검토 후 '숨김' 상태에서 '판매중'으로 전환됩니다.
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              취소
            </button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-bold transition-colors">
              {saving ? '등록 중…' : '매물 등록 신청'}
            </button>
          </div>
        </div>
      </div>
  );
}

const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition-colors bg-white';

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
