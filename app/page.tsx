"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

import AddressSelector from "@/components/booking/AddressSelector";
import DateSelector from "@/components/booking/DateSelector";
import CarLiveShortsRow from "@/components/CarLiveShorts/CarLiveShorts";
import ServiceSection from "@/components/home/ServiceSection";

import { bookingStore } from "@/app/lib/booking-store";
import { BookingDraft } from "@/types/booking";
import AppFooter from "@/components/footermodal";

const carList = [
  { key: "avante", label: "아반떼" },
  { key: "sonata", label: "쏘나타" },
  { key: "santafe", label: "싼타페" },
  { key: "k5", label: "K5" },
  { key: "spark", label: "스파크" },
];

export default function Home() {
  const router = useRouter();

  const [carModel, setCarModel] = useState("");
  const [address, setAddress] = useState({ main: "", detail: "" });
  const [schedule, setSchedule] = useState({ date: "", time: "" });

  /** 🔄 Draft 복원 */
  useEffect(() => {
    bookingStore.load();
    const draft = bookingStore.get() as BookingDraft;

    if (draft?.car?.model) setCarModel(draft.car.model);
    if (draft?.address) setAddress(draft.address);
    if (draft?.schedule) setSchedule(draft.schedule);
  }, []);

  const isFormComplete =
    carModel && address.main && schedule.date && schedule.time;

  /** ▶ 다음 단계 */
  const handleNext = () => {
    if (!isFormComplete) {
      alert("모든 정보를 입력해주세요");
      return;
    }

    bookingStore.update({
      car: { model: carModel },
      address,
      schedule,
    });

    router.push("/evaluators");
  };

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="relative min-h-[90vh] w-screen -mx-[calc(50vw-50%)] bg-black text-white pt-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/jindanimage.png"
            alt="hero"
            className="object-contain max-w-full max-h-full"
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6">
          <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
            {/* 좌측 */}
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                "중고차 차량구매,
                <br />
                정말 괜찮은 걸까?"
              </h1>

              <p className="mt-4 text-xl font-semibold text-emerald-400">
                베테랑 <span className="underline">평가사</span>가 직접 알려드릴게요.
              </p>

              <Card className="max-w-xl mt-8 text-black bg-white">
                <CardBody className="space-y-3">
                  <p className="text-lg font-medium">
                    “사고·수리 이력부터 현재 상태까지
                    <br />
                    꼼꼼히 설명해줘서
                    <span className="font-semibold text-emerald-500">
                      {" "}안심하고 계약했어요.”
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    쉐보레 스파크 · 이*연님
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* 우측 */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md text-black bg-white">
                <CardBody className="space-y-5">
                  <h2 className="text-xl font-bold">
                    딱 맞는 차,
                    <span className="text-blue-600"> 평가사가</span> 찾아드려요
                  </h2>

                  {/* 차량 */}
                  <Autocomplete
                    label="차량 선택"
                    placeholder="차량명을 입력하세요"
                    allowsCustomValue
                    selectedKey={
                      carList.find(c => c.label === carModel)?.key
                    }
                    onSelectionChange={(key) => {
                      const car = carList.find(c => c.key === key);
                      if (car) setCarModel(car.label);
                    }}
                  >
                    {carList.map(car => (
                      <AutocompleteItem key={car.key}>
                        {car.label}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {/* 주소 */}
                  <AddressSelector
                    initialAddress={address.main}
                    initialDetail={address.detail}
                    onAddressSelect={(main, detail) =>
                      setAddress({ main, detail })
                    }
                  />

                  {/* 일정 */}
                  <DateSelector
                    initialDate={schedule.date}
                    initialTime={schedule.time}
                    onDateTimeSelect={(date, time) =>
                      setSchedule({ date, time })
                    }
                  />

                  {/* 요약 */}
                  {isFormComplete && (
                    <div className="p-3 text-sm border rounded-lg bg-gray-50">
                      <p>차량: {carModel}</p>
                      <p>장소: {address.main}</p>
                      <p>
                        일시:{" "}
                        {new Date(schedule.date).toLocaleDateString("ko-KR")}{" "}
                        {schedule.time}시
                      </p>
                    </div>
                  )}

                  <Button
                    color="primary"
                    size="lg"
                    fullWidth
                    isDisabled={!isFormComplete}
                    onClick={handleNext}
                  >
                    평가사 선택하기
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <CarLiveShortsRow />
      <ServiceSection />
      <AppFooter/>
    </main>

    
  );
}
