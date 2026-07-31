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
  bookingId?: number;
  dealerName?: string | null;
  driverName?: string | null;
  assignedDriverId?: string | null;
  isConsumerBooking?: boolean;
  car_info: {
    number: string;
    type: string;
    owner?: string | null;
    mileage: number;
    color: string;
    repairCost: number;
  };
  evaluation: {
    leakDesc: string;
    driveDesc: string;
    optionsDesc: string;
    warningDesc: string;
    engineDesc: string;
    memo: string;
  };
  // 번역 전 원문(한국어) 기준 이상유무 — 리포트 언어를 바꿔도 정상/이상 배지 색상이
  // 깨지지 않도록 문자열 비교("이상 없음") 대신 이 값을 우선 사용한다.
  evaluationOk?: {
    leak: boolean;
    drive: boolean;
    options: boolean;
    warning: boolean;
    engine: boolean;
  };
  checklistPhotos?: {
    warning?: string[];
    options?: string[];
    leak?: string[];
    drive?: string[];
    engine?: string[];
  };
  // (구) 엔진 소음 확인용 단일 영상 — videoUrls로 대체됨, 과거 리포트 호환용
  engineNoiseVideoUrl?: string | null;
  // 엔진 이음/조향 이음/옵션작동 이상 등 평가사가 촬영한 영상 여러 개
  videoUrls?: string[];
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
    damage?: string[];
    extra?: string[];
    extraMemo?: string[];
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

// ─── 다국어(딜러 의뢰 리포트 전용 — 구매동행 리포트에는 노출 안 함) ──────────────────
// 고정 텍스트(라벨/부위명/범례)는 무료 API 호출 없이 직접 번역해서 여기 박아둔다.
// 평가사가 입력하는 자유 텍스트(메모 등)만 백엔드가 Azure Translator로 번역해서 내려줌.
type Lang = "ko" | "en" | "ru" | "ar";

const LANG_TABS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "ru", label: "RU" },
];

const PART_NAMES_EN = [
  "Driver Front Fender", "Driver Front Door", "Driver A-Pillar", "Driver Sill Panel",
  "Driver B-Pillar", "Driver Rear Door", "Driver C-Pillar", "Driver Quarter Panel",
  "Hood", "Roof Panel", "Trunk Lid",
  "Passenger Front Fender", "Passenger A-Pillar", "Passenger Front Door", "Passenger Sill Panel",
  "Passenger B-Pillar", "Passenger Rear Door", "Passenger C-Pillar", "Passenger Quarter Panel",
  "Radiator Support", "Front Panel",
  "Driver Inner Panel", "Driver Front Side Member", "Passenger Front Side Member",
  "Passenger Inner Panel", "Driver Front Wheel House", "Passenger Front Wheel House",
  "Cross Member", "Dash Panel", "Floor Panel", "Package Tray",
  "Driver Rear Wheel House", "Driver Rear Side Member", "Trunk Floor Panel",
  "Passenger Rear Side Member", "Passenger Rear Wheel House", "Rear Panel",
];

const PART_NAMES_RU = [
  "Переднее крыло (водитель)", "Передняя дверь (водитель)", "Стойка A (водитель)", "Порог (водитель)",
  "Стойка B (водитель)", "Задняя дверь (водитель)", "Стойка C (водитель)", "Заднее крыло (водитель)",
  "Капот", "Крыша", "Крышка багажника",
  "Переднее крыло (пассажир)", "Стойка A (пассажир)", "Передняя дверь (пассажир)", "Порог (пассажир)",
  "Стойка B (пассажир)", "Задняя дверь (пассажир)", "Стойка C (пассажир)", "Заднее крыло (пассажир)",
  "Опора радиатора", "Передняя панель",
  "Внутренняя панель (водитель)", "Передний лонжерон (водитель)", "Передний лонжерон (пассажир)",
  "Внутренняя панель (пассажир)", "Переднее колёсная арка (водитель)", "Переднее колёсная арка (пассажир)",
  "Поперечина", "Панель приборов", "Пол кузова", "Полка за задним сиденьем",
  "Заднее колёсная арка (водитель)", "Задний лонжерон (водитель)", "Пол багажника",
  "Задний лонжерон (пассажир)", "Заднее колёсная арка (пассажир)", "Задняя панель",
];

