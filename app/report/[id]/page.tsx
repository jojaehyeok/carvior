"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LightGallery from "lightgallery/react";
import lgZoom from "lightgallery/plugins/zoom";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PdfTemplate from "./PdfTemplate";

// ─── 타입 ──────────────────────────────────────────────────────────────────────
interface ReportData {
  car_info: {
    number: string;
    type: string;
    mileage: number;
    color: string;
    repairCost: number;
  };
  evaluation: {
    leakDesc: string;
    driveDesc: string;
    optionsDesc: string;
    warningDesc: string;
    memo: string;
  };
  car_status: {
    keys: { smart: number; folding: number; general: number; special: number };
    paintNeeded: number;
    wheelScratch: number;
    tireTread: { back: number; front: number };
  };
  damages: string[][];
  images: {
    wheel?: string[];
    engine?: string[];
    exterior?: string[];
    interior?: string[];
    undercarriage?: string[];
    dashboard?: string[];
    registration?: string[];
    vin?: string[];
  };
}

// ─── 상수 ──────────────────────────────────────────────────────────────────────
const PART_NAMES = [
  "운전석 앞휀더", "운전석 앞도어", "운전석 A필러", "운전석 사이드실 패널",
  "운전석 B필러", "운전석 뒷도어", "운전석 C필러", "운전석 쿼터패널",
  "후드", "루프패널", "트렁크 리드",
  "조수석 앞휀더", "조수석 A필러", "조수석 앞도어", "조수석 사이드실 패널",
  "조수석 B필러", "조수석 뒷도어", "조수석 C필러", "조수석 쿼터패널",
  "라디에이터 서포트", "프런트 패널",
  "운전석 인사이드 패널", "운전석 프런트 사이드멤버", "조수석 프런트 사이드멤버",
  "조수석 인사이드 패널", "운전석 프런트 휠하우스", "조수석 프런트 휠하우스",
  "크로스 멤버", "대쉬 패널", "플로어 패널", "패키지 트레이",
  "운전석 리어 휠하우스", "운전석 리어 사이드멤버", "트렁크 플로어 패널",
  "조수석 리어 사이드멤버", "조수석 리어 휠하우스", "리어 패널",
];

// 앱에서 가져온 원본 좌표 (SVG 원본 크기: 2109 x 4001)
const CHECK_POSITIONS = [
  { x: 311.83, y: 240.14 },
  { x: 260.03, y: 892.29 },
  { x: 509.3,  y: 762.29 },
  { x: 86.64,  y: 1111.77 },
  { x: 508.86, y: 1142.25 },
  { x: 260.03, y: 1333.65 },
  { x: 512.24, y: 1648.91 },
  { x: 374.88, y: 1910.12 },
  { x: 983.46, y: 458.1 },
  { x: 983.46, y: 1212.79 },
  { x: 983.46, y: 1816.54 },
  { x: 1667.97, y: 240.48 },
  { x: 1469.7,  y: 762.29 },
  { x: 1718.76, y: 892.63 },
  { x: 1892.36, y: 1111.77 },
  { x: 1470.94, y: 1142.58 },
  { x: 1718.76, y: 1333.98 },
  { x: 1466.56, y: 1648.24 },
  { x: 1604.92, y: 1910.45 },
  { x: 988.04,  y: 2101.36 },
  { x: 988.04,  y: 2241.4 },
  { x: 723.78,  y: 2411.14 },
  { x: 866.79,  y: 2488.66 },
  { x: 1099.87, y: 2488.4 },
  { x: 1244.45, y: 2411.14 },
  { x: 727.0,   y: 2622.66 },
  { x: 1237.35, y: 2622.66 },
  { x: 991.04,  y: 2784.37 },
  { x: 991.04,  y: 2922.09 },
  { x: 991.04,  y: 3153.39 },
  { x: 995.47,  y: 3403.48 },
  { x: 710.25,  y: 3552.65 },
  { x: 849.93,  y: 3590.53 },
  { x: 987.15,  y: 3590.53 },
  { x: 1124.26, y: 3590.53 },
  { x: 1264.94, y: 3550.65 },
  { x: 992.15,  y: 3764.23 },
];

const ORIGINAL_W = 2109;
const ORIGINAL_H = 4001;

