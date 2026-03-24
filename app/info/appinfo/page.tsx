"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 🌟 Next.js 최적화 이미지 컴포넌트 사용
import AppFooter from "@/components/footermodal"; // 🌟 아까 만든 푸터를 가져옵니다.

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* 1. 히어로 섹션 (첫 인상) */}
      <header className="relative h-[650px] flex items-center justify-center overflow-hidden">
        {/* 히어로 배경 이미지 (Unsplash 예시, 원하시면 public 이미지로 교체 가능) */}
        <Image 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000" 
          alt="Main Background"
          fill
          priority
          className="absolute inset-0 object-cover brightness-[0.3]"
        />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-block px-5 py-2 mb-8 border border-blue-600 rounded-full bg-blue-600/10 backdrop-blur-sm">
            <span className="text-blue-200 text-sm font-bold tracking-widest uppercase">Premium Vehicle Inspection</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
            CARVIOR
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 font-light leading-relaxed max-w-3xl mx-auto">
            국가공인 진단사가 제안하는 <br className="md:hidden" /> 
            가장 완벽한 중고차 검수 솔루션
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button 
              onClick={() => router.push('/payment')}
              className="bg-blue-600 text-white px-14 py-5 rounded-2xl text-xl font-bold hover:bg-blue-700 transition-all shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
            >
              진단 서비스 예약하기
            </button>
          </div>
        </div>
      </header>

      {/* 2. 현장 진단 프로세스 (보내주신 사진 기반, 상단 자름 처리) */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-black text-gray-900 mb-5 leading-tight tracking-tight">현장 중심의 정밀 진단</h2>
            <p className="text-gray-600 text-xl leading-relaxed">카비어의 전문 진단사는 타협하지 않는 꼼꼼함으로 현장을 지킵니다.</p>
          </div>
          <div className="hidden md:block">
            <span className="text-7xl font-black text-gray-100 italic tracking-tighter">PROCESS</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* 특징 1: 정밀 스캔 */}
          <div className="group space-y-8">
            {/* 🌟 이미지 상단 자름 처리: aspect-ratio와 object-cover/object-bottom 활용 */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gray-100 shadow-2xl border border-gray-100">
              <Image 
                src="/images/inspection_photo.jpg" // 🌟 public/images/inspection_scan.jpg 파일로 교체
                alt="Scanner Inspection" 
                fill
                className="object-cover object-bottom group-hover:scale-105 transition-transform duration-700 ease-in-out" // object-bottom으로 하단 강조 (상단 자동 자름)
              />
            </div>
            <div className="space-y-3 px-2">
              <span className="inline-block text-blue-600 font-bold text-sm tracking-widest uppercase border-b-2 border-blue-100 pb-1">Step 01</span>
              <h3 className="text-3xl font-bold text-gray-950 tracking-tight">첨단 장비 정밀 진단</h3>
              <p className="text-gray-700 leading-relaxed text-base">육안으로 확인하기 힘든 전자 제어 시스템의 오류와 고장 코드를 전용 스캐너로 완벽하게 찾아냅니다.</p>
            </div>
          </div>

          {/* 특징 2: 실시간 사진 및 리포트 */}
          <div className="group space-y-8 md:mt-16">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gray-100 shadow-2xl border border-gray-100">
              <Image 
                src="/images/inspection_scan.jpg" // 🌟 public/images/inspection_photo.jpg 파일로 교체
                alt="Real-time Report" 
                fill
                className="object-cover object-bottom group-hover:scale-105 transition-transform duration-700 ease-in-out" // object-bottom으로 하단 강조 (상단 자동 자름)
              />
            </div>
            <div className="space-y-3 px-2">
              <span className="inline-block text-blue-600 font-bold text-sm tracking-widest uppercase border-b-2 border-blue-100 pb-1">Step 02</span>
              <h3 className="text-3xl font-bold text-gray-950 tracking-tight">투명한 실시간 리포트</h3>
              <p className="text-gray-700 leading-relaxed text-base">검수 현장의 모든 사진과 진단 결과는 실시간으로 클라우드에 업로드되어 고객님께 즉시 보고됩니다.</p>
            </div>
          </div>

          {/* 특징 3: 전문가의 노하우 */}
          <div className="group space-y-8 md:mt-32">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gray-100 shadow-2xl border border-gray-100">
              <Image 
                src="/images/inspection_professional.jpg" // 🌟 public/images/inspection_professional.jpg 파일로 교체
                alt="Professional Inspector" 
                fill
                className="object-cover object-bottom group-hover:scale-105 transition-transform duration-700 ease-in-out" // object-bottom으로 하단 강조 (상단 자동 자름)
              />
            </div>
            <div className="space-y-3 px-2">
              <span className="inline-block text-blue-600 font-bold text-sm tracking-widest uppercase border-b-2 border-blue-100 pb-1">Step 03</span>
              <h3 className="text-3xl font-bold text-gray-950 tracking-tight">국가공인 전문가의 안목</h3>
              <p className="text-gray-700 leading-relaxed text-base">수천 대의 데이터를 경험한 베테랑 진단사만이 잡아낼 수 있는 미세한 이상 징후까지 놓치지 않습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA 섹션 (심사관이 결제로 넘어가게 유도) */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">지금 첫 검수를 예약하고 <br/>안심하고 구매하세요.</h2>
          <p className="text-blue-100 mb-14 text-xl font-light leading-relaxed max-w-2xl mx-auto">신규 회원 가입 시 20% 프로모션 할인이 즉시 적용됩니다.</p>
          <button 
            onClick={() => router.push('booking/payment')}
            className="bg-white text-blue-600 px-16 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:bg-gray-100 transition-colors hover:-translate-y-1 active:scale-[0.98]"
          >
            예약 페이지로 이동
          </button>
        </div>
      </section>

      {/* 4. 푸터 (아까 만든 AppFooter 컴포넌트) */}
      <AppFooter />
    </div>
  );
}