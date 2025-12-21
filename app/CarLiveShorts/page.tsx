"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CarLiveDetailPage() {
  const router = useRouter();

  // 실제로는 params.id로 API 호출해서 가져오겠지
  const video = {
    id: "k7-mission",
    carName: "올 뉴 K7",
    title: "와… 이런 K7이면 진짜 행복 아닐까? 미션 의뢰 들어왔습니다.",
    subtitle: "주행거리 주의 · 완벽 점검 리포트 제공",
    viewers: "2.6만",
    likes: "4천",
    comments: "129",
    shares: "84",
    thumbnail: "/shorts/k7-mission.jpg", // 없으면 비디오 태그로 교체
  };

  return (
    <main className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto flex max-w-5xl gap-8 px-4 py-8 lg:px-0">
        {/* ✅ 가운데 세로 영상 카드 영역 */}
        <section className="flex flex-1 flex-col items-center">
          <div className="w-full max-w-[430px]">
            {/* 상단 타이틀 / 뒤로가기 등 넣고 싶으면 여기 */}
          </div>

          {/* 세로 영상 카드 */}
          <div className="relative mt-2 w-full max-w-[430px] overflow-hidden rounded-2xl bg-black shadow-lg">
            {/* 썸네일/영상: 필요에 따라 <video>로 교체 */}
            <div className="relative aspect-[9/16]">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
              />

              {/* 전체 화면 버튼 or 아이콘 자리 */}
              <button className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
                ⛶
              </button>
            </div>
          </div>

          {/* 아래 텍스트 정보 / CTA */}
          <div className="mt-4 w-full max-w-[430px] space-y-2">
            <p className="text-xs font-semibold text-emerald-500">
              {video.carName} · 영상 진단
            </p>
            <h1 className="text-base font-bold leading-snug text-gray-900">
              {video.title}
            </h1>
            <p className="text-xs text-gray-500">{video.subtitle}</p>

            <p className="text-[11px] text-gray-400">
              조회수 {video.viewers}회 · 실시간 차량 설명 / 성능 점검 콘텐츠
            </p>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-gray-900">
                이 차량, 평가사에게 문의하기
              </button>
              <button className="rounded-full border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:border-gray-500">
                차량 상세보기
              </button>
            </div>
          </div>
        </section>

        {/* ✅ 우측 액션 버튼 컬럼 (md 이상에서 표시) */}
        <aside className="hidden w-20 flex-col items-center justify-center gap-6 md:flex">
          {/* 좋아요 */}
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-lg">👍</span>
            </div>
            <span className="text-[11px] font-medium">{video.likes}</span>
          </button>

          {/* 싫어요 */}
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-lg">👎</span>
            </div>
            <span className="text-[11px] font-medium">싫어요</span>
          </button>

          {/* 댓글 */}
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-lg">💬</span>
            </div>
            <span className="text-[11px] font-medium">{video.comments}</span>
          </button>

          {/* 공유 */}
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-lg">📤</span>
            </div>
            <span className="text-[11px] font-medium">{video.shares}</span>
          </button>

        </aside>
      </div>
    </main>
  );
}
