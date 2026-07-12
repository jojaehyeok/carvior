"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Evaluator {
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
  fee: number;
  rating: number;
  reviewCount: number;
  availableTimes: string[];
}

interface BookingData {
  car: {
    model: string;
  };
  address: {
    main: string;
    detail: string;
  };
  schedule: {
    date: string;
    time: string;
  };
}

const evaluators: Evaluator[] = [
  {
    id: 1,
    name: "맹준호 평가사",
    title: "경매장 실차 중심, 핵심만 정확하게 짚어드립니다.",
    avatar: "/evaluator2.png",
    region: "현대글로비스 시화,고양,파주,인천",
    tags: ["경매장 평가", "정밀 검사"],
    handled: 540,
    brands: ["국산차", "수입차"],
    discountRate: 20,
    type: "경매장 평가",
    fee: 100000,
    rating: 4.9,
    reviewCount: 142,
    availableTimes: ["10:00", "11:00", "14:00", "15:00"],
  },
  {
    id: 2,
    name: "오명민 평가사",
    title: "초보도 이해할 수 있게, 쉽게 설명합니다.",
    avatar: "/evaluator1.png",
    region: "오산 Kcar · 경기남부(수원, 화성, 용인, 오산, 안산) · 인천",
    tags: ["출장 평가", "수입차 가능", "친절한 설명"],
    handled: 310,
    brands: ["국산차", "수입차"],
    discountRate: 20,
    type: "출장 평가",
    fee: 100000,
    rating: 4.8,
    reviewCount: 98,
    availableTimes: ["09:00", "13:00", "16:00"],
  },
  {
    id: 3,
    name: "조재혁 대표평가사",
    title: "초보도 이해할 수 있게, 쉽게 설명합니다.",
    avatar: "/evaluator3.png",
    region: "경기남부 · 인천 전지역 출장 가능",
    tags: ["출장 평가", "수입차 가능", "빠른 대응"],
    handled: 110,
    brands: ["국산차", "수입차"],
    discountRate: 20,
    type: "출장 평가",
    fee: 100000,
    rating: 4.7,
    reviewCount: 67,
    availableTimes: ["11:00", "14:00", "15:00"],
  },
];

const sortTabs = ["신규등록순", "최근 진단 많은순", "후기 많은순"];

