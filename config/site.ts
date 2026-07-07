export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "카비어(Carvior) - 중고차 진단 수출 플랫폼",
  description: "R&D 용",
  navItems: [
    {
      label: "카비어 소개",
      href: "/info",
    },
    {
      label: "차량 소개",
      href: "/CarLiveShorts",
    },
    {
      label: "평가사 둘러보기",
      href: "/evaluators",
    },
    {
      label: "모의 진단",
      href: "/jindan",
    },
  ],
  navMenuItems: [
    {
      label: "차량조회",
      href: "/info",
    },
    {
      label: "모의진단",
      href: "/jindan",
    },
    {
      label: "HelpCenter",
      href: "/helper",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },

  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://open.kakao.com/o/g7EXAELg",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
