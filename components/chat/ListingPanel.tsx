'use client';

// 대화 중에 같이 보는 매물 카드.
//
// 차를 확인하러 다른 창을 열었다 돌아오면 대화 흐름이 끊기고, 모바일에서는 아예
// 돌아오지 않는 경우가 많다. "물어보기 전에 확인하는 것"만 추려서 대화 옆에 붙여둔다.
// 상세 전체를 복제하지는 않는다 — 더 볼 게 있으면 매물 상세로 보낸다.

import Link from 'next/link';
import { useState } from 'react';
import { KEY_CAR_OPTIONS } from '@/lib/carOptions';

export interface ChatListing {
  id: number;
  titleKo: string;
  trim?: string | null;
  askingPrice: number | null;
  hidePrice?: boolean;
  year?: number | null;
  mileage?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  region?: string | null;
  accident?: boolean;
  hasReport?: boolean;
  status?: string | null;
  options?: string[];
  photos?: string[];
  photo: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  sold: '판매완료',
  hidden: '비공개',
  pending: '검토중',
};

export default function ListingPanel({ item }: { item: ChatListing }) {
  const photos = (item.photos?.length ? item.photos : item.photo ? [item.photo] : []) as string[];
  const [idx, setIdx] = useState(0);

  const price =
    item.hidePrice || !item.askingPrice
      ? '가격 문의'
      : `${Math.round(item.askingPrice / 10000).toLocaleString()}만원`;

  const specs = [
    ['연식', item.year ? `${item.year}년` : null],
    ['주행', item.mileage != null ? `${item.mileage.toLocaleString()}km` : null],
    ['연료', item.fuel],
    ['변속기', item.transmission],
    ['지역', item.region],
    ['사고', item.accident ? '있음' : '무사고'],
  ].filter(([, v]) => v) as [string, string][];

  const keyOptions = (item.options ?? []).filter((o) => KEY_CAR_OPTIONS.includes(o));
  const restCount = (item.options?.length ?? 0) - keyOptions.length;
  const statusLabel = item.status && item.status !== 'active' ? STATUS_LABEL[item.status] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 사진 */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {photos[idx] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[idx]} alt={item.titleKo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">사진 준비 중</div>
        )}
        {statusLabel && (
          <span className="absolute top-3 left-3 bg-gray-900/85 text-white text-[11px] font-black px-2.5 py-1 rounded-full">
            {statusLabel}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto">
          {photos.map((p, i) => (
            <button
              key={p + i}
              onClick={() => setIdx(i)}
              className={`w-12 h-10 rounded-md overflow-hidden shrink-0 border-2 ${
                i === idx ? 'border-violet-500' : 'border-transparent opacity-70'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <p className="text-sm font-black text-gray-900 leading-snug">{item.titleKo}</p>
        {item.trim && <p className="text-[11px] text-gray-400 mt-0.5">{item.trim}</p>}
        <p className="text-xl font-black text-violet-600 mt-2">{price}</p>

        {item.hasReport && (
          <span className="inline-block mt-2 bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-black px-2 py-1 rounded-full">
            🔍 카비어 진단 완료
          </span>
        )}

        {specs.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 pt-4 border-t border-gray-100">
            {specs.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-400 shrink-0">{label}</span>
                <span className="text-xs font-bold text-gray-800 truncate" title={value}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {keyOptions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {keyOptions.map((o) => (
                <span key={o} className="text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                  {o}
                </span>
              ))}
              {restCount > 0 && <span className="text-[11px] font-bold text-gray-300 px-1 py-1">외 {restCount}개</span>}
            </div>
          </div>
        )}

        <Link
          href={`/market/${item.id}`}
          className="block text-center mt-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black py-3 rounded-xl transition-colors"
        >
          매물 상세 보기
        </Link>
      </div>
    </div>
  );
}