const PART_NAMES_AR = [
  "الرفرف الأمامي (السائق)", "الباب الأمامي (السائق)", "عمود A (السائق)", "لوحة العتبة (السائق)",
  "عمود B (السائق)", "الباب الخلفي (السائق)", "عمود C (السائق)", "اللوحة الجانبية الخلفية (السائق)",
  "غطاء المحرك", "لوحة السقف", "غطاء صندوق الأمتعة",
  "الرفرف الأمامي (الراكب)", "عمود A (الراكب)", "الباب الأمامي (الراكب)", "لوحة العتبة (الراكب)",
  "عمود B (الراكب)", "الباب الخلفي (الراكب)", "عمود C (الراكب)", "اللوحة الجانبية الخلفية (الراكب)",
  "دعامة الرادياتير", "اللوحة الأمامية",
  "اللوحة الداخلية (السائق)", "العارضة الجانبية الأمامية (السائق)", "العارضة الجانبية الأمامية (الراكب)",
  "اللوحة الداخلية (الراكب)", "قوس العجلة الأمامي (السائق)", "قوس العجلة الأمامي (الراكب)",
  "العارضة العرضية", "لوحة التابلوه", "لوحة الأرضية", "رف خلفي",
  "قوس العجلة الخلفي (السائق)", "العارضة الجانبية الخلفية (السائق)", "أرضية الصندوق",
  "العارضة الجانبية الخلفية (الراكب)", "قوس العجلة الخلفي (الراكب)", "اللوحة الخلفية",
];

function partName(i: number, lang: Lang): string {
  const arr = lang === "en" ? PART_NAMES_EN : lang === "ru" ? PART_NAMES_RU : lang === "ar" ? PART_NAMES_AR : PART_NAMES;
  return arr[i] ?? PART_NAMES[i];
}

const SYMBOL_LABEL_I18N: Record<string, Record<Lang, string>> = {
  X: { ko: "교환", en: "Replaced", ru: "Замена", ar: "استبدال" },
  W: { ko: "판금/용접", en: "Bodywork/Weld", ru: "Кузовной ремонт/сварка", ar: "أعمال هيكل/لحام" },
  M: { ko: "탈부착", en: "Removed/Reinstalled", ru: "Демонтаж/монтаж", ar: "فك وتركيب" },
  A: { ko: "흠집", en: "Scratch", ru: "Царапина", ar: "خدش" },
  U: { ko: "요철", en: "Dent", ru: "Вмятина", ar: "انبعاج" },
  T: { ko: "깨짐", en: "Crack", ru: "Трещина", ar: "تشقق" },
  C: { ko: "부식", en: "Corrosion", ru: "Коррозия", ar: "صدأ" },
  P: { ko: "도장필요", en: "Paint Needed", ru: "Требуется покраска", ar: "يحتاج طلاء" },
  B: { ko: "판금/용접", en: "Bodywork/Weld", ru: "Кузовной ремонт/сварка", ar: "أعمال هيكل/لحام" },
};

