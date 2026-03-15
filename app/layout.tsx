import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "기초연금 정보 | 수급자격, 모의계산, 신청방법",
  description:
    "2026년 기초연금 수급자격 확인, 모의계산기, 신청방법 안내. 소득인정액 계산부터 지급금액까지 한눈에 알아보세요.",
  keywords: [
    "기초연금",
    "기초연금 수급자격",
    "기초연금 모의계산",
    "기초연금 신청방법",
    "소득인정액",
    "기초연금 금액",
    "노인연금",
  ],
  verification: {
    google: "kPe6sAN7cMBDG2OVVWHcI8hH-BxkT5Zv6U8TVWTxuwI",
    other: {
      "naver-site-verification": ["f7d5154a49f58a4a7b7e5273302ad8421c5b4502"],
    },
  },
  openGraph: {
    title: "기초연금 정보 | 수급자격, 모의계산, 신청방법",
    description:
      "2026년 기초연금 수급자격 확인, 모의계산기, 신청방법 안내",
    type: "website",
    locale: "ko_KR",
    siteName: "기초연금 정보",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2442517902625121"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-[calc(100vh-4rem-12rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
