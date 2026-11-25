'use client';

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  const pathname = usePathname();

  // 1. 헤더를 숨기고 싶은 조건 (startsWith 사용)
  // /reports/1, /reports/100 등 모든 리포트 상세 페이지에서 Navbar를 숨깁니다.
  const isNoNavbarPath =
    pathname === '/marketing/carvior-inspection' ||
    pathname === '/simple-request' ||
    pathname.startsWith('/marketing') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/report') ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/buy') ||
    pathname.startsWith('/sell') ||
    pathname.startsWith('/price') ||
    pathname.startsWith('/auction');

  // 2. 조건에 해당하면 아무것도 렌더링하지 않음 (Navbar 제거)
  if (isNoNavbarPath) {
    return null;
  }

  // 전엔 여기 NextUI 템플릿의 "Search..." 입력칸이 있었다. onChange도 onSubmit도 없는
  // 장식이라 눌러도 아무 일이 안 일어났다 — 되는 것처럼 보이는 게 없는 것보다 나쁘다.
  // 차종 검색은 /price가 하는 일이라 메뉴의 "시세 조회"로 보낸다.

  return (
    <NextUINavbar
      maxWidth="xl"
      position="static"
      isBordered={false}
      className="sticky top-0 z-50 w-full bg-white text-gray-900 border-b border-gray-200 shadow-sm"
    >
      {/* 좌측: 로고 + 메뉴 */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* 우측: 테마 스위치 + 검색 */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <NextLink
            href="/inspection"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            검차 신청
          </NextLink>
        </NavbarItem>
      </NavbarContent>

      {/* 모바일 우측: 깃헙 + 테마 + 햄버거 */}
      {/* 모바일 우측 — 템플릿에 딸려온 깃헙 아이콘(NextUI 저작자 레포로 가던 것)을 뺐다 */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* 모바일 메뉴 */}
      <NavbarMenu className="bg-white">
        <div className="mx-4 mt-4 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link color="foreground" href={item.href} size="lg">
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};