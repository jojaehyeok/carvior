'use client';

// 매물 사진 전체보기 — 헤이딜러식 탭 갤러리.
// 진단사 앱이 이미 카테고리별로 저장하고 있는 사진(exterior/interior/wheel/...)을
// 그대로 묶어서 보여준다. 탭을 누르면 그 섹션으로 스크롤하고, 스크롤하면 탭이 따라온다.

import { useEffect, useMemo, useRef, useState } from 'react';

// 진단사 앱의 사진 카테고리를 매물 화면에서 보여줄 탭으로 묶는다.
// 헤이딜러는 실내/외부/하부/고지사항 4탭인데, 카비어는 엔진룸·옵션도 따로 찍으므로
// 사진이 있는 카테고리만 탭으로 만든다(빈 탭은 아예 안 보여줌).
const TAB_GROUPS: { id: string; label: string; keys: string[] }[] = [
  { id: 'exterior', label: '외부', keys: ['exterior', 'wheel'] },
  { id: 'interior', label: '실내', keys: ['interior', 'dashboard'] },
  { id: 'engine', label: '엔진룸', keys: ['engine'] },
  { id: 'undercarriage', label: '하부', keys: ['undercarriage'] },
  { id: 'option', label: '옵션', keys: ['extra', 'extraMemo'] },
  { id: 'damage', label: '고지사항', keys: ['damage'] },
];

// 사진 한 장에 붙는 설명 — 어느 카테고리에서 온 사진인지 알 수 있게 한다.
const KEY_LABEL: Record<string, string> = {
  exterior: '외관',
  wheel: '휠 & 트레드',
  interior: '실내',
  dashboard: '계기판',
  engine: '엔진룸',
  undercarriage: '하부 & 누유',
  extra: '옵션',
  extraMemo: '기타',
  damage: '내외판 데미지',
};

export interface PhotoGalleryProps {
  photos?: Record<string, string[]>;
  /** 고지사항 탭 하단에 붙는 평가 내용(누유·경고등 등). 없으면 생략. */
  noticeRows?: { label: string; value: string; bad: boolean }[];
  open: boolean;
  onClose: () => void;
  title?: string;
}

export default function PhotoGallery({ photos, noticeRows, open, onClose, title }: PhotoGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeTab, setActiveTab] = useState('');
  // 탭을 눌러서 스크롤하는 중에는 스크롤 감지가 탭을 다시 바꾸지 않도록 잠근다.
  const lockUntil = useRef(0);

  const sections = useMemo(() => {
    if (!photos) return [];
    return TAB_GROUPS.map(g => {
      const items: { url: string; label: string }[] = [];
      for (const key of g.keys) {
        for (const url of photos[key] ?? []) items.push({ url, label: KEY_LABEL[key] ?? key });
      }
      return { ...g, items };
    }).filter(s => s.items.length > 0 || (s.id === 'damage' && (noticeRows?.length ?? 0) > 0));
  }, [photos, noticeRows]);

  useEffect(() => {
    if (open && sections.length > 0) setActiveTab(prev => prev || sections[0].id);
  }, [open, sections]);

  // 열려 있는 동안 배경 스크롤 방지 — 닫을 때 원래 값으로 되돌린다.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const goTab = (id: string) => {
    setActiveTab(id);
    lockUntil.current = Date.now() + 700;
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 스크롤 위치에 따라 현재 탭을 갱신 — 탭 바 바로 아래에 걸친 섹션을 활성으로 본다.
  const onScroll = () => {
    if (Date.now() < lockUntil.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const threshold = container.getBoundingClientRect().top + 80;
    let current = sections[0]?.id ?? '';
    for (const s of sections) {
      const el = sectionRefs.current[s.id];
      if (el && el.getBoundingClientRect().top <= threshold) current = s.id;
    }
    setActiveTab(current);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* 탭 바 */}
      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="flex-1 flex overflow-x-auto no-scrollbar">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => goTab(s.id)}
                className={`shrink-0 px-4 py-3.5 text-sm font-black border-b-2 transition-colors ${
                  activeTab === s.id
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                {s.label}
                {s.items.length > 0 && (
                  <span className="ml-1 text-[11px] font-bold opacity-50">{s.items.length}</span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-900"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* 사진 스트림 */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {title && <p className="text-xs font-bold text-gray-400 mb-3">{title}</p>}

          {sections.map(s => (
            <div key={s.id} ref={el => { sectionRefs.current[s.id] = el; }} className="scroll-mt-2">
              <p className="text-sm font-black text-gray-900 py-3 sticky top-0 bg-white/95 backdrop-blur">
                {s.label}
              </p>

              {s.items.map((p, i) => (
                <div key={`${p.url}-${i}`} className="mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.label}
                    loading="lazy"
                    className="w-full rounded-lg bg-gray-100"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">{p.label}</p>
                </div>
              ))}

              {/* 고지사항 탭에는 사진 뒤에 평가 내용을 같이 보여준다 */}
              {s.id === 'damage' && !!noticeRows?.length && (
                <div className="mb-6 border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {noticeRows.map(r => (
                    <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-3">
                      <span className="text-sm text-gray-500 shrink-0">{r.label}</span>
                      <span className={`text-sm font-bold text-right whitespace-pre-line ${r.bad ? 'text-amber-600' : 'text-gray-700'}`}>
                        {r.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {sections.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-20">등록된 사진이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