export default function EvaluatorsPage() {
  const router = useRouter();
  const [selectedEvaluator, setSelectedEvaluator] = useState<number | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedType, setSelectedType] = useState<string>("전체");
  const [searchRegion, setSearchRegion] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필터링된 평가사 목록
  const filteredEvaluators = evaluators.filter(evaluator => {
    // 타입 필터
    if (selectedType !== "전체" && evaluator.type !== selectedType) return false;

    // 지역 검색
    if (searchRegion && !evaluator.region.includes(searchRegion)) return false;

    // 이름 검색
    if (searchName && !evaluator.name.includes(searchName)) return false;

    return true;
  });

  useEffect(() => {
    // 저장된 예약 데이터 로드
    const saved = localStorage.getItem("bookingDraft");

    if (!saved) {
      alert("예약 정보가 없습니다. 홈페이지에서 먼저 입력해주세요.");
      router.push("/");
      return;
    }

    const raw = JSON.parse(saved) as BookingData;
    setBookingData(raw);

    if (raw.schedule?.date) {
      setSearchDate(raw.schedule.date);
    }

    if (raw.address?.main) {
      setSearchRegion(raw.address.main.split(" ")[0]);
    }
  }, [router]);

  const handleSelectEvaluator = (evaluatorId: number) => {
    setSelectedEvaluator(evaluatorId);
  };

  const handleCompleteBooking = async () => {
    if (!selectedEvaluator || !bookingData) {
      alert('평가사를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedEval = evaluators.find(e => e.id === selectedEvaluator);

      if (!selectedEval) {
        throw new Error('선택한 평가사를 찾을 수 없습니다.');
      }

      // 예약 데이터 구성
      const completeBooking = {
        ...bookingData,
        evaluator: {
          id: selectedEval.id,
          name: selectedEval.name,
          title: selectedEval.title,
          avatar: selectedEval.avatar,
          rating: selectedEval.rating,
          fee: selectedEval.discountRate
            ? Math.round(selectedEval.fee * (1 - selectedEval.discountRate / 100))
            : selectedEval.fee,
          originalFee: selectedEval.fee,
          discountRate: selectedEval.discountRate,
          type: selectedEval.type,
          region: selectedEval.region,
        },
        bookingId: `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 800));

      // 예약 완료 데이터 저장
      localStorage.setItem('completedBooking', JSON.stringify(completeBooking));
      localStorage.removeItem('currentBooking'); // 임시 데이터 삭제

      // 예약 완료 페이지로 이동
      router.push(`/booking/payment`);
      // router.push(`/booking/complete?id=${completeBooking.bookingId}`);

    } catch (error) {
      console.error('예약 실패:', error);
      alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = () => {
    // 검색 실행
    console.log('검색 실행:', { searchRegion, searchDate, searchName });
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full bg-white min-h-screen">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 pt-24">
        {/* 상단 텍스트 */}
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold text-gray-900">
            ● 현재 {evaluators.length}명의 검증된 평가사가 활동 중입니다.
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            내 인생차를 검사해 줄{" "}
            <span className="text-black">평가사</span>를 만나보세요!
          </h1>
          <p className="text-sm text-gray-600">
            카비어 진단 평가사는 중고차 매매업(딜러) 활동을 하지 않으며,
            <br className="hidden sm:block" />
            기본 교육과 시스템 기준을 통과한 누구나 활동할 수 있습니다.
          </p>
        </div>

        {/* 예약 정보 표시 */}
        <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">현재 예약 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">차량: </span>
              <span className="font-medium">{bookingData.car.model}</span>
            </div>
            <div>
              <span className="text-gray-600">장소: </span>
              <span className="font-medium">{bookingData.address.main}</span>
            </div>
            <div>
              <span className="text-gray-600">일시: </span>
              <span className="font-medium">
                {new Date(bookingData.schedule.date).toLocaleDateString('ko-KR')}{' '}
                {parseInt(bookingData.schedule.time)}시
              </span>
            </div>
          </div>
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
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            {/* 검사일 */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
              <span className="text-lg">📅</span>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-gray-700"
              />
            </div>

            {/* 평가사 이름 */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
              <span className="text-lg">👤</span>
              <input
                type="text"
                placeholder="평가사 이름"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white hover:bg-gray-900 transition"
            >
              🔍 평가사 찾기
            </button>
          </div>

          {/* 타입 필터 + 정렬 */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex gap-2">
              {["전체", "경매장 평가", "출장 평가"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${selectedType === type
                      ? "bg-black text-white"
                      : "border border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex gap-3 text-xs text-gray-500">
              {sortTabs.map((tab, idx) => (
                <button
                  key={tab}
                  className={`transition ${idx === 0
                      ? "font-semibold text-gray-900"
                      : "hover:text-gray-800"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 평가사 선택 안내 */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">
            평가사를 선택하고 <span className="font-semibold text-blue-600">예약을 완료</span>해주세요
          </p>
        </div>

        {/* ✅ 평가사 카드 리스트 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvaluators.map((e) => (
            <article
              key={e.id}
              className={`relative rounded-3xl bg-white pb-5 pt-9 shadow-sm ring-1 transition-all duration-300 ${selectedEvaluator === e.id
                  ? "ring-2 ring-blue-500 shadow-lg transform scale-[1.02]"
                  : "ring-gray-100 hover:shadow-md"
                }`}
              onClick={() => handleSelectEvaluator(e.id)}
            >
              {/* 할인 배지 */}
              {e.discountRate && (
                <div className="absolute left-4 top-4 rounded-b-xl rounded-tr-xl bg-black px-3 py-1 text-[10px] font-semibold text-white">
                  특별할인 {e.discountRate}%
                </div>
              )}

              {/* 선택 표시 */}
              {selectedEvaluator === e.id && (
                <div className="absolute right-4 top-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <span className="text-xs text-white">✓</span>
                  </div>
                </div>
              )}

              {/* 프로필 */}
              <div className="flex flex-col items-center">
                <div className="relative -mt-10 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                    <span className="text-2xl font-bold text-gray-600">
                      {e.name.charAt(0)}
                    </span>
                  </div>
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

                {/* 평점 및 가격 */}
                <div className="mt-3 flex items-center justify-center gap-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm font-semibold">{e.rating}</span>
                    <span className="ml-1 text-xs text-gray-500">({e.reviewCount})</span>
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    {e.discountRate ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          {e.fee.toLocaleString()}원
                        </span>
                        <span>
                          {Math.round(e.fee * (1 - e.discountRate / 100)).toLocaleString()}원
                        </span>
                      </>
                    ) : (
                      <span>{e.fee.toLocaleString()}원</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 지역 */}
              <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-gray-500">
                <span>📍</span>
                <span className="text-center">{e.region}</span>
              </div>

              {/* 하단 정보 */}
              <div className="mt-4 border-t border-gray-100 px-5 pt-4 text-xs text-gray-700">
                <div className="flex justify-between">
                  {/* 누적 진단 */}
                  <div className="flex flex-1 flex-col items-center">
                    <span className="text-[10px] text-gray-400">누적 진단</span>
                    <span className="mt-1 text-sm font-semibold">
                      {e.handled.toLocaleString()}건
                    </span>
                  </div>

                  {/* 활동 유형 */}
                  <div className="flex flex-1 flex-col items-center border-l border-r border-gray-100">
                    <span className="text-[10px] text-gray-400">활동 유형</span>
                    <span className="mt-1 text-[11px] font-semibold text-black">
                      {e.type}
                    </span>
                  </div>

                  {/* 주력 제조사 */}
                  <div className="flex flex-1 flex-col items-center">
                    <span className="text-[10px] text-gray-400">
                      주력 제조사
                    </span>
                    <span className="mt-1 text-[11px] font-semibold">
                      {e.brands.join(" / ")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelectEvaluator(e.id);
                  }}
                  className={`mt-4 w-full rounded-xl py-2 text-xs font-semibold transition ${selectedEvaluator === e.id
                      ? "bg-blue-600 text-white"
                      : "bg-black text-white hover:bg-gray-900"
                    }`}
                >
                  {selectedEvaluator === e.id ? "선택됨" : "이 평가사 선택하기"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* 선택된 평가사가 없을 때 */}
        {filteredEvaluators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 평가사가 없습니다.</p>
            <button
              onClick={() => {
                setSelectedType("전체");
                setSearchRegion("");
                setSearchName("");
              }}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* 하단 액션 버튼 */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-xl border-2 border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            이전으로 돌아가기
          </button>
          <button
            onClick={handleCompleteBooking}
            disabled={!selectedEvaluator || isSubmitting}
            className={`flex-1 rounded-xl py-4 text-sm font-semibold transition ${selectedEvaluator && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                처리 중...
              </span>
            ) : selectedEvaluator ? (
              "예약 진행하기"
            ) : (
              "평가사를 선택해주세요"
            )}
          </button>
        </div>

        {/* 안내사항 */}
        <div className="mt-8 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
          <p className="font-semibold mb-2">📢 안내사항</p>
          <ul className="space-y-1">
            <li>• 평가사 선택 후 10분 내로 결제를 완료해주세요</li>
            <li>• 선택한 평가사가 일정 조율 후 연락드릴 예정입니다</li>
            <li>• 취소는 예약 확정 전까지 무료입니다</li>
            <li>• 문의사항: 1544-XXXX</li>
          </ul>
        </div>
      </section>
    </main>
  );
}