"use client";

import { Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";

const regions = [
  "수원",
  "서울 강서",
  "인천",
  "대구",
  "부산",
  "부천/시흥",
  "용인",
  "서울 강남",
];

export default function ServiceSection() {
  return (
    <section className="w-full bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* ✅ 상단 서비스 카드 영역 (평가사 맞춤) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* ✅ 카드 1 : 출장 평가 */}
          <Card className="p-5 border border-gray-200 shadow-sm">
            <CardBody className="space-y-3">
              <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                🚘 당일·익일 방문 가능
              </span>

              <h3 className="text-lg font-bold text-gray-900">
                구매 전 필수 절차
                <br />
                출장 성능평가
              </h3>

              {/* ✅ 회색 가독성 개선 */}
              <p className="text-sm text-gray-700">
                바쁜 일정에도,
                <br />
                어디든 평가사가 직접 방문합니다.
              </p>

              <div className="mt-4 flex justify-end">
                <div className="h-12 w-12 rounded-lg bg-blue-100" />
              </div>
            </CardBody>
          </Card>

          {/* ✅ 카드 2 : 정밀 진단 */}
          <Card className="p-5 border border-gray-200 shadow-sm">
            <CardBody className="space-y-3">
              <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                AI + 전문가 이중 검증
              </span>

              <h3 className="text-lg font-bold text-gray-900">
                인수 전·후 꼼꼼하게
                <br />
                정밀 성능 진단
              </h3>

              {/* ✅ 회색 가독성 개선 */}
              <p className="text-sm text-gray-700">
                사고·누유·침수 이력부터
                <br />
                잔존가치까지 한 번에 확인
              </p>

              <div className="mt-4 flex justify-end">
                <div className="h-12 w-12 rounded-lg bg-slate-200" />
              </div>
            </CardBody>
          </Card>

          {/* ✅ 프로모션 배너 (평가사 컨셉 맞춤) */}
          <div className="relative flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-700 p-6 text-white shadow-md">
            <div>
              <h3 className="text-xl font-bold">
                지금 평가 예약하면
                <br />
                10% 할인
              </h3>

              <p className="mt-2 text-sm opacity-90">
                첫 이용 고객 대상
                <br />
                최대 10만원 혜택
              </p>

              <button className="mt-4 text-sm font-semibold underline underline-offset-4">
                자세히 보기 →
              </button>
            </div>

            <div className="h-16 w-20 rounded-xl bg-white/20" />
          </div>
        </div>

        
      </div>
    </section>
  );
}