const SYMBOL_STYLE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  X: { label: "교환",      bg: "rgba(239,68,68,0.25)",   text: "#dc2626", border: "#ef4444" },
  W: { label: "판금/도장", bg: "rgba(249,115,22,0.25)",  text: "#ea580c", border: "#f97316" },
  M: { label: "탈부착",    bg: "rgba(234,179,8,0.25)",   text: "#ca8a04", border: "#eab308" },
  A: { label: "흠집",      bg: "rgba(59,130,246,0.25)",  text: "#2563eb", border: "#3b82f6" },
  U: { label: "요철",      bg: "rgba(168,85,247,0.25)",  text: "#9333ea", border: "#a855f7" },
  T: { label: "깨짐",      bg: "rgba(107,114,128,0.25)", text: "#4b5563", border: "#6b7280" },
  C: { label: "부식",      bg: "rgba(34,197,94,0.25)",   text: "#16a34a", border: "#22c55e" },
  P: { label: "도장필요",  bg: "rgba(236,72,153,0.25)",  text: "#db2777", border: "#ec4899" },
  B: { label: "판금",      bg: "rgba(139,92,246,0.25)",  text: "#7c3aed", border: "#8b5cf6" },
};

const IMAGE_CATEGORIES: { key: keyof ReportData["images"]; label: string; icon: string }[] = [
  { key: "exterior",     label: "외관", icon: "🚗" },
  { key: "interior",     label: "실내", icon: "💺" },
  { key: "wheel",        label: "휠",   icon: "🛞" },
  { key: "engine",       label: "엔진", icon: "⚙️" },
  { key: "undercarriage",label: "하부", icon: "🔩" },
];

const DOC_IMAGES: { key: keyof ReportData["images"]; label: string }[] = [
  { key: "dashboard",   label: "계기판" },
  { key: "registration",label: "등록증" },
  { key: "vin",         label: "차대번호" },
];

// ─── 타이어 게이지 ──────────────────────────────────────────────────────────────
function TireGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 60 ? "bg-green-500" : value >= 30 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <p className="text-sm font-bold">{value}%</p>
    </div>
  );
}

