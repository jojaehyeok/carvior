// app/layout.tsx
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import clsx from "clsx";
import Script from "next/script"; // 카카오 지도 위해 추가

// ✅ 서버 컴포넌트이므로 metadata 사용 가능!
export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: { icon: "/favicon_black_white.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="ko">
      <body className={clsx("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col h-screen">
            {/* ✅ Navbar 내부에서 경로를 체크하므로 여기서는 그냥 불러오기만 하면 됩니다 */}
            <Navbar />
            
            <main className="container mx-auto max-w-7xl pt-6 px-4 flex-grow">
              {children}
            </main>
          </div>
        </Providers>
        
        {/* 카카오 지도 API (주소 검색용) */}
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}