"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function CarePolicyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white px-6 pt-20 pb-16">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">카비어 안심케어 서비스 이용약관</h1>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-3">제1조 (서비스의 정의)</h2>
            <p>
              카비어 안심케어 서비스(이하 &ldquo;본 서비스&rdquo;)란, 카비어 소속 또는 카비어에 등록된
              진단평가사가 수행한 차량 검수 결과에 대해 진단평가사의 과실(오검수 또는 검수 누락)이
              객관적으로 확인되는 경우, 본 약관에서 정한 조건과 범위 내에서 검수 비용 환불 또는 차량
              수리(또는 수리비 일부)를 지원하는 사후 보상 서비스를 의미합니다.
            </p>
            <p className="mt-3">
              본 서비스는 상법 및 보험업법상 보험 계약에 해당하지 않으며, 향후 발생할 수 있는 차량의
              고장이나 결함을 사전에 보장하는 서비스가 아닙니다. 또한 본 서비스는 업계 평균 대비 현저히
              낮은 검수 비용(구매동행 기준 국산차 110,000원 / 수입차 140,000원)을 기반으로 제공되는
              부가 서비스로서, 정비 보증 상품이나 보험 상품과 동일한 수준의 보장을 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">제2조 (서비스 접수 요건)</h2>
            <ol className="list-decimal ml-5 space-y-2">
              <li>본 서비스는 검수 완료일로부터 14일 이내에 카비어 고객센터를 통해 접수된 건에 한하여 적용됩니다.</li>
              <li>접수는 최초 1회에 한하여 가능하며, 최초 접수 이후 추가로 발생하거나 주장되는 사항은 서비스 대상에서 제외됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">제3조 (적용 가능 차량)</h2>
            <p className="mb-2">다음 각 호의 요건을 모두 충족하는 차량에 한하여 본 서비스가 적용됩니다.</p>
            <ol className="list-decimal ml-5 space-y-2">
              <li>카비어 검수 신청자와 동일 명의로 차량 명의 이전이 완료된 차량</li>
              <li>검수일 기준 차량 연식 7년 미만</li>
              <li>검수 당시 누적 주행거리 120,000km 미만</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">제4조 (적용 제외 차량)</h2>
            <p className="mb-2">다음 각 호 중 어느 하나에 해당하는 경우 본 서비스는 적용되지 않습니다.</p>
            <ol className="list-decimal ml-5 space-y-2">
              <li>제조사 무상 보증 대상 차량</li>
              <li>중고차 성능·상태 점검 성능보험 적용 가능 차량</li>
              <li>카비어 분류기준 슈퍼카 또는 고성능 디비전 차량</li>
              <li>신차 및 기존 소유자가 인수를 목적으로 한 렌트 또는 리스차량</li>
              <li>서킷 주행 또는 특수 목적용 차량</li>
              <li>중고차 매매 또는 수출 목적의 매입 차량</li>
              <li>불법 개조 및 튜닝된 차량(딜러 고지 의무)</li>
            </ol>
          </section>

          <section className="bg-amber-50 p-5 rounded-xl border border-amber-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">제5조 (진단평가사 과실 인정 요건)</h2>
            <p className="mb-2">진단평가사 과실은 다음 요건을 모두 충족하는 경우에 한하여 인정됩니다.</p>
            <ol className="list-decimal ml-5 space-y-2">
              <li>해당 하자가 검수 당시에도 존재하였음이 객관적으로 확인될 것</li>
              <li>카비어 진단평가사가 제공한 검수 리포트에 포함된 항목일 것</li>
              <li>정비소 또는 서비스 센터의 직인이 포함된 소견서 또는 견적서가 제출될 것</li>
              <li>제출된 견적이 카비어가 지정한 등록 정비사 또는 정비소를 통해 적정하다고 판단될 것</li>
            </ol>
            <p className="mt-3 font-semibold text-amber-700">
              5. 카비어 진단평가사는 리프트(차량 승강 장비)를 사용하지 않고 방문 현장에서 육안 및
              휴대용 장비로 접근 가능한 범위 내에서만 검수를 진행합니다. 따라서 차량을 리프트로 들어
              올리거나 하부를 전체 분해하지 않으면 확인할 수 없는 사항은 검수 당시 발견이 원천적으로
              불가능한 항목으로 보아 진단평가사 과실 판단 대상에서 제외합니다.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              ※ 위 판단은 카비어의 내부 기준에 따라 최종 결정됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">제6조 (서비스 대상 범위)</h2>
            <p className="mb-3">
              본 서비스는 카비어 검수 리포트에 명시된 항목 중 다음 각 호에 한하여 적용됩니다.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-800 mb-1">1. 프레임</h3>
                <p className="text-gray-600">
                  프론트 패널, 대시 패널, 패키지 트레이, 휠 하우스, A/B/C필러, 크로스 멤버, 사이드
                  멤버, 인사이드 패널, 리어 패널, 플로어 패널, 트렁크 플로어
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-1">2. 외부 상태</h3>
                <p className="text-gray-600 mb-2">
                  프론트 펜더, 쿼터 패널, 엔진 후드, 라디에이터 서포트, 루프 패널, 사이드실 패널, 도어,
                  사이드 스커트, 사이드 미러, 전면 유리, 후면 유리, 도어 유리, 선루프, 헤드 램프, 포그
                  램프, 리어 램프, 사이드 리피터, 프런트 범퍼, 리어 범퍼, 스포일러, 트렁크 리드,
                  라디에이터 그릴
                </p>
                <p className="text-gray-600 mb-1">
                  유리의 경우 검수 중 진단평가사 누락 확인 시 크랙은 교환, 스톤칩은 복원으로 진행됩니다.
                </p>
                <ul className="list-disc ml-5 text-xs text-gray-500 space-y-1">
                  <li>유리 복원의 경우 최대 60% 복원 가능합니다.</li>
                  <li>중고차 특성상 미세 스크래치 및 미세 스톤칩은 대상에서 제외됩니다.</li>
                  <li>외판이 아닌 부품의 탈부착으로 인해 발생한 단차 차이는 대상에서 제외됩니다.</li>
                  <li>중고차 특성상 외부 스톤칩, 미세 스크래치, 휠 기스는 보상 대상이 아닙니다.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-1">3. 내부&기능</h3>
                <p className="text-gray-600 mb-2">
                  도어, 시트, 실내 천장, 대시보드, 글로브 박스, 콘솔박스, 센터페시아, 트렁크 내장재,
                  도어 기능, 시트 기능(통풍, 열선), 등화 장치, 블로우 모터, 와이퍼 모터, 윈도우 모터 등
                  카비어 리포트에 명시된 항목
                </p>
                <ul className="list-disc ml-5 text-xs text-gray-500 space-y-1">
                  <li>주행 및 주차와 관련된 기능은 대상에서 제외됩니다.</li>
                  <li>리포트에 명시된 항목만 보상 대상으로 인정됩니다.</li>
                  <li>
                    BMW &ldquo;제스처 컨트롤&rdquo;, 메르세데스-벤츠 &ldquo;MBUX 제스처 컨트롤&rdquo;,
                    현대&기아 &ldquo;제스처 인식&rdquo; 등 운전자 모션을 통한 컨트롤 시스템은 대상에서
                    제외됩니다.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-1">4. 엔진&파워트레인</h3>
                <p className="text-gray-600 mb-2">
                  로커암 커버 누유, 실린더 헤드(가스켓) 누유 및 누수, 오일팬 누유, 워터 펌프 및 라디에이터
                  누수, 각종 호스 등의 찢어짐으로 인한 누유/누수
                </p>
                <ul className="list-disc ml-5 text-xs text-gray-500 space-y-1">
                  <li>누유가 아닌 오일 슬러지 등 실제 누유, 누수가 아닌 고장은 서비스 대상이 아닙니다.</li>
                  <li>하부 커버 탈거, 내시경을 활용해야 확인 가능한 부품은 대상이 아닙니다.</li>
                  <li>검수 당시 사진 자료(카비어 리포트)로 서비스 대상 여부를 판단합니다.</li>
                  <li>엔진 이상 소음, 실내 냄새, 변속 충격과 같은 주관적인 항목은 제외됩니다.</li>
                  <li>전기 차량의 고전압 배터리는 카비어 검수 대상 부품이 아니므로 서비스 적용이 불가능합니다.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-1">5. 하부</h3>
                <p className="text-gray-600 mb-2">
                  언더커버(검수 당시 언더커버가 없는 차량은 제외), 쇽업소버, 스프링, 스테빌라이저, 로어암,
                  어퍼암, 각종 부싱류, 타이로드 엔드&볼 조인트
                </p>
                <p className="font-semibold text-amber-700 text-xs">
                  ※ 카비어 진단평가사는 리프트를 사용하지 않고 방문 현장에서 육안으로 확인 가능한 누유 및
                  누수만 대상으로 인정하며, 열거되지 않은 부품 및 육안 확인이 불가능한 항목은 서비스
                  대상에서 제외됩니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">제7조 (보상 제외 사항)</h2>
            <p className="mb-2">다음 각 호에 해당하는 경우, 서비스 기간 내 접수라 하더라도 보상 대상에서 제외됩니다.</p>
            <ol className="list-decimal ml-5 space-y-2">
              <li>친환경 차량의 배터리 및 전력 구동 장치</li>
              <li>출고 당시 순정이 아닌 추가 장착 제품</li>
              <li>교통비, 운휴 손실비, 유류비 등 간접 비용</li>
              <li>사고, 천재지변 또는 수리 이후 발생한 고장</li>
              <li>중고차 특성상 발생하는 경미한 외관 손상(스크래치, 스톤칩, 휠기스)</li>
              <li>중복 또는 이중 보상에 해당하는 경우</li>
              <li>소모품(패드류, 필터류, 타이어, 오일류, 라이닝, 와이퍼, 고무 몰딩)</li>
              <li>리프트 승강 또는 차량 하부 전체 분해 없이는 검수 당시 발견이 불가능했던 항목</li>
            </ol>
          </section>

          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">제8조 (보상 범위 및 한도)</h2>
            <ol className="list-decimal ml-5 space-y-2">
              <li>보상은 검수 비용 환불 또는 수리 비용 지원 중 하나에 한하여 제공되며, 중복 적용되지 않습니다.</li>
              <li>보상 수리 시 카비어는 수리 정비소를 지정할 수 있습니다.</li>
              <li>
                보상 한도는 <b>최대 500,000원</b>으로 하며, 현금성 보상은 카비어가 확인한 적정 견적의
                최대 80% 범위 내에서 지급됩니다.
              </li>
              <li>보상 한도를 초과하는 금액은 고객 부담으로 합니다.</li>
              <li>
                보상 수리 시 사용 부품은 신차 출고에 장착되는 제품과 유사 수준의 대체 부품(규격품, 재생품,
                중고품) 사용을 우선으로 합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">제9조 (처리 방식 및 동의)</h2>
            <ol className="list-decimal ml-5 space-y-2">
              <li>수리비는 고객에게 직접 지급되지 않으며, 카비어가 지정한 정비소를 통해 처리됩니다.</li>
              <li>고객은 보상 접수 시 본 조에서 정한 처리 방식에 동의한 것으로 간주합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">제10조 (약관 변경)</h2>
            <p>
              본 약관은 회사의 정책 변경에 따라 개정될 수 있으며, 이미 접수되어 진행 중인 건에 대해서는
              변경된 약관을 소급 적용하지 않습니다.
            </p>
          </section>

          {/* 하단 푸터 */}
          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">부칙 : 본 약관은 2026년 7월 29일부터 적용됩니다.</p>
            <p className="text-sm text-gray-400 font-medium">상호명: 카비어 (Cavior)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
