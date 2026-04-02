"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Code } from "@nextui-org/code";

export default function CodefTestPage() {
  const [formData, setFormData] = useState({
    carNumber: "",
    userId: "",
    userPassword: "",
    pointPassword: "",
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const testApi = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // 실제 구현 시에는 /api/car-history 경로의 Route Handler를 생성해야 합니다.
      const res = await fetch("/api/car-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "API 호출 중 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-2xl px-6 py-12 mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-start px-8 pt-8">
          <h1 className="text-2xl font-bold">CODEF 카히스토리 테스트</h1>
          <p className="text-sm text-gray-500">사고이력 조회 API 연동 확인용</p>
        </CardHeader>
        
        <Divider className="my-4" />

        <CardBody className="px-8 pb-8 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="차량번호"
              placeholder="예: 12가3456"
              variant="bordered"
              value={formData.carNumber}
              onValueChange={(v) => handleInputChange("carNumber", v)}
            />
            <Input
              label="카히스토리 아이디"
              placeholder="아이디를 입력하세요"
              variant="bordered"
              value={formData.userId}
              onValueChange={(v) => handleInputChange("userId", v)}
            />
            <Input
              type="password"
              label="카히스토리 비밀번호"
              placeholder="비밀번호를 입력하세요"
              variant="bordered"
              value={formData.userPassword}
              onValueChange={(v) => handleInputChange("userPassword", v)}
            />
            <Input
              type="password"
              label="포인트 결제 비밀번호"
              placeholder="결제 비밀번호를 입력하세요"
              variant="bordered"
              value={formData.pointPassword}
              onValueChange={(v) => handleInputChange("pointPassword", v)}
            />
          </div>

          <Button
            color="primary"
            size="lg"
            fullWidth
            className="mt-4 font-bold"
            isLoading={isLoading}
            onClick={testApi}
          >
            {isLoading ? "데이터 불러오는 중..." : "조회하기"}
          </Button>

          {result && (
            <div className="mt-8">
              <p className="mb-2 text-sm font-semibold text-gray-600">조회 결과</p>
              <Card className="border-none bg-zinc-900">
                <CardBody className="p-4">
                  <pre className="overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-emerald-400">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardBody>
              </Card>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mt-6 text-xs text-center text-gray-400">
        카비어(Carvior) 내부 개발 테스트용 페이지입니다.
      </div>
    </main>
  );
}