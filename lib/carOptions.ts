// 차량 옵션 목록 — 등록 폼(선택)과 매물 상세(표시)가 같은 걸 쓴다.
//
// 이름을 여기서만 관리하는 이유: 저장은 문자열 배열(store_items.options)이라,
// 등록 쪽에서 "열선시트"로 저장했는데 표시 쪽이 "열선 시트"로 찾으면 영영 안 맞는다.
// 이름을 바꿔야 하면 이미 저장된 매물도 같이 손봐야 한다 — 함부로 고치지 말 것.
//
// 분류와 표기는 엔카 기준에 맞췄다. 딜러가 엔카와 번갈아 보면서 올리기 때문에
// 용어가 다르면 "이 옵션이 없네"라고 착각한다.

export interface OptionGroup {
  key: string;
  label: string;
  options: string[];
}

export const CAR_OPTION_GROUPS: OptionGroup[] = [
  {
    key: 'exterior',
    label: '외관/내장',
    options: [
      '선루프', '헤드램프', '파워 전동 트렁크', '고스트 도어 클로징',
      '전동접이 사이드 미러', '알루미늄 휠', '루프랙', '열선 스티어링 휠',
      '전동 조절 스티어링 휠', '패들 시프트', '스티어링 휠 리모컨', 'ECM 룸미러',
      '하이패스', '파워 도어록', '파워 스티어링 휠', '파워 윈도우',
    ],
  },
  {
    key: 'safety',
    label: '안전',
    options: [
      '에어백', '에어백(사이드)', '에어백(커튼)', '브레이크 잠김 방지(ABS)',
      '미끄럼 방지(TCS)', '차체자세 제어장치(ESC)', '타이어 공기압센서(TPMS)',
      '차선이탈 경보 시스템(LDWS)', '전자제어 서스펜션(ECS)', '주차감지센서',
      '후측방 경보 시스템', '후방 카메라', '360도 어라운드 뷰',
    ],
  },
  {
    key: 'convenience',
    label: '편의/멀티미디어',
    options: [
      '크루즈 컨트롤', '헤드업 디스플레이(HUD)', '전자식 주차브레이크(EPB)', '자동 에어컨',
      '스마트키', '무선도어 잠금장치', '레인센서', '오토 라이트',
      '커튼/블라인드', '내비게이션', '앞좌석 AV 모니터', '뒷좌석 AV 모니터',
      '블루투스', 'CD 플레이어', 'USB 단자', 'AUX 단자',
    ],
  },
  {
    key: 'seat',
    label: '시트',
    options: [
      '가죽시트', '전동시트', '전동시트(뒷좌석)', '열선시트',
      '메모리 시트', '통풍시트', '통풍시트(뒷좌석)', '마사지 시트',
    ],
  },
];

export const ALL_CAR_OPTIONS = CAR_OPTION_GROUPS.flatMap(g => g.options);

// 매물 목록·상세 위쪽에 먼저 보여줄 옵션. 사는 쪽이 제일 먼저 찾는 것들이라
// 전체 목록을 펼치기 전에 이것만 봐도 대충 판단이 된다.
export const KEY_CAR_OPTIONS = [
  '선루프', '내비게이션', '후방 카메라', '주차감지센서', '자동 에어컨',
  '스마트키', '열선시트', '통풍시트', '가죽시트', '크루즈 컨트롤',
];

// 저장된 옵션을 그룹별로 다시 묶는다. 목록에 없는 이름(예전 데이터·직접 입력)은
// 버리지 않고 "기타"로 모아서 보여준다 — 안 보여주면 올린 사람은 사라졌다고 생각한다.
export function groupSelectedOptions(selected: string[] | null | undefined) {
  const picked = new Set(selected ?? []);
  const groups = CAR_OPTION_GROUPS
    .map(g => ({ ...g, options: g.options.filter(o => picked.has(o)) }))
    .filter(g => g.options.length > 0);

  const known = new Set(ALL_CAR_OPTIONS);
  const etc = (selected ?? []).filter(o => !known.has(o));
  if (etc.length > 0) groups.push({ key: 'etc', label: '기타', options: etc });

  return groups;
}
