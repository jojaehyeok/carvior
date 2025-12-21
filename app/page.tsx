"use client";

import CarLiveShortsRow from "@/components/CarLiveShorts/CarLiveShorts";
import ServiceSection from "@/components/home/ServiceSection";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";

const carList = [
  { key: "avante", label: "아반떼" },
  { key: "sonata", label: "쏘나타" },
  { key: "santafe", label: "싼타페" },
  { key: "k5", label: "K5" },
  { key: "spark", label: "스파크" },
];

const priceList = [
  { key: "100~500", label: "500이하" },
  { key: "500~1000", label: "1000이하" },
  { key: "1000~1500", label: "1500이하" },
  { key: "1500~2000", label: "2000이하" },
  { key: "2000~3000", label: "3000이하" },
];


export default function Home() {
  return (
    <main className="w-full">
      {/* ✅ 풀스크린 Hero 섹션 */}
      <section
        className="
relative min-h-[90vh] w-screen -mx-[calc(50vw-50%)] bg-black text-white overflow-hidden pt-16
        "
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <img
            src="/jindanimage.png"
            alt="hero"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* 전체 레이아웃 */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6">
          <div className="grid w-full grid-cols-1 items-start gap-10 md:grid-cols-2">
            {/* ===================== 좌측 영역 ===================== */}
            <div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                "대기업 경매 차량구매",
                <br />
                정말 괜찮은 걸까?"
              </h1>

              <p className="mt-4 text-xl font-semibold text-emerald-400">
                베테랑 <span className="underline decoration-emerald-400">평가사</span>가 직접 알려드릴게요.
              </p>

              {/* 후기 카드 */}
              <Card className="mt-8 max-w-xl bg-white text-black">
                <CardBody className="space-y-3">
                  <p className="text-lg font-medium">
                    “전문 평가사님이 사고·수리 이력부터 현재 상태까지
                    <br />
                    하나하나 짚어주셔서
                    <span className="text-emerald-500 font-semibold">
                      {" "}마음 편하게 계약까지 진행했어요.
                    </span>
                    ”
                  </p>
                  <p className="text-sm text-gray-500">
                    제네시스 GV70 · 이*연님
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* ===================== 우측 영역 (예약 카드) ===================== */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md bg-white text-black">
                <CardBody className="space-y-5">
                  <h2 className="text-xl font-bold">
                    딱 맞는 차,<span className="text-blue-600">평가사가</span> 찾아드려요
                  </h2>

                  {/* ✅ 차량 선택 (직접 입력 가능) */}
                  <Autocomplete
                    label="차량 선택"
                    placeholder="차량명을 입력하세요 (예: 아반떼)"
                    allowsCustomValue   // ✅ 직접 입력 허용
                    className="w-full"
                  >
                    {carList.map((car) => (
                      <AutocompleteItem key={car.key}>
                        {car.label}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {/* ✅ 차량 선택 (직접 입력 가능) */}
                  <Autocomplete
                    label="가격 입력"
                    placeholder="가격을 입력하세요"
                    allowsCustomValue   // ✅ 직접 입력 허용
                    className="w-full"
                  >
                    {priceList.map((price) => (
                      <AutocompleteItem key={price.key}>
                        {price.label}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {/* ✅ 경매장 선택 */}
                  <div>
                    <p className="mb-3 text-sm font-semibold text-gray-900">
                      경매장 선택
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {["Kcar 옥션(수)", "현대글로비스(금)"].map((d) => (
                        <button
                          key={d}
                          className="
                            rounded-lg border border-gray-300
                            bg-white
                            py-3 px-3
                            text-sm font-semibold text-gray-800
                            shadow-sm
                            transition
                            hover:border-black hover:bg-black hover:text-white
                            focus:outline-none focus:ring-2 focus:ring-black
                          "
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    className="mt-4"
                    color="primary"
                    size="lg"
                    radius="lg"
                    fullWidth
                  >
                    평가사 호출하기
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <CarLiveShortsRow />
      {/* ✅ Hero 아래 일반 섹션 (서비스 카드/지역 선택) */}
      <ServiceSection />

    </main>
  );
}
