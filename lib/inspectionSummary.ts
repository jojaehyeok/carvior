// 매물 상세의 "카비어 진단 요약" 표를 만드는 공용 로직.
//
// 이전엔 각 페이지가 `{ value: item.inspectionData?.leakDesc ?? '없음', bad: false }` 식으로
// 직접 만들었는데, (1) 백엔드가 inspectionData를 안 내려줘서 항상 기본값이 찍혔고
// (2) bad가 항상 false라 실제 누유가 있어도 초록 체크로 그려져서 정상처럼 보였다.
// 같은 표가 /auction/market/[id], /buy/[id], /auction/sale-listings/[id] 세 곳에 복사돼
// 있어서 한 곳만 고치면 또 어긋나므로 여기로 모은다.

export interface InspectionDetails {
  leakDesc?: string | null;
  warningDesc?: string | null;
  driveDesc?: string | null;
  optionsDesc?: string | null;
  engineDesc?: string | null;
}

export interface DiagRow {
  label: string;
  value: string;
  bad: boolean;
}

// 평가사 앱은 "이상 없음"을 정상값으로 저장한다(CarEvaluationSheet.tsx).
// 값이 비어 있으면 아직 진단 데이터가 없는 것이므로 정상으로 단정하지 않는다.
const NORMAL_TEXT = '이상 없음';

export function isNormal(desc?: string | null): boolean {
  const v = desc?.trim();
  return !v || v === NORMAL_TEXT || v === '없음';
}

// 값이 없을 때 "없음"이라고 단정하면 하자를 숨기는 셈이라 "정보 없음"으로 표시한다.
function describe(desc?: string | null): string {
  const v = desc?.trim();
  if (!v) return '정보 없음';
  return v;
}

export function buildDiagRows(
  d: InspectionDetails | null | undefined,
  accident: boolean,
): DiagRow[] {
  return [
    { label: '프레임 진단', value: accident ? '수리됨' : '정상', bad: accident },
    { label: '외부패널 진단', value: accident ? '교환됨' : '교환 없음', bad: accident },
    { label: '누유·누수', value: describe(d?.leakDesc), bad: !isNormal(d?.leakDesc) },
    { label: '경고등', value: describe(d?.warningDesc), bad: !isNormal(d?.warningDesc) },
    { label: '주행 상태', value: describe(d?.driveDesc), bad: !isNormal(d?.driveDesc) },
    { label: '옵션 작동', value: describe(d?.optionsDesc), bad: !isNormal(d?.optionsDesc) },
  ];
}

// 진단 탭의 상세 섹션 — 항목별로 나눠 보여주되, 값이 없는 항목을 "없음"으로 단정하지 않는다.
export function buildDiagSections(d: InspectionDetails | null | undefined) {
  return [
    {
      section: '누유·누수',
      rows: [{ label: '엔진 누유', value: describe(d?.leakDesc), bad: !isNormal(d?.leakDesc) }],
    },
    {
      section: '엔진·주행',
      rows: [
        { label: '엔진', value: describe(d?.engineDesc), bad: !isNormal(d?.engineDesc) },
        { label: '주행', value: describe(d?.driveDesc), bad: !isNormal(d?.driveDesc) },
        { label: '경고등', value: describe(d?.warningDesc), bad: !isNormal(d?.warningDesc) },
      ],
    },
    {
      section: '옵션',
      rows: [{ label: '옵션 작동', value: describe(d?.optionsDesc), bad: !isNormal(d?.optionsDesc) }],
    },
  ];
}