const STR = {
  reportBadge: { ko: "차량 진단 리포트", en: "Vehicle Inspection Report", ru: "Отчет о результатах диагностики автомобиля", ar: "تقرير فحص السيارة" },
  loading: { ko: "리포트를 불러오는 중...", en: "Loading report...", ru: "Загрузка отчета...", ar: "جارٍ تحميل التقرير..." },
  notFound: { ko: "리포트를 찾을 수 없습니다.", en: "Report not found.", ru: "Отчет не найден.", ar: "التقرير غير موجود." },
  dealer: { ko: "딜러", en: "Dealer", ru: "Дилер", ar: "الوكيل" },
  inspector: { ko: "담당 진단평가사", en: "Inspector", ru: "Инспектор", ar: "الفاحص" },
  vehicleInfo: { ko: "차량 기본 정보", en: "Vehicle Information", ru: "Основная информация", ar: "معلومات السيارة" },
  mileage: { ko: "주행거리", en: "Mileage", ru: "Пробег", ar: "المسافة المقطوعة" },
  keys: { ko: "열쇠", en: "Keys", ru: "Ключи", ar: "المفاتيح" },
  smartKey: { ko: "스마트키", en: "Smart", ru: "Смарт", ar: "ذكي" },
  generalKey: { ko: "일반", en: "Standard", ru: "Обычный", ar: "عادي" },
  foldingKey: { ko: "폴딩", en: "Folding", ru: "Складной", ar: "قابل للطي" },
  paintNeeded: { ko: "외판 도색 필요", en: "Paint Needed", ru: "Требуется покраска", ar: "يحتاج الطلاء" },
  wheelScratch: { ko: "휠 스크래치", en: "Wheel Scratches", ru: "Царапины на дисках", ar: "خدوش الجنوط" },
  tireTread: { ko: "타이어 잔존량", en: "Tire Tread Remaining", ru: "Остаток протектора шин", ar: "نسبة العمق المتبقي للإطارات" },
  frontTire: { ko: "앞 타이어", en: "Front Tires", ru: "Передние шины", ar: "الإطارات الأمامية" },
  rearTire: { ko: "뒤 타이어", en: "Rear Tires", ru: "Задние шины", ar: "الإطارات الخلفية" },
  docs: { ko: "서류 및 계기판", en: "Documents & Odometer", ru: "Документы и приборная панель", ar: "المستندات وعداد المسافات" },
  resultTitle: { ko: "진단 결과", en: "Inspection Results", ru: "Результаты диагностики", ar: "نتائج الفحص" },
  leak: { ko: "누유 상태", en: "Leak Status", ru: "Состояние утечек", ar: "حالة التسريب" },
  options: { ko: "옵션 상태", en: "Options Status", ru: "Состояние опций", ar: "حالة الخيارات" },
  warning: { ko: "경고등", en: "Warning Lights", ru: "Индикаторы приборной панели", ar: "أضواء التحذير" },
  engine: { ko: "이상 확인 영상", en: "Issue Check Videos", ru: "Видео проверки неисправностей", ar: "مقاطع فيديو فحص الأعطال" },
  noIssue: { ko: "이상 없음", en: "No Issues", ru: "Без замечаний", ar: "لا توجد مشاكل" },
  inspectorNote: { ko: "진단사 고지사항", en: "Inspector's Notes", ru: "Примечания инспектора", ar: "ملاحظات الفاحص" },
  damageArea: { ko: "손상 부위", en: "Damaged Areas", ru: "Поврежденные зоны", ar: "مناطق التلف" },
  partsSuffix: { ko: "개 부위", en: "parts", ru: "зон.", ar: "أجزاء" },
  noAccidentBadge: { ko: "무사고 차량", en: "No Accident History", ru: "Без ДТП", ar: "لا يوجد حوادث" },
  hoverHint: { ko: "마커에 마우스를 올리면 부위명을 확인할 수 있어요", en: "Hover over a marker to see the part name", ru: "Наведите курсор на маркер, чтобы увидеть название детали", ar: "مرر المؤشر فوق العلامة لرؤية اسم الجزء" },
  noAccidentCard: { ko: "무사고 차량이예요 🎉", en: "No accident history 🎉", ru: "Без ДТП 🎉", ar: "لا يوجد حوادث 🎉" },
  photosTitle: { ko: "차량 사진", en: "Vehicle Photos", ru: "Фотографии автомобиля", ar: "صور السيارة" },
  footerNote: { ko: "본 리포트는 진단 시점 기준으로 작성되었습니다.", en: "This report reflects the vehicle's condition at the time of inspection.", ru: "Этот отчет составлен на момент диагностики.", ar: "يعكس هذا التقرير حالة السيارة وقت الفحص." },
  footerBrand: { ko: "© Carvior · 차량 진단 서비스", en: "© Carvior · Vehicle Inspection Service", ru: "© Carvior · Служба диагностики автомобилей", ar: "© Carvior · خدمة فحص السيارات" },
  pdfDownload: { ko: "PDF 다운로드", en: "Download PDF", ru: "Скачать PDF", ar: "تحميل PDF" },
  generating: { ko: "생성 중...", en: "Generating...", ru: "Формирование...", ar: "جارٍ الإنشاء..." },
  copyLink: { ko: "링크 복사", en: "Copy Link", ru: "Копировать ссылку", ar: "نسخ الرابط" },
  linkCopied: { ko: "복사됨", en: "Copied", ru: "Скопировано", ar: "تم النسخ" },
  photoZip: { ko: "사진 전체 다운로드", en: "Download All Photos", ru: "Скачать все фото", ar: "تحميل جميع الصور" },
  photoAlt: { ko: "사진", en: "Photo", ru: "Фото", ar: "صورة" },
} as const;

