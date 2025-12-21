// pages/evaluators.tsx
import type { NextPage } from "next";
import Image from "next/image";

type Evaluator = {
    id: number;
    name: string;
    title: string;
    avatar: string;
    region: string;
    tags: string[];
    handled: number;
    brands: string[];
    discountRate?: number;
    type: "출장 평가" | "경매장 평가";
};

const evaluators: Evaluator[] = [
    {
        id: 1,
        name: "맹준호 평가사",
        title: "경매장 실차 중심, 핵심만 정확하게 짚어드립니다.",
        avatar: "/evaluator2.png", // 이미지 없으면 임시 이미지 넣어도 됨
        region: "현대글로비스 시화,고양,파주,인천",
        tags: ["경매장 평가"],
        handled: 540,
        brands: ["국산차, 수입차"],
        discountRate: 20,
        type: "경매장 평가",
    },
    {
        id: 2,
        name: "오명민 평가사",
        title: "초보도 이해할 수 있게, 쉽게 설명합니다.",
        avatar: "/evaluator1.png",
        region: "오산 Kcar · 경기남부(수원, 화성, 용인, 오산, 안산) · 인천",
        tags: ["출장 평가", "수입차 가능"],
        handled: 310,
        brands: ["국산차, 수입차"],
        discountRate: 20,
        type: "출장 평가",
    },
    {
        id: 3,
        name: "조재혁 대표평가사",
        title: "초보도 이해할 수 있게, 쉽게 설명합니다.",
        avatar: "/evaluator3.png",
        region: "경기남부 · 인천 전지역 출장 가능",
        tags: ["출장 평가", "수입차 가능"],
        handled: 110,
        brands: ["국산차, 수입차"],
        discountRate: 20,
        type: "출장 평가",
    },
];

const sortTabs = ["신규등록순", "최근 진단 많은순", "후기 많은순"];

const EvaluatorsPage: NextPage = () => {
    return (
        <main className="w-full bg-white">
            <section className="mx-auto max-w-6xl px-6 pb-16 pt-24">
                {/* 상단 텍스트 */}
                <div className="mb-8 space-y-2">
                    <p className="text-xs font-semibold text-gray-900">
                        ● 현재 3명의 검증된 평가사가 활동 중입니다.
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900">
                        내 인생차를 검사해 줄{" "}
                        <span className="text-black">평가사</span>를 만나보세요!
                    </h1>
                    <p className="text-sm text-gray-600">
                        카비어 평가사는 중고차 매매업(딜러) 활동을 하지 않으며,
                        <br className="hidden sm:block" />
                        기본 교육과 시스템 기준을 통과한 누구나 활동할 수 있습니다.
                    </p>
                </div>

                {/* 검색/필터 바 */}
                <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <div className="grid gap-3 md:grid-cols-[1.2fr,1.2fr,1.2fr,auto]">
                        {/* 검사 지역 */}
                        <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
                            <span className="text-lg">📍</span>
                            <input
                                type="text"
                                placeholder="검사 지역"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                            />
                        </div>

                        {/* 검사일 */}
                        <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
                            <span className="text-lg">📅</span>
                            <input
                                type="date"
                                className="w-full bg-transparent text-sm outline-none text-gray-700"
                            />
                        </div>

                        {/* 평가사 이름 */}
                        <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
                            <span className="text-lg">👤</span>
                            <input
                                type="text"
                                placeholder="평가사 이름"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                            />
                        </div>

                        {/* 버튼 */}
                        <button className="flex items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white hover:bg-gray-900">
                            🔍 평가사 찾기
                        </button>
                    </div>

                    {/* 타입 필터 + 정렬 */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <div className="flex gap-2">
                            <button className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                                전체
                            </button>
                            <button className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-black">
                                경매장 평가
                            </button>
                            <button className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-black">
                                출장 평가
                            </button>
                        </div>

                        <div className="flex gap-3 text-xs text-gray-500">
                            {sortTabs.map((tab, idx) => (
                                <button
                                    key={tab}
                                    className={
                                        idx === 0
                                            ? "font-semibold text-gray-900"
                                            : "hover:text-gray-800"
                                    }
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ✅ 평가사 카드 리스트 */}
                <div className="grid gap-6 md:grid-cols-2">
                    {evaluators.map((e) => (
                        <article
                            key={e.id}
                            className="relative rounded-3xl bg-white pb-5 pt-9 shadow-sm ring-1 ring-gray-100"
                        >
                            {/* 할인 배지 */}
                            {e.discountRate && (
                                <div className="absolute left-4 top-4 rounded-b-xl rounded-tr-xl bg-black px-3 py-1 text-[10px] font-semibold text-white">
                                    특별할인 {e.discountRate}%
                                </div>
                            )}

                            {/* 프로필 */}
                            <div className="flex flex-col items-center">
                                <div className="relative -mt-10 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md bg-gray-200">
                                    <Image
                                        src={e.avatar}
                                        alt={e.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-[11px]">
                                    {e.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-900"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h3 className="mt-3 text-base font-bold text-gray-900">
                                    {e.name}
                                </h3>
                                <p className="mt-1 px-4 text-center text-xs text-gray-500">
                                    {e.title}
                                </p>
                            </div>

                            {/* 지역 */}
                            <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-gray-500">
                                <span>📍</span>
                                <span>{e.region}</span>
                            </div>

                            {/* 하단 정보 */}
                            <div className="mt-4 border-t border-gray-100 px-5 pt-4 text-xs text-gray-700">
                                <div className="flex justify-between">
                                    {/* 누적 진단 */}
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[10px] text-gray-400">누적 진단</span>
                                        <span className="mt-1 text-sm font-semibold">
                                            {e.handled.toLocaleString()}건
                                        </span>
                                    </div>

                                    {/* 활동 유형 */}
                                    <div className="flex flex-col items-center flex-1 border-l border-r border-gray-100">
                                        <span className="text-[10px] text-gray-400">활동 유형</span>
                                        <span className="mt-1 text-[11px] font-semibold text-black">
                                            {e.type}
                                        </span>
                                    </div>

                                    {/* 주력 제조사 */}
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[10px] text-gray-400">
                                            주력 제조사
                                        </span>
                                        <span className="mt-1 text-[11px] font-semibold">
                                            {e.brands.join(" / ")}
                                        </span>
                                    </div>
                                </div>

                                <button className="mt-4 w-full rounded-xl bg-black py-2 text-xs font-semibold text-white hover:bg-gray-900">
                                    이 평가사에게 진단 요청하기
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default EvaluatorsPage;
