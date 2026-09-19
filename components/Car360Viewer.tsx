'use client';

// 차 주위를 한 바퀴 돌며 찍은 영상을 드래그로 돌려보는 뷰어.
// 영상을 "재생"하는 게 아니라 드래그 거리에 맞춰 currentTime을 옮겨서(스크럽) 회전처럼 보이게 한다.
//
// 주의: 스크럽이 부드러우려면 인코딩할 때 키프레임 간격이 촘촘해야 한다(1초 이하 권장).
// 키프레임이 드문 영상은 브라우저가 매번 앞 키프레임부터 디코딩해서 뚝뚝 끊긴다.

import { useEffect, useRef, useState } from 'react';

interface Props {
  videoUrl: string;
  poster?: string;
  className?: string;
}

// 화면 가로폭 대비 이 비율만큼 끌면 영상이 한 바퀴(=전체 길이) 돈다.
// 1.0이면 화면 끝에서 끝까지가 정확히 한 바퀴 — 모바일에서도 한 번에 돌릴 수 있다.
const SWIPE_RATIO = 1.0;

export default function Car360Viewer({ videoUrl, poster, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startTime = useRef(0);
  // 드래그 중에는 매 이벤트마다 currentTime을 쓰지 않고, rAF에서 마지막 값 한 번만 반영한다.
  // (모바일에서 터치무브가 초당 수십 번 오는데 그때마다 시크하면 디코더가 못 따라가서 버벅인다)
  const pendingTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [hinted, setHinted] = useState(false);

  const flush = () => {
    rafId.current = null;
    const video = videoRef.current;
    if (!video || pendingTime.current == null) return;
    video.currentTime = pendingTime.current;
    pendingTime.current = null;
  };

  const queueSeek = (time: number) => {
    pendingTime.current = time;
    if (rafId.current == null) rafId.current = requestAnimationFrame(flush);
  };

  useEffect(() => () => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
  }, []);

  const duration = () => {
    const d = videoRef.current?.duration;
    return d && Number.isFinite(d) && d > 0 ? d : null;
  };

  const startDrag = (x: number) => {
    const video = videoRef.current;
    if (!video || !duration()) return;
    dragging.current = true;
    startX.current = x;
    startTime.current = video.currentTime;
    setHinted(true);
  };

  const moveDrag = (x: number) => {
    const video = videoRef.current;
    const total = duration();
    if (!dragging.current || !video || !total) return;

    const width = containerRef.current?.clientWidth || 1;
    const diff = x - startX.current;
    // 한 바퀴를 화면 폭 기준으로 환산 — 화면이 작아도 같은 제스처로 한 바퀴가 돈다.
    let next = startTime.current + (diff / (width * SWIPE_RATIO)) * total;
    // 끝에서 처음으로 이어지게(양방향 모두) 감싼다.
    next = ((next % total) + total) % total;
    queueSeek(next);
  };

  const endDrag = () => { dragging.current = false; };

  // 버튼은 한 번에 전체의 1/24씩 — 한 바퀴를 24스텝으로 나눈 값.
  const step = (direction: number) => {
    const video = videoRef.current;
    const total = duration();
    if (!video || !total) return;
    const next = video.currentTime + direction * (total / 24);
    video.currentTime = ((next % total) + total) % total;
    setHinted(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden bg-gray-100 select-none touch-pan-y ${className ?? ''}`}
      onMouseDown={e => startDrag(e.clientX)}
      onMouseMove={e => moveDrag(e.clientX)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={e => startDrag(e.touches[0].clientX)}
      onTouchMove={e => moveDrag(e.touches[0].clientX)}
      onTouchEnd={endDrag}
      style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        preload="auto"
        muted
        playsInline
        // 스크럽 전용이라 재생은 하지 않는다. 컨트롤도 숨김.
        onLoadedMetadata={() => setReady(true)}
        className="w-full h-full object-cover pointer-events-none"
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-7 h-7 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {ready && (
        <>
          <button
            onClick={() => step(-1)}
            aria-label="왼쪽으로 회전"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => step(1)}
            aria-label="오른쪽으로 회전"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* 처음 한 번만 안내 — 한 번이라도 돌려봤으면 숨긴다 */}
          {!hinted && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-4 py-2 rounded-full pointer-events-none">
              ↔ 드래그해서 차량을 돌려보세요
            </div>
          )}

          <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-black px-2.5 py-1 rounded-full pointer-events-none">
            360°
          </div>
        </>
      )}
    </div>
  );
}