function t(key: keyof typeof STR, lang: Lang): string {
  return STR[key][lang];
}

const IMAGE_CATEGORY_I18N: Record<string, Record<Lang, string>> = {
  exterior:      { ko: "외관", en: "Exterior", ru: "Экстерьер", ar: "الهيكل الخارجي" },
  wheel:         { ko: "휠&트레드", en: "Wheels & Tread", ru: "Колёса и протектор", ar: "العجلات ونقش الإطار" },
  interior:      { ko: "실내", en: "Interior", ru: "Салон", ar: "المقصورة الداخلية" },
  extra:         { ko: "옵션", en: "Options", ru: "Опции", ar: "الخيارات" },
  engine:        { ko: "엔진룸", en: "Engine Bay", ru: "Моторный отсек", ar: "حجرة المحرك" },
  undercarriage: { ko: "하부 & 누유", en: "Undercarriage & Leaks", ru: "Днище и утечки", ar: "الهيكل السفلي والتسريبات" },
  damage:        { ko: "내외판 데미지", en: "Body & Panel Damage", ru: "Повреждения кузова", ar: "أضرار الهيكل" },
  extraMemo:     { ko: "기타사진", en: "Other Photos", ru: "Другие фото", ar: "صور أخرى" },
};

const DOC_IMAGE_I18N: Record<string, Record<Lang, string>> = {
  dashboard: { ko: "계기판", en: "Odometer", ru: "Приборная панель", ar: "عداد المسافات" },
  vin:       { ko: "보험이력", en: "Insurance History", ru: "История страхования", ar: "سجل التأمين" },
};

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
  X: { label: "교환",      bg: "#ef4444", text: "#ffffff", border: "#ef4444" },
  W: { label: "판금/용접", bg: "#3b82f6", text: "#ffffff", border: "#3b82f6" },
  M: { label: "탈부착",    bg: "#eab308", text: "#ffffff", border: "#eab308" },
  A: { label: "흠집",      bg: "#3b82f6", text: "#ffffff", border: "#3b82f6" },
  U: { label: "요철",      bg: "#a855f7", text: "#ffffff", border: "#a855f7" },
  T: { label: "깨짐",      bg: "#6b7280", text: "#ffffff", border: "#6b7280" },
  C: { label: "부식",      bg: "#22c55e", text: "#ffffff", border: "#22c55e" },
  P: { label: "도장필요",  bg: "#ec4899", text: "#ffffff", border: "#ec4899" },
  // B(판금)는 위 damages 정규화 단계에서 이미 W로 합쳐져서 여기까진 안 들어오지만,
  // 방어적으로 남겨둠(다른 값이 섞여 들어와도 라벨은 항상 동일하게)
  B: { label: "판금/용접", bg: "#3b82f6", text: "#ffffff", border: "#3b82f6" },
};

const IMAGE_CATEGORIES: { key: keyof ReportData["images"]; label: string; icon: string }[] = [
  { key: "exterior",     label: "외관",      icon: "🚗" },
  { key: "wheel",        label: "휠&트레드",   icon: "🛞" },
  { key: "interior",     label: "실내",      icon: "💺" },
  { key: "extra",        label: "옵션",      icon: "🔧" },
  { key: "engine",       label: "엔진룸",     icon: "⚙️" },
  { key: "undercarriage",label: "하부 & 누유", icon: "🔩" },
  { key: "damage",       label: "내외판 데미지", icon: "🔨" },
  { key: "extraMemo",    label: "기타사진",   icon: "📷" },
];

