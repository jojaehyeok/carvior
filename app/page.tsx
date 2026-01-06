"use client";

import AddressSelector from "@/components/booking/AddressSelector";
import CarLiveShortsRow from "@/components/CarLiveShorts/CarLiveShorts";
import DateSelector from "@/components/booking/DateSelector";
import ServiceSection from "@/components/home/ServiceSection";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const carList = [
  { key: "avante", label: "아반떼" },
  { key: "sonata", label: "쏘나타" },
  { key: "santafe", label: "싼타페" },
  { key: "k5", label: "K5" },
  { key: "spark", label: "스파크" },
];

export default function Home() {
  const router = useRouter();
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [address, setAddress] = useState<{ main: string; detail: string }>({ main: '', detail: '' });
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>({ date: '', time: '' });
  
  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('bookingData');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.carModel) setSelectedCar(data.carModel);
      if (data.address) setAddress(data.address);
      if (data.date && data.time) setDateTime({ date: data.date, time: data.time });
    }
  }, []);

  const handleCarSelect = (key: string) => {
    const car = carList.find(c => c.key === key);
    if (car) {
      setSelectedCar(car.label);
      localStorage.setItem('bookingData', JSON.stringify({
        carModel: car.label,
        ...(address.main && { address }),
        ...(dateTime.date && { date: dateTime.date, time: dateTime.time })
      }));
    }
  };

  const handleAddressSelect = (main: string, detail: string) => {
    setAddress({ main, detail });
    localStorage.setItem('bookingData', JSON.stringify({
      carModel: selectedCar,
      address: { main, detail },
      ...(dateTime.date && { date: dateTime.date, time: dateTime.time })
    }));
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setDateTime({ date, time });
    localStorage.setItem('bookingData', JSON.stringify({
      carModel: selectedCar,
      address,
      date,
      time
    }));
  };

  const handleSubmit = () => {
    // 필수 데이터 확인
    if (!selectedCar || !address.main || !dateTime.date || !dateTime.time) {
      alert('모든 정보를 입력해주세요!');
      return;
    }

    // 데이터 저장
    const bookingData = {
      carModel: selectedCar,
      address,
      date: dateTime.date,
      time: dateTime.time,
      timestamp: new Date().toISOString(),
      bookingId: `BK${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    };

    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // 평가사 선택 페이지로 이동
    router.push('/evaluators');
  };

  const isFormComplete = selectedCar && address.main && dateTime.date && dateTime.time;

  return (
    <main className="w-full">
      {/* ✅ 풀스크린 Hero 섹션 */}
      <section className="relative min-h-[90vh] w-screen -mx-[calc(50vw-50%)] bg-black text-white overflow-hidden pt-16">
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
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                "중고차 차량구매",
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
                    "전문 평가사님이 사고·수리 이력부터 현재 상태까지
                    <br />
                    하나하나 짚어주셔서
                    <span className="text-emerald-500 font-semibold">
                      {" "}마음 편하게 계약까지 진행했어요.
                    </span>
                    "
                  </p>
                  <p className="text-sm text-gray-500">
                    쉐보래 스파크 · 이*연님
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

                  {/* 차량 선택 */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      차량 선택
                    </label>
                    <Autocomplete
                      placeholder="차량명을 입력하세요 (예: 아반떼)"
                      allowsCustomValue
                      className="w-full"
                      selectedKey={carList.find(c => c.label === selectedCar)?.key || ''}
                      onSelectionChange={(key) => handleCarSelect(key as string)}
                    >
                      {carList.map((car) => (
                        <AutocompleteItem key={car.key}>
                          {car.label}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>

                  {/* 주소 선택 */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      평가장소
                    </label>
                    <AddressSelector 
                      onAddressSelect={handleAddressSelect}
                      initialAddress={address.main}
                      initialDetail={address.detail}
                    />
                  </div>

                  {/* 날짜/시간 선택 */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      평가일시
                    </label>
                    <DateSelector 
                      onDateTimeSelect={handleDateTimeSelect}
                      initialDate={dateTime.date}
                      initialTime={dateTime.time}
                    />
                  </div>

                  {/* 선택 정보 요약 */}
                  {(selectedCar || address.main || dateTime.date) && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">입력된 정보</p>
                      <div className="space-y-1 text-sm text-gray-700">
                        {selectedCar && <p>차량: {selectedCar}</p>}
                        {address.main && <p>장소: {address.main}</p>}
                        {dateTime.date && (
                          <p>
                            일시: {new Date(dateTime.date).toLocaleDateString('ko-KR')}{' '}
                            {dateTime.time ? `${parseInt(dateTime.time)}시` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA 버튼 */}
                  <Button
                    className="mt-4"
                    color="primary"
                    size="lg"
                    radius="lg"
                    onClick={handleSubmit}
                    fullWidth
                    isDisabled={!isFormComplete}
                  >
                    {isFormComplete ? '평가사 선택하기' : '모든 정보를 입력해주세요'}
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <CarLiveShortsRow />
      <ServiceSection />
    </main>
  );
}