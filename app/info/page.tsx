// app/how-it-works/page.tsx
"use client";

import Link from "next/link";

const steps = [
  {
    id: 1,
    label: "경매 매물 조회",
    title: "원하는 차량이 실제 경매장에 있는지 확인",
    desc: "차명, 연식, 주행거리, 예산을 입력하면 경매장에 올라온 실매물을 찾아드립니다.",
    badge: "입력 1분",
  },
  {
    id: 2,
    label: "라이브 진단 예약",
    title: "평가사와 시간만 맞추면 바로 진단 시작",
    desc: "경매장·날짜·시간을 선택하면 현장 평가사가 고객님 대신 차량 앞에 서 있습니다.",
    badge: "당일·익일 가능",
  },
  {
    id: 3,
    label: "라이브 커머스형 진단",
    title: "영상으로 차량隙 하나까지 같이 본다",
    desc: "외판, 하부, 엔진룸, 도막 측정까지 실시간 영상으로 공유하고, 채팅으로 궁금한 점을 바로 물어보세요.",
    badge: "실시간 스트리밍",
  },
  {
    id: 4,
    label: "AI + 평가사 리포트",
    title: "영상 기반 AI 분석과 전문가 총평 제공",
    desc: "촬영된 영상을 AI가 프레임 단위로 분석하고, 평가사의 의견과 합쳐서 한 눈에 보이는 리포트를 만들어 드립니다.",
    badge: "자동 리포트",
  },
  {
    id: 5,
    label: "구매·포기 결정",
    title: "살지 말지, 얼마에 살지까지 명확하게",
    desc: "추천/비추천, 예상 수리비, 적정 입찰가까지 제안해 드려 안전하게 결정을 돕습니다.",
    badge: "의사결정 지원",
  },
];

const reasons = [
  {
    title: "사진이 아니라 “영상 + AI 데이터”로 판단",
    desc: "정지 사진 몇 장이 아니라, 전체 진단 영상을 기반으로 AI가 외판·하부·소음·누유 패턴을 분석합니다.",
  },
  {
    title: "경매장 실매물 기반이라 허위매물이 없다",
    desc: "경매사가 제공하는 엑셀 데이터를 기반으로만 매물을 보여주기 때문에, 허위·뻥옵션 걱정을 줄였습니다.",
  },
  {
    title: "평가사 한 명이 끝까지 책임지는 구조",
    desc: "처음 예약부터 리포트 설명, 추가 질문까지 한 명의 평가사가 끝까지 책임지고 안내합니다.",
  },
];

const faqs = [
  {
    q: "영상은 실시간이 아니라 나중에 다시 볼 수 있나요?",
    a: "네. 라이브로 보시지 못해도, 진단이 끝난 후 고객 전용 링크로 다시 보기와 리포트를 함께 보내드립니다.",
  },
  {
    q: "AI가 차량 상태를 어떻게 본다는 건가요?",
    a: "촬영된 영상에서 패널 라인, 도막 두께 표시, 누유 흔적, 녹·부식, 연기·소음 패턴 등을 학습된 모델이 점수화하여 평가사의 판정에 참고 지표로 제공합니다.",
  },
  {
    q: "구매까지 대행도 해주나요?",
    a: "네. 원하시면 경매 입찰부터 낙찰 후 탁송·등록까지 연계 서비스로 진행해 드립니다. 이용 전 상담을 통해 범위를 정하게 됩니다.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="w-full bg-slate-50">
      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              새로운 중고차 진단 방식 · LIVE + AI
            </p>
            <h1 className="text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
              “경매장에 있는 차,
              <br className="hidden md:block" /> 영상으로 같이 보고
              AI까지 확인하세요.”
            </h1>
            <p className="text-sm text-gray-600 md:text-base">
              고객님은 집이나 회사에서,
              <br className="md:hidden" />
              평가사는 경매장 현장에서,
              <br className="hidden md:block" />
              라이브 커머스처럼 차량 상태를 보여주고 AI가 분석까지 도와주는
              진단 플랫폼입니다.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/request"
                className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
              >
                바로 진단 예약하기
              </Link>
              <a
                href="#steps"
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:border-gray-900"
              >
                이용방법 먼저 보기
              </a>
            </div>

            <p className="pt-2 text-xs text-gray-400">
              ※ 현재 서비스 가능 경매장: 오산 Kcar, 시흥 현대글로비스, 인천
              일대 (순차 확장 중)
            </p>
          </div>

          {/* 오른쪽 요약 카드 */}
          <div className="flex-1">
            <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-slate-900 p-5 text-white shadow-sm">
              <p className="text-xs font-semibold text-emerald-300">
                한눈에 보는 이용 요약
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>1. 원하는 차량 조건을 입력해서 경매장 실매물 조회</li>
                <li>2. 평가사 라이브 진단 시간 선택</li>
                <li>3. 영상 보면서 외판·하부·엔진·도막까지 체크</li>
                <li>4. AI + 평가사 리포트 수령</li>
                <li>5. 구매 / 포기 / 가격 협의까지 의사결정</li>
              </ul>
              <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-100">
                “사진 몇 장 보고 찍는 도박이 아니라, <br />
                데이터를 보고 결정하는 중고차 구매 경험을 만듭니다.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
          이용방법, 이렇게 진행돼요
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          복잡한 jargon 대신, 고객 입장에서 한 단계씩 안내드립니다.
        </p>

        <ol className="mt-8 space-y-6">
          {steps.map((step) => (
            <li
              key={step.id}
              className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 md:flex md:items-start"
            >
              <div className="mr-4 flex shrink-0 items-center gap-2 md:flex-col md:items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  {step.id}
                </div>
                <span className="mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 md:mt-2">
                  {step.badge}
                </span>
              </div>
              <div className="mt-3 md:mt-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {step.label}
                </p>
                <h3 className="mt-1 text-sm font-bold text-gray-900 md:text-base">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Why different */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
            기존 동행·사진 진단과 뭐가 다른가요?
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            우리 플랫폼의 핵심 차별점을 세 가지로 정리했습니다.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-2xl border border-gray-100 bg-slate-50 p-5"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
          자주 묻는 질문
        </h2>

        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-100 bg-white p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {faq.q}
                </span>
                <span className="text-xs text-gray-400 group-open:hidden">
                  열기
                </span>
                <span className="hidden text-xs text-gray-400 group-open:inline">
                  닫기
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-slate-100">
          <div>
            <p className="font-semibold">그래도 궁금한 게 남아있나요?</p>
            <p className="text-xs text-slate-300">
              채팅이나 카카오 채널로 차량 링크를 보내주시면, 사람이 직접
              답해드립니다.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
          >
            상담 채널 열기
          </Link>
        </div>
      </section>
    </main>
  );
}