const DOC_IMAGES: { key: keyof ReportData["images"]; label: string }[] = [
  { key: "dashboard", label: "계기판" },
  { key: "vin",       label: "보험이력" },
  // registration(자동차등록증)은 개인정보 보호를 위해 사이트에 절대 표시하지 않음
];

// ─── 타이어 게이지 ──────────────────────────────────────────────────────────────
function TireGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 60 ? "bg-green-500" : value >= 30 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <p className="text-sm font-bold">{value}%</p>
    </div>
  );
}

// ─── 차량 손상 다이어그램 ────────────────────────────────────────────────────────
function DamageChecker({ damages, lang }: { damages: string[][]; lang: Lang }) {
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
        className="block w-full h-auto"
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
            title={`${partName(i, lang)}: ${syms.map(s => SYMBOL_LABEL_I18N[s]?.[lang] ?? SYMBOL_STYLE[s]?.label ?? s).join(", ")}`}
            style={{
              position: "absolute",
              left,
              top,
              width:  boxSize,
              height: boxSize,
              backgroundColor: style.bg,
              border: `1.5px solid ${style.border}`,
              borderRadius: boxSize / 2,
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
function ImageSection({ images, label, icon, lang }: { images: string[]; label: string; icon: string; lang: Lang }) {
  if (!images || images.length === 0) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 mb-3 text-base font-semibold">
        <span>{icon}</span>{label}
        <span className="text-xs font-normal text-gray-400">({images.length}{lang === "ko" ? "장" : ""})</span>
      </h3>
      <LightGallery plugins={[lgZoom]} speed={400} selector="a" controls={false} elementClassNames="grid grid-cols-4 gap-1">
        {images.map((url, i) => (
          <a key={i} href={encodeURI(url)} data-src={encodeURI(url)} className="block aspect-square overflow-hidden rounded-md">
            <img
              src={encodeURI(url)}
              alt={`${label} ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
            />
          </a>
        ))}
      </LightGallery>
    </div>
  );
}

// ─── 등급 계산 ─────────────────────────────────────────────────────────────────
function calcGrade(data: ReportData) {
  const { evaluation, car_status, damages, evaluationOk } = data;
  let score = 100;
  // evaluationOk는 번역 전 원문(한국어) 기준으로 백엔드가 판단해둔 값 — 리포트 언어를
  // 바꿔도(en/ru/ar) 채점이 깨지지 않도록 문자열 비교 대신 이 값을 우선 사용한다.
  const isOk = (v: string, key: keyof NonNullable<ReportData["evaluationOk"]>) =>
    evaluationOk ? evaluationOk[key] : (!v || v === "이상 없음");
  if (!isOk(evaluation.leakDesc, "leak"))       score -= 20;
  if (!isOk(evaluation.driveDesc, "drive"))     score -= 20;
  if (!isOk(evaluation.optionsDesc, "options")) score -= 10;
  if (!isOk(evaluation.warningDesc, "warning")) score -= 10;
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  // 딜러 의뢰 리포트(수출용 차량 등)에서만 노출되는 언어 전환 — 구매동행 리포트는 항상 ko
  const [lang, setLang] = useState<Lang>("ko");

  const downloadPDF = () => {
    if (!data || pdfLoading) return;
    setPdfLoading(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // 클립보드 권한이 없는 브라우저 대비 폴백
      window.prompt("아래 링크를 복사하세요", window.location.href);
      return;
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  // pdfLoading=true → PdfTemplate 마운트 → useEffect 실행 순서 보장
  useEffect(() => {
    if (!pdfLoading || !pdfRef.current || !data) return;

    const run = async () => {
      try {
        // 1. 외부 이미지를 base64로 변환 (CORS 우회)
        const imgEls = pdfRef.current!.querySelectorAll<HTMLImageElement>("img");
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
            } catch {}
          })
        );

        // 2. 각 .pdf-page를 순서대로 캡처
        const pages = pdfRef.current!.querySelectorAll<HTMLElement>(".pdf-page");
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

    run();
  }, [pdfLoading, data]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const url = `https://carvior.store/api/v1/external/inspection/report/by-hash/${id}${lang !== "ko" ? `?lang=${lang}` : ""}`;
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch((err) => { if (err.name !== "AbortError") setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id, lang]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">{t("loading", lang)}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <p className="text-2xl">😥</p>
        <p className="text-gray-600">{t("notFound", lang)}</p>
      </div>
    );
  }

  const { dealerName, driverName, car_info, evaluation, car_status, damages: rawDamages, images, checklistPhotos, isConsumerBooking, evaluationOk, engineNoiseVideoUrl, videoUrls } = data;
  const allIssueVideos = [...(videoUrls ?? []), ...(engineNoiseVideoUrl ? [engineNoiseVideoUrl] : [])];
  // 딜러가 B(판금)와 W(용접)를 구분하기 어려워해서, 평가사 앱 입력은 그대로 두고
  // 리포트 표시에서만 B를 W로 합쳐서 보여준다(라벨도 "판금/용접"으로 통합)
  const damages = rawDamages.map((syms) => syms.map((s) => (s === "B" ? "W" : s)));
  const totalKeys =
    car_status.keys.smart + car_status.keys.folding +
    car_status.keys.general + car_status.keys.special;

  const damagedParts = damages
    .map((syms, i) => ({ name: partName(i, lang), symbols: syms }))
    .filter((p) => p.symbols.length > 0);

  return (
    <div className="max-w-2xl px-4 py-8 pb-16 mx-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* 언어 전환 — 딜러 의뢰 리포트(수출용 차량 등)에서만 노출, 구매동행 리포트는 항상 한국어 */}
      {!isConsumerBooking && (
        <div className="flex justify-center mb-6" dir="ltr">
          <div className="inline-flex gap-1 p-1 bg-gray-900 rounded-full">
            {LANG_TABS.map((tab) => (
              <button
                key={tab.code}
                onClick={() => setLang(tab.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  lang === tab.code ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <span>🔍</span> {t("reportBadge", lang)}
        </div>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {car_info.type && car_info.type !== "알수없음" && car_info.type !== "미정" ? `${car_info.type} ${car_info.number}` : car_info.number}
        </h1>
        {dealerName && <p className="mt-1 text-sm text-gray-400">{t("dealer", lang)}: {dealerName}</p>}
        {driverName && <p className="mt-1 text-sm text-gray-400">{t("inspector", lang)}: {driverName}</p>}
      </div>

      {/* 차량 기본 정보 */}
      <div className="p-5 mb-5 bg-white border shadow-sm rounded-2xl">
        <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-800">
          <span>🚗</span> {t("vehicleInfo", lang)}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="mb-1 text-xs text-gray-400">{t("mileage", lang)}</p>
            <p className="text-lg font-bold text-gray-800">
              {car_info.mileage.toLocaleString()} km
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="mb-1 text-xs text-gray-400">{t("keys", lang)}</p>
            <p className="text-lg font-bold text-gray-800">{totalKeys}{lang === "ko" ? "개" : ""}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {car_status.keys.smart > 0 && `${t("smartKey", lang)} ${car_status.keys.smart}`}
              {car_status.keys.general > 0 && ` / ${t("generalKey", lang)} ${car_status.keys.general}`}
              {car_status.keys.folding > 0 && ` / ${t("foldingKey", lang)} ${car_status.keys.folding}`}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="mb-1 text-xs text-gray-400">{t("paintNeeded", lang)}</p>
            <p className="text-lg font-bold text-gray-800">{car_status.paintNeeded}{lang === "ko" ? "개소" : ""}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="mb-1 text-xs text-gray-400">{t("wheelScratch", lang)}</p>
            <p className="text-lg font-bold text-gray-800">{car_status.wheelScratch}{lang === "ko" ? "짝" : ""}</p>
          </div>
        </div>

        <div className="p-4 mt-4 bg-gray-50 rounded-xl">
          <p className="mb-3 text-xs text-gray-400">{t("tireTread", lang)}</p>
          <div className="grid grid-cols-2 gap-4">
            <TireGauge value={car_status.tireTread.front} label={t("frontTire", lang)} />
            <TireGauge value={car_status.tireTread.back}  label={t("rearTire", lang)} />
          </div>
        </div>

        {/* 계기판 / 등록증 / 보험이력 */}
        {DOC_IMAGES.some((d) => images[d.key]?.length) && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-gray-400">{t("docs", lang)}</p>
            <LightGallery plugins={[lgZoom]} speed={400} selector="a" controls={false} elementClassNames="flex gap-3 flex-wrap">
              {DOC_IMAGES.flatMap((d) =>
                (images[d.key] ?? []).map((url, i) => (
                  <div key={`${d.key}-${i}`} className="flex flex-col items-center gap-1">
                    <a href={url} data-src={url} className="block">
                      <img
                        src={url}
                        alt={DOC_IMAGE_I18N[d.key]?.[lang] ?? d.label}
                        loading="lazy"
                        decoding="async"
                        className="w-[100px] h-[75px] object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                      />
                    </a>
                    <p className="text-xs text-gray-500">{DOC_IMAGE_I18N[d.key]?.[lang] ?? d.label}</p>
                  </div>
                ))
              )}
            </LightGallery>
          </div>
        )}
      </div>

      {/* 진단 결과 */}
      <div className="p-5 mb-5 bg-white border shadow-sm rounded-2xl">
        <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-800">
          <span>📋</span> {t("resultTitle", lang)}
        </h2>
        <div className="space-y-3">
          {[
            { label: t("leak", lang),    value: evaluation.leakDesc,    icon: "💧", photoKey: "leak" as const },
            { label: t("options", lang), value: evaluation.optionsDesc, icon: "🔧", photoKey: "options" as const },
            { label: t("warning", lang), value: evaluation.warningDesc, icon: "⚡", photoKey: "warning" as const },
          ].map((item) => {
            const isOk = evaluationOk ? evaluationOk[item.photoKey] : (item.value === "이상 없음" || !item.value);
            const photos = checklistPhotos?.[item.photoKey] ?? [];
            return (
              <div
                key={item.photoKey}
                className={`p-3 rounded-xl border ${
                  isOk ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className={`text-sm font-medium whitespace-pre-line ${isOk ? "text-green-700" : "text-red-700"}`}>
                      {item.value || t("noIssue", lang)}
                    </p>
                  </div>
                  <span className="text-lg">{isOk ? "✅" : "❌"}</span>
                </div>
                {photos.length > 0 && (
                  <LightGallery plugins={[lgZoom]} speed={400} selector="a" controls={false} elementClassNames="flex gap-2 mt-3 ml-8 flex-wrap">
                    {photos.map((url, i) => (
                      <a key={i} href={encodeURI(url)} data-src={encodeURI(url)} className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={encodeURI(url)}
                          alt={`${item.label} ${t("photoAlt", lang)} ${i + 1}`}
                          loading="lazy"
                          className="object-cover w-16 h-16 border border-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </LightGallery>
                )}
              </div>
            );
          })}

          {evaluation.memo && (
            <div className="p-3 border border-gray-200 bg-gray-50 rounded-xl">
              <p className="mb-1 text-xs text-gray-500">{t("inspectorNote", lang)}</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{evaluation.memo}</p>
            </div>
          )}
        </div>
      </div>

      {/* 이상 확인 영상 (엔진 이음/조향 이음/옵션작동 이상 등) */}
      {allIssueVideos.length > 0 && (
        <div className="p-5 mb-5 bg-white border shadow-sm rounded-2xl">
          <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-800">
            <span>🔩</span> {t("engine", lang)}
          </h2>
          <div className="flex flex-wrap gap-3">
            {allIssueVideos.map((url, i) => (
              <video
                key={i}
                controls
                playsInline
                preload="metadata"
                src={encodeURI(url)}
                className="w-full max-w-xs rounded-xl border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* 손상 다이어그램 */}
      <div className="p-5 mb-5 bg-white border shadow-sm rounded-2xl">
        <h2 className="flex items-center gap-2 mb-1 font-semibold text-gray-800">
          <span>🔍</span> {t("damageArea", lang)}
          {damagedParts.length > 0 ? (
            <span className="text-xs font-normal text-gray-400">({damagedParts.length}{lang === "ko" ? "" : " "}{t("partsSuffix", lang)})</span>
          ) : (
            <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">✅ {t("noAccidentBadge", lang)}</span>
          )}
        </h2>
        <p className="mb-4 text-xs text-gray-400">{t("hoverHint", lang)}</p>

        <DamageChecker damages={damages} lang={lang} />

        {/* 손상 목록 */}
        {damagedParts.length > 0 ? (
          <div className="mt-4 space-y-1.5">
            {damagedParts.map((part) => (
              <div key={part.name} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                <p className="flex-1 text-sm text-gray-700">{part.name}</p>
                <div className="flex flex-wrap justify-end gap-1">
                  {part.symbols.map((sym) => {
                    const s = SYMBOL_STYLE[sym];
                    const label = SYMBOL_LABEL_I18N[sym]?.[lang] ?? s?.label ?? sym;
                    return (
                      <span
                        key={sym}
                        className="text-xs px-2 py-0.5 rounded-full border font-medium"
                        style={s ? { backgroundColor: s.bg, color: s.text, borderColor: s.border } : {}}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 mt-4 text-sm font-medium text-center text-green-600 border border-green-100 bg-green-50 rounded-xl">
            {t("noAccidentCard", lang)}
          </div>
        )}
      </div>

      {/* 이미지 갤러리 */}
      <div className="p-5 mb-5 bg-white border shadow-sm rounded-2xl">
        <h2 className="flex items-center gap-2 mb-5 font-semibold text-gray-800">
          <span>📸</span> {t("photosTitle", lang)}
        </h2>
        <div className="space-y-6">
          {IMAGE_CATEGORIES.map((cat) => (
            <ImageSection
              key={cat.key}
              images={images[cat.key] || []}
              label={IMAGE_CATEGORY_I18N[cat.key]?.[lang] ?? cat.label}
              icon={cat.icon}
              lang={lang}
            />
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-8 text-xs text-center text-gray-400">
        <p>{t("footerNote", lang)}</p>
        <p className="mt-1">{t("footerBrand", lang)}</p>
      </div>

      {/* 플로팅 버튼 그룹 — 화면을 너무 가려서 접었다 폈다 할 수 있는 FAB 메뉴로 전환.
          채널톡 위젯이 항상 우하단을 쓰므로 겹치지 않게 좌하단에 배치 */}
      <div className="fixed z-50 flex flex-col-reverse items-start gap-3 bottom-6 left-5">
        {/* 메인 토글 버튼 — 항상 보임 */}
        <button
          onClick={() => setFabOpen(v => !v)}
          aria-label={fabOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="flex items-center justify-center w-14 h-14 text-xl text-white transition-transform bg-gray-900 rounded-full shadow-lg hover:bg-black active:scale-95"
        >
          {fabOpen ? "✕" : "☰"}
        </button>

        {/* PDF 다운로드 */}
        <button
          onClick={downloadPDF}
          disabled={pdfLoading}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 bg-blue-700 rounded-full shadow-lg hover:bg-blue-800 disabled:bg-blue-400 ${
            fabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {pdfLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              {t("generating", lang)}
            </>
          ) : (
            <>⬇️ {t("pdfDownload", lang)}</>
          )}
        </button>

        {/* 링크 복사 */}
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 bg-zinc-700 rounded-full shadow-lg hover:bg-zinc-800 ${
            fabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {linkCopied ? <>✅ {t("linkCopied", lang)}</> : <>🔗 {t("copyLink", lang)}</>}
        </button>

        {/* 사진 전체 다운로드(zip) — 등록증/차대번호 등 개인정보 사진은 리포트 화면과 동일하게
            제외되고 1,2,3...번 순서로 이름 붙여 압축됨 */}
        <a
          href={`https://carvior.store/api/v1/external/inspection/report/by-hash/${id}/zip`}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 bg-emerald-700 rounded-full shadow-lg hover:bg-emerald-800 ${
            fabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          📦 {t("photoZip", lang)}
        </a>
      </div>

      {/* PDF 클릭 시에만 마운트 → 평소엔 이미지 이중 요청 없음 */}
      {pdfLoading && (
        <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}>
          <div ref={pdfRef}>
            <PdfTemplate data={data} grade={calcGrade(data)} />
          </div>
        </div>
      )}
    </div>
  );
}
