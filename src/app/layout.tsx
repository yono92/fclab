import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FCLab — 통계로 증명하는 플레이 분석",
  description:
    "FC Online 전적 분석. AI 추측이 아닌, 통계적 근거 기반 실력 향상 분석.",
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          FCLab
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/meta" className="hover:text-foreground transition-colors">
            메타
          </Link>
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            소개
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geist.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          &copy; FCLab &middot; Nexon OpenAPI 기반
        </footer>
      </body>
    </html>
  );
}
