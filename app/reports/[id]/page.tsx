'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// 🚀 LightGallery 필수 임포트
import LightGallery from "lightgallery/react";
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgFullscreen from "lightgallery/plugins/fullscreen";

// 🚀 LightGallery 스타일 (Global CSS에 넣어도 되지만 여기서 직접 호출이 확실합니다)
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";

// 카테고리 한글 변환 맵
const CATEGORY_MAP: { [key: string]: string } = {
  dashboard: "계기판 및 주행거리",
  registration: "자동차 등록증",
  exterior: "외관 상태",
  wheel: "휠 및 타이어",
  undercarriage: "하부 점검",
  interior: "실내 및 옵션",
  engine: "엔진룸 상태"
};

export default function CaviorVehicleReport() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      // 주소에 /api가 붙어있는지 꼭 확인하세요! (형님 설정에 맞춰 /api 추가함)
      const res = await fetch(`http://localhost:4000/api/v1/external/inspection/report/${id}`);
      
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error("리포트 데이터를 가져오지 못했습니다.");
      }
    } catch (err) {
      console.error("네트워크 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <div className="w-10 h-10 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-zinc-500 tracking-tight">카비어 진단 데이터 분석 중...</p>
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center text-gray-400 font-medium">
      진단 내역이 존재하지 않습니다. <br/> (ID: {id})
    </div>
  );

  const { car_info, evaluation, images } = data;

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen pb-20 shadow-2xl border-x border-zinc-100">
      {/* 럭셔리 블랙 헤더 */}
      <header className="bg-zinc-950 p-12 text-white text-center">
        <div className="inline-block border border-blue-500/40 px-5 py-1.5 rounded-full text-[10px] tracking-[0.5em] mb-8 font-semibold text-blue-400 animate-pulse">
          CAVIOR CERTIFIED
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4 italic">{car_info.number}</h1>
        <div className="flex justify-center items-center gap-4 text-zinc-400 text-sm font-medium">
          <span>{car_info.type}</span>
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          <span>{car_info.mileage?.toLocaleString()} km</span>
        </div>
      </header>

      <main className="px-6 py-12 space-y-16">
        {/* 1. 핵심 진단 요약 */}
        <section className="space-y-8">
          <div className="flex items-end justify-between border-b-2 border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Diagnostic Summary</h3>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">Step 01</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "사고/판금", value: evaluation.accidentDesc, icon: "🛡️" },
              { label: "엔진/누유", value: evaluation.leakDesc, icon: "💧" },
              { label: "타이어상태", value: evaluation.tireDesc, icon: "🛞" },
              { label: "튜닝여부", value: evaluation.tuningDesc, icon: "⚙️" },
              { label: "계기판상태", value: evaluation.warningDesc, icon: "⚠️" },
            ].map((item, idx) => item.value && (
              <div key={idx} className="group flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100 transition-all hover:scale-[1.02] hover:bg-white hover:shadow-xl hover:border-blue-100">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-2xl group-hover:bg-blue-50 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">{item.label}</span>
                </div>
                <span className="text-base font-black text-zinc-800">{item.value}</span>
              </div>
            ))}
          </div>

          {/* 특이사항(Notice/Merit) */}
          {(evaluation.notice || evaluation.merit) && (
            <div className="mt-6 p-8 bg-zinc-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14.725c0-5.141 3.892-10.519 10-10.519l-0.716 4.429c-3.001 0-5.284 2.355-5.284 5.565h6v9.8h-10v-9.275zm-13 0c0-5.141 3.892-10.519 10-10.519l-0.715 4.429c-3.001 0-5.285 2.355-5.285 5.565h6v9.8h-10v-9.275z"/></svg>
              </div>
              {evaluation.merit && (
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Vehicle Merit</p>
                  <p className="text-lg text-zinc-100 leading-snug font-bold">"{evaluation.merit}"</p>
                </div>
              )}
              {evaluation.notice && (
                <div className="pt-5 border-t border-zinc-800 relative z-10">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Technical Notice</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{evaluation.notice}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 2. 사진 갤러리 (LightGallery 적용) */}
        <section className="space-y-10">
          <div className="flex items-end justify-between border-b-2 border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Photo Gallery</h3>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">Step 02</span>
          </div>
          
          <div className="space-y-14">
            {Object.keys(images || {}).map((category) => (
              images[category] && images[category].length > 0 && (
                <div key={category} className="group">
                  <div className="flex items-center gap-3 mb-5 ml-1 transition-transform group-hover:translate-x-1">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <p className="text-sm font-black text-zinc-900 tracking-tight">
                      {CATEGORY_MAP[category] || category}
                    </p>
                    <span className="text-zinc-300 text-xs font-bold font-mono">[{images[category].length}]</span>
                  </div>
                  
                  {/* 🚀 LightGallery 컴포넌트 시작 */}
                  <LightGallery 
                    plugins={[lgZoom, lgThumbnail, lgFullscreen]} 
                    speed={500} 
                    elementClassNames="grid grid-cols-2 gap-3"
                    mode="lg-fade"
                    download={false} // 다운로드 버튼 비활성화 (보안)
                  >
                    {images[category].map((url: string, i: number) => (
                      <a 
                        key={i} 
                        href={url} 
                        className="group relative block overflow-hidden rounded-[2rem] aspect-[4/3] bg-zinc-100 border-2 border-transparent hover:border-blue-500 transition-all shadow-sm"
                      >
                        <img 
                          src={url} 
                          alt={`${category}-${i}`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        {/* 이미지 호버 시 오버레이 */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-xs font-bold px-4 py-2 border border-white/50 rounded-full backdrop-blur-sm">확대 보기</span>
                        </div>
                      </a>
                    ))}
                  </LightGallery>
                </div>
              )
            ))}
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-zinc-950 py-20 text-center border-t border-zinc-800">
        <p className="text-blue-500 text-[10px] font-black tracking-[0.8em] uppercase mb-4">Certified by Cavior</p>
        <p className="text-zinc-500 text-[10px] px-10 leading-relaxed font-medium">
          본 진단 결과는 전문 진단사에 의해 검수 시점의 상태를 기준으로 작성되었습니다. <br/>
          무단 복제 및 전재를 금하며, 차량 상태는 운행 조건에 따라 변동될 수 있습니다.
        </p>
        <div className="mt-10 opacity-20 flex justify-center italic font-black text-white text-4xl tracking-tighter">
          CAVIOR
        </div>
      </footer>
    </div>
  );
}