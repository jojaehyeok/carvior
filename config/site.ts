export type SiteConfig = typeof siteConfig;

// ⚠ navItems/navMenuItems는 상단 헤더에 그대로 나간다 — 돈을 쓰는 화면(검차 신청,
// 딜러 출장검차)이 여기 없으면 URL을 직접 치지 않는 한 아무도 못 찾는다.
// 전엔 NextUI 템플릿 기본값(HelpCenter·Dashboard·모의진단)이 그대로 남아 있었다.
export const siteConfig = {
  name: "카비어(Carvior) - 중고차 진단 수출 플랫폼",
  description: "중고차 검차·진단 리포트, 개인 직거래, 수출·폐차 견적까지 — 카비어",
  navItems: [
    {
      label: "검차 신청",
      href: "/inspection",
    },
    {
      label: "딜러 출장검차",
      href: "/dealer-inspection",
    },
    {
      label: "내 차 사기",
      href: "/market",
    },
    {
      label: "시세 조회",
      href: "/price",
    },
    {
      label: "이용가이드",
      href: "/guide",
    },
  ],
  // 모바일 햄버거 메뉴 — 위 항목에 로그인 뒤에 쓰는 것들을 더 붙인다.
  navMenuItems: [
    {
      label: "검차 신청",
      href: "/inspection",
    },
    {
      label: "딜러 출장검차",
      href: "/dealer-inspection",
    },
    {
      label: "내 차 사기",
      href: "/market",
    },
    {
      label: "내 차 팔기",
      href: "/sell",
    },
    {
      label: "시세 조회",
      href: "/price",
    },
    {
      label: "수출 · 폐차 견적",
      href: "/export-scrap",
    },
    {
      label: "이용가이드",
      href: "/guide",
    },
    {
      label: "카비어 소개",
      href: "/info",
    },
    {
      label: "마이페이지",
      href: "/mypage",
    },
  ],
  links: {
    // 템플릿에 딸려온 NextUI 저작자의 깃헙·트위터·패트리온 링크가 그대로 남아
    // 모바일 헤더에 카비어 깃헙인 것처럼 걸려 있었다 — 전부 지웠다.
    kakao: "https://open.kakao.com/o/g7EXAELg",
  },
};
