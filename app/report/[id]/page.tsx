"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LightGallery from "lightgallery/react";
import lgZoom from "lightgallery/plugins/zoom";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";

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

const SYMBOL_MAP: Record<string, { label: string; color: string }> = {
  X: { label: "교환", color: "bg-red-100 text-red-700 border-red-300" },
  W: { label: "판금/도장", color: "bg-orange-100 text-orange-700 border-orange-300" },
  M: { label: "탈부착/조정", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  A: { label: "흠집", color: "bg-blue-100 text-blue-700 border-blue-300" },
  U: { label: "요철", color: "bg-purple-100 text-purple-700 border-purple-300" },
  T: { label: "깨짐", color: "bg-gray-100 text-gray-700 border-gray-300" },
  C: { label: "부식", color: "bg-green-100 text-green-700 border-green-300" },
  P: { label: "도장필요", color: "bg-pink-100 text-pink-700 border-pink-300" },
};

const IMAGE_CATEGORIES: { key: keyof ReportData["images"]; label: string; icon: string }[] = [
  { key: "exterior", label: "외관", icon: "🚗" },
  { key: "interior", label: "실내", icon: "💺" },
  { key: "wheel", label: "휠", icon: "🛞" },
  { key: "engine", label: "엔진", icon: "⚙️" },
  { key: "undercarriage", label: "하부", icon: "🔩" },
  { key: "dashboard", label: "계기판", icon: "🖥️" },
  { key: "registration", label: "등록증", icon: "📄" },
  { key: "vin", label: "차대번호", icon: "🔢" },
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

// ─── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function PublicReportPage() {
  const { id } = useParams();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    car_status.keys.smart +
    car_status.keys.folding +
    car_status.keys.general +
    car_status.keys.special;

  // 손상 있는 부위만 필터링
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

        {/* 타이어 잔존량 */}
        <div className="mt-4 bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-3">타이어 잔존량</p>
          <div className="grid grid-cols-2 gap-4">
            <TireGauge value={car_status.tireTread.front} label="앞 타이어" />
            <TireGauge value={car_status.tireTread.back} label="뒤 타이어" />
          </div>
        </div>

        {/* 휠 스크래치 */}
        {car_status.wheelScratch > 0 && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-yellow-500">⚠️</span>
            <p className="text-sm text-yellow-800">휠 스크래치 {car_status.wheelScratch}개</p>
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
            { label: "누유 상태", value: evaluation.leakDesc, icon: "💧" },
            { label: "주행 상태", value: evaluation.driveDesc, icon: "🏁" },
            { label: "옵션 상태", value: evaluation.optionsDesc, icon: "🔧" },
            { label: "경고등", value: evaluation.warningDesc, icon: "⚡" },
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

      {/* 손상 내역 */}
      {damagedParts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🔍</span> 손상 내역
            <span className="text-xs font-normal text-gray-400">({damagedParts.length}개 부위)</span>
          </h2>
          <div className="space-y-2">
            {damagedParts.map((part) => (
              <div key={part.name} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm text-gray-700 flex-1">{part.name}</p>
                <div className="flex gap-1 flex-wrap justify-end">
                  {part.symbols.map((sym) => {
                    const info = SYMBOL_MAP[sym];
                    return (
                      <span
                        key={sym}
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          info ? info.color : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {info ? info.label : sym}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 범례 */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">범례</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SYMBOL_MAP).map(([sym, { label, color }]) => (
                <span key={sym} className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>
                  {sym} · {label}
                </span>
              ))}
            </div>
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
    </div>
  );
}
