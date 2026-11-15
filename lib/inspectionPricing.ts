// 검차 금액 — 차급별 변동가격.
//
// 예전처럼 "국산 10만 / 수입 13만" 정찰이 아니다. 차가 커질수록 볼 게 많아져서
// 차급으로 나눈다. 거리 할증은 쓰지 않는다 — 금액이 이미 차급으로 갈리는데
// 할증까지 붙이면 신청 화면에서 최종 금액이 언제 확정되는지 알 수 없게 된다.
//
// ⚠ 여기 금액은 VAT 포함 입금액이다(계좌이체로 이 금액을 그대로 받는다).
// 바꾸면 신청 화면·안내 문구가 전부 같이 움직이므로 여기서만 고친다.

export type CarOrigin = 'DOMESTIC' | 'IMPORTED';

export interface CarClass {
  key: string;
  label: string;
  hint?: string;
}

// 차급 — 사는 분이 자기 차를 바로 찾을 수 있게 대표 차종을 같이 적는다.
export const CAR_CLASSES: CarClass[] = [
  { key: 'light',    label: '경형',      hint: '모닝·스파크·레이' },
  { key: 'small',    label: '소형',      hint: '아반떼·베뉴·셀토스' },
  { key: 'mid',      label: '준·중형',   hint: '쏘나타·K5·투싼' },
  { key: 'semilarge',label: '준대형',    hint: '그랜저·K8·쏘렌토' },
  { key: 'large',    label: '대형',      hint: '제네시스·카니발·팰리세이드' },
  { key: 'sports',   label: '스포츠카',  hint: '2도어 쿠페·로드스터' },
  { key: 'super',    label: '슈퍼카',    hint: '페라리·람보르기니 등' },
];

// 국산은 대형까지만 받는다(스포츠카·슈퍼카 구분이 없다).
const PRICE: Record<CarOrigin, Record<string, number>> = {
  DOMESTIC: {
    light: 100_000,
    small: 110_000,
    mid: 120_000,
    semilarge: 130_000,
    large: 150_000,
  },
  IMPORTED: {
    light: 120_000,
    small: 130_000,
    mid: 140_000,
    semilarge: 160_000,
    large: 180_000,
    sports: 300_000,
    super: 500_000,
  },
};

export function classesFor(origin: CarOrigin): CarClass[] {
  return CAR_CLASSES.filter(c => PRICE[origin][c.key] != null);
}

export function priceFor(origin: CarOrigin, classKey: string): number | null {
  return PRICE[origin][classKey] ?? null;
}

// 검차 종류 — 서버의 requestType과 같은 값이라 바꾸면 안 된다.
// 리포트를 누가 받는지가 이 값으로 갈린다(bookings.requestType 주석 참고).
export const INSPECTION_TYPES = [
  {
    key: 'REMOTE_INSPECTION',
    label: '비대면 검차',
    tagline: '못 가시는 차, 평가사가 대신 봅니다',
    desc: '고객님은 안 가셔도 됩니다. 평가사가 차 있는 곳으로 가서 확인하고 리포트를 보내드립니다.',
    points: ['타지역 매물·시간이 없을 때', '현장 사진 30장 이상 + 진단 리포트', '리포트는 신청하신 분께'],
  },
  {
    key: 'PURCHASE_ESCORT',
    label: '동행 검차',
    tagline: '같이 가서 옆에서 봐드립니다',
    desc: '계약 자리에 평가사가 같이 갑니다. 차를 보면서 바로 설명을 듣고 판단하실 수 있습니다.',
    points: ['계약 직전·흥정이 필요할 때', '현장에서 바로 설명', '리포트는 신청하신 분께'],
  },
] as const;

export type InspectionType = (typeof INSPECTION_TYPES)[number]['key'];
