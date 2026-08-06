'use client';

const STAGES = [
  { key: 'inspected', label: '진단완료' },
  { key: 'bidding', label: '입찰중' },
  { key: 'winner_selected', label: '낙찰 (거래요청)' },
  { key: 'in_transit', label: '탁송중' },
  { key: 'transit_done', label: '탁송완료' },
  { key: 'completed', label: '거래완료' },
];

function stageIndex(status: string, saleStage: string): number {
  // 첫 단계(진단완료)는 매물이 존재하는 시점엔 항상 완료된 것으로 간주
  if (status === 'hidden' || status === 'pending') return 0;
  const idx = ['bidding', 'winner_selected', 'in_transit', 'transit_done', 'completed'].indexOf(saleStage);
  return idx >= 0 ? idx + 1 : 1;
}

export default function SaleStageTimeline({
  status,
  saleStage,
  auctionEndAt,
  transferredRegistrationUrl,
}: {
  status: string;
  saleStage?: string;
  auctionEndAt?: string | null;
  transferredRegistrationUrl?: string | null;
}) {
  const current = stageIndex(status, saleStage ?? 'bidding');

  return (
    <div className="w-full">
      <div className="flex items-start">
        {STAGES.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={s.key} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-0.5 ${done || active ? 'bg-violet-500' : 'bg-gray-200'}`}
                  style={{ zIndex: 0 }}
                />
              )}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10
                  ${done ? 'bg-violet-600 text-white' : active ? 'bg-violet-100 border-2 border-violet-600 text-violet-600' : 'bg-gray-100 text-gray-300'}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <p className={`mt-1.5 text-[10px] font-bold text-center leading-tight ${done || active ? 'text-gray-900' : 'text-gray-300'}`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {status === 'active' && auctionEndAt && (
        <p className="text-center text-xs text-gray-400 mt-4">
          입찰 마감: {new Date(auctionEndAt).toLocaleString('ko-KR')}
        </p>
      )}

      {current === STAGES.length - 1 && transferredRegistrationUrl && (
        <div className="text-center mt-4">
          <a
            href={transferredRegistrationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm font-bold text-violet-600 underline hover:text-violet-700"
          >
            등록증 확인 →
          </a>
        </div>
      )}
    </div>
  );
}
