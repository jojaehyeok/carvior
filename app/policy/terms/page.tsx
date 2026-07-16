"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">온라인 자동차 매매정보제공 이용약관</h1>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <p>
              카비어(Carvior)는 「자동차관리법」 제65조의2(온라인 자동차 매매정보제공의 등록)에 따라
              등록된 온라인 자동차 매매정보제공자입니다. 진단이 완료된 차량의 매매정보(사진, 주행거리,
              이력정보, 매입희망가격 등)는 관련 법령에 따라 <b>등록된 자동차매매업자(딜러)</b>에게만
              제공되며, 일반 이용자에게는 제공되지 않습니다.
            </p>
          </section>

          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <a
              href={encodeURI("/Carvior_온라인자동차매매정보제공_이용약관.pdf")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-blue-600 font-semibold"
            >
              <span>전체 이용약관 전문 보기 (PDF)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H8M17 7V16" />
              </svg>
            </a>
          </section>

          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">상호명: 카비어 (Carvior)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