// ─── 차량 손상 다이어그램 ────────────────────────────────────────────────────────
function DamageChecker({ damages }: { damages: string[][] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = width > 0 ? (ORIGINAL_H / ORIGINAL_W) * width : 0;
  const wRatio = width / ORIGINAL_W;
  const hRatio = height / ORIGINAL_H;
  // 박스 크기: 원본 130 단위 → 70으로 축소, 최소 12px
  const boxSize = Math.max(wRatio * 120, 12);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* SVG 배경 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/car-damage-bg.svg"
        alt="차량 도면"
        className="w-full h-auto block"
        draggable={false}
      />

      {/* 손상 마커: 박스 중앙을 좌표에 맞춤 */}
      {width > 0 && CHECK_POSITIONS.map((pos, i) => {
        const syms = damages[i] ?? [];
        if (syms.length === 0) return null;

        const sym = syms[0];
        const style = SYMBOL_STYLE[sym] ?? SYMBOL_STYLE["X"];
        // 좌표 = 박스 중심점, translate로 보정
        const left = wRatio * (pos.x + 60) - boxSize / 2;
        const top  = hRatio * (pos.y + 60) - boxSize / 2;

        return (
          <div
            key={i}
            title={`${PART_NAMES[i]}: ${syms.map(s => SYMBOL_STYLE[s]?.label ?? s).join(", ")}`}
            style={{
              position: "absolute",
              left,
              top,
              width:  boxSize,
              height: boxSize,
              backgroundColor: style.bg,
              border: `1.5px solid ${style.border}`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "default",
            }}
          >
            <span
              style={{
                color: style.text,
                fontWeight: "bold",
                fontSize: boxSize * 0.52,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {sym}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── 이미지 갤러리 섹션 ─────────────────────────────────────────────────────────
function ImageSection({ images, label, icon }: { images: string[]; label: string; icon: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div>
      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
        <span>{icon}</span>{label}
        <span className="text-xs text-gray-400 font-normal">({images.length}장)</span>
      </h3>
      <LightGallery plugins={[lgZoom]} speed={400} selector="a" elementClassNames="flex gap-3 flex-wrap">
        {images.map((url, i) => (
          <a key={i} href={url} data-src={url} className="block">
            <img
              src={url}
              alt={`${label} ${i + 1}`}
              className="w-[120px] h-[90px] object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
            />
          </a>
        ))}
      </LightGallery>
    </div>
  );
}

// ─── 등급 계산 ─────────────────────────────────────────────────────────────────
function calcGrade(data: ReportData) {
  const { evaluation, car_status, damages } = data;
  let score = 100;
  const isOk = (v: string) => !v || v === "이상 없음";
  if (!isOk(evaluation.leakDesc))    score -= 20;
  if (!isOk(evaluation.driveDesc))   score -= 20;
  if (!isOk(evaluation.optionsDesc)) score -= 10;
  if (!isOk(evaluation.warningDesc)) score -= 10;
  score -= Math.min(damages.filter(d => d.length > 0).length * 4, 30);
  const avgTire = (car_status.tireTread.front + car_status.tireTread.back) / 2;
  if (avgTire < 30) score -= 10;
  else if (avgTire < 50) score -= 5;
  if (score >= 85) return { grade:"A", color:"#16a34a", bg:"#dcfce7", desc:"상태 매우 양호" };
  if (score >= 70) return { grade:"B", color:"#2563eb", bg:"#dbeafe", desc:"상태 양호" };
  if (score >= 50) return { grade:"C", color:"#d97706", bg:"#fef3c7", desc:"일부 수리 필요" };
  return               { grade:"D", color:"#dc2626", bg:"#fee2e2", desc:"정비 권장" };
}

// ─── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function PublicReportPage() {
  const { id } = useParams();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!pdfRef.current || !data) return;
    setPdfLoading(true);
    try {
      // 1. 외부 이미지를 base64로 변환 (CORS 우회)
      const imgEls = pdfRef.current.querySelectorAll<HTMLImageElement>("img");
      await Promise.all(
        Array.from(imgEls).map(async (img) => {
          if (!img.src || img.src.startsWith("data:") || img.src.startsWith("/")) return;
          try {
            const res = await fetch(img.src);
            const blob = await res.blob();
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            img.src = dataUrl;
          } catch { /* 실패한 이미지는 스킵 */ }
        })
      );

      // 2. 각 .pdf-page를 순서대로 캡처
      const pages = pdfRef.current.querySelectorAll<HTMLElement>(".pdf-page");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pdfW, pdfH);
      }

      pdf.save(`카비어_안심리포트_${data.car_info.number}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetch(`https://carvior.store/api/v1/external/inspection/report/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">리포트를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2">
        <p className="text-2xl">😥</p>
        <p className="text-gray-600">리포트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { car_info, evaluation, car_status, damages, images } = data;
  const totalKeys =
    car_status.keys.smart + car_status.keys.folding +
    car_status.keys.general + car_status.keys.special;

  const damagedParts = damages
    .map((syms, i) => ({ name: PART_NAMES[i], symbols: syms }))
    .filter((p) => p.symbols.length > 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-16">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <span>🔍</span> 차량 진단 리포트
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{car_info.number}</h1>
        <p className="text-gray-500 mt-1">{car_info.type}</p>
      </div>

      {/* 차량 기본 정보 */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>🚗</span> 차량 기본 정보
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">주행거리</p>
            <p className="text-lg font-bold text-gray-800">
              {car_info.mileage.toLocaleString()} km
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">색상</p>
            <p className="text-lg font-bold text-gray-800">{car_info.color || "-"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">열쇠</p>
            <p className="text-lg font-bold text-gray-800">{totalKeys}개</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {car_status.keys.smart > 0 && `스마트키 ${car_status.keys.smart}`}
              {car_status.keys.general > 0 && ` / 일반 ${car_status.keys.general}`}
              {car_status.keys.folding > 0 && ` / 폴딩 ${car_status.keys.folding}`}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">외판 도색 필요</p>
            <p className="text-lg font-bold text-gray-800">{car_status.paintNeeded}개소</p>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-3">타이어 잔존량</p>
          <div className="grid grid-cols-2 gap-4">
            <TireGauge value={car_status.tireTread.front} label="앞 타이어" />
            <TireGauge value={car_status.tireTread.back}  label="뒤 타이어" />
          </div>
        </div>

        {car_status.wheelScratch > 0 && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-yellow-500">⚠️</span>
            <p className="text-sm text-yellow-800">휠 스크래치 {car_status.wheelScratch}개</p>
          </div>
        )}

        {/* 계기판 / 등록증 / 차대번호 */}
        {DOC_IMAGES.some((d) => images[d.key]?.length) && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">서류 및 계기판</p>
            <LightGallery plugins={[lgZoom]} speed={400} selector="a" elementClassNames="flex gap-3 flex-wrap">
              {DOC_IMAGES.flatMap((d) =>
                (images[d.key] ?? []).map((url, i) => (
                  <div key={`${d.key}-${i}`} className="flex flex-col items-center gap-1">
                    <a href={url} data-src={url} className="block">
                      <img
                        src={url}
                        alt={d.label}
                        className="w-[100px] h-[75px] object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                      />
                    </a>
                    <p className="text-xs text-gray-500">{d.label}</p>
                  </div>
                ))
              )}
            </LightGallery>
          </div>
        )}
      </div>

      {/* 진단 결과 */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📋</span> 진단 결과
        </h2>
        <div className="space-y-3">
          {[
            { label: "누유 상태", value: evaluation.leakDesc,    icon: "💧" },
            { label: "주행 상태", value: evaluation.driveDesc,   icon: "🏁" },
            { label: "옵션 상태", value: evaluation.optionsDesc, icon: "🔧" },
            { label: "경고등",    value: evaluation.warningDesc, icon: "⚡" },
          ].map((item) => {
            const isOk = item.value === "이상 없음" || !item.value;
            return (
              <div
                key={item.label}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  isOk ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className={`text-sm font-medium ${isOk ? "text-green-700" : "text-red-700"}`}>
                    {item.value || "이상 없음"}
                  </p>
                </div>
                <span className="text-lg">{isOk ? "✅" : "❌"}</span>
              </div>
            );
          })}

          {evaluation.memo && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">진단사 고지사항</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{evaluation.memo}</p>
            </div>
          )}
        </div>
      </div>

      {/* 손상 다이어그램 */}
      {damagedParts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <span>🔍</span> 손상 부위
            <span className="text-xs font-normal text-gray-400">({damagedParts.length}개 부위)</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">마커에 마우스를 올리면 부위명을 확인할 수 있어요</p>

          <DamageChecker damages={damages} />

          {/* 손상 목록 */}
          <div className="mt-4 space-y-1.5">
            {damagedParts.map((part) => (
              <div key={part.name} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                <p className="text-sm text-gray-700 flex-1">{part.name}</p>
                <div className="flex gap-1 flex-wrap justify-end">
                  {part.symbols.map((sym) => {
                    const s = SYMBOL_STYLE[sym];
                    return (
                      <span
                        key={sym}
                        className="text-xs px-2 py-0.5 rounded-full border font-medium"
                        style={s ? { backgroundColor: s.bg, color: s.text, borderColor: s.border } : {}}
                      >
                        {s ? s.label : sym}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이미지 갤러리 */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <span>📸</span> 차량 사진
        </h2>
        <div className="space-y-6">
          {IMAGE_CATEGORIES.map((cat) => (
            <ImageSection
              key={cat.key}
              images={images[cat.key] || []}
              label={cat.label}
              icon={cat.icon}
            />
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div className="text-center text-xs text-gray-400 mt-8">
        <p>본 리포트는 진단 시점 기준으로 작성되었습니다.</p>
        <p className="mt-1">© Carvior · 차량 진단 서비스</p>
      </div>

      {/* PDF 다운로드 플로팅 버튼 */}
      <button
        onClick={downloadPDF}
        disabled={pdfLoading}
        className="fixed bottom-6 right-5 flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg transition-colors z-50"
      >
        {pdfLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            생성 중...
          </>
        ) : (
          <>⬇️ PDF 다운로드</>
        )}
      </button>

      {/* 숨겨진 PDF 전용 템플릿 (캡처용) */}
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}>
        <div ref={pdfRef}>
          <PdfTemplate data={data} grade={calcGrade(data)} />
        </div>
      </div>
    </div>
  );
}
