"use client";

import Image from "next/image";
import Link from "next/link";

type CarShort = {
  id: string;
  carName: string;
  title: string;
  thumbnail: string;
  viewers: string;
  isLive?: boolean;
  badge?: string;
};

const carShorts: CarShort[] = [
  {
    id: "k7-mission",
    carName: "올 뉴 K7",
    title: "미션 의뢰 들어왔습니다. 싸고 좋은 K7 고르는 법",
    thumbnail: "/shorts/k7-mission.jpg",
    viewers: "2.6만",
    isLive: true,
    badge: "주행거리 주의",
  },
  {
    id: "used-checklist",
    carName: "중고차 전체",
    title: "중고차를 샀다면 이건 꼭 하세요 (3가지 체크)",
    thumbnail: "/shorts/used-checklist.jpg",
    viewers: "7만",
    badge: "구매 전 필수",
  },
  {
    id: "ev9-vs-x6",
    carName: "EV9 vs X6",
    title: "EV9 실제 크기, X6랑 비교해봤습니다",
    thumbnail: "/shorts/ev9-x6.jpg",
    viewers: "1.9만",
    badge: "전기 SUV 비교",
  },
  {
    id: "panel-check",
    carName: "도막 측정",
    title: "아직도 호구로 보이나? 도막 두께 실시간 체크",
    thumbnail: "/shorts/panel-check.jpg",
    viewers: "2만",
    badge: "판금/도색 체크",
  },
];

export default function CarLiveShortsRow() {
  return (
    <section className="w-full bg-white py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* 상단 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              진단 영상 차량 소개
            </h2>
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">
              LIVE 쇼츠
            </span>
          </div>
          <button className="text-xs font-medium text-gray-500 hover:text-gray-800">
            전체 보기 →
          </button>
        </div>

        {/* 쇼츠 슬라이더 */}
        <div className="-mx-4 overflow-x-auto pb-3">
          <div className="flex gap-4 px-4 snap-x snap-mandatory">
            {carShorts.map((item) => (
              <Link
                key={item.id}
                href={`/cars/live/${item.id}`} // 라우트는 서비스 구조에 맞게 수정
                className="w-40 flex-shrink-0 snap-start"
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />

                  {/* LIVE 뱃지 */}
                  {item.isLive && (
                    <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                      LIVE
                    </span>
                  )}

                  {/* 오른쪽 위 더보기 점 3개 아이콘 느낌 */}
                  <div className="absolute right-2 top-2 flex flex-col gap-[2px] opacity-80">
                    <span className="h-[3px] w-[3px] rounded-full bg-white" />
                    <span className="h-[3px] w-[3px] rounded-full bg-white" />
                    <span className="h-[3px] w-[3px] rounded-full bg-white" />
                  </div>

                  {/* 하단 그라데이션 + 텍스트 */}
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <div className="pointer-events-none rounded-xl bg-gradient-to-t from-black/80 via-black/60 to-transparent px-2 pb-2 pt-6">
                      {item.badge && (
                        <p className="mb-1 text-[10px] font-semibold text-emerald-300">
                          {item.badge}
                        </p>
                      )}
                      <p className="line-clamp-2 text-[11px] font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-200">
                        {item.carName} · 조회수 {item.viewers}회
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 하단 설명 (선택) */}
        <p className="mt-3 text-xs text-gray-500">
          실시간 라이브로 차량 설명 듣고, 궁금한 점을 바로 채팅으로 질문해보세요.
        </p>
      </div>
    </section>
  );
}
