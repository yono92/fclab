import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
  icons: { icon: "/favicon.svg" },
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="FCLab" width={110} height={28} priority />
        </Link>
        <nav className="flex items-center gap-5 font-mono text-xs text-muted-foreground">
          <Link href="/meta" className="hover:text-primary transition-colors">
            /meta
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
        <footer className="border-t border-border/50 py-4 text-center font-mono text-[10px] text-muted-foreground/60">
          FCLab &middot; Nexon OpenAPI &middot; Not affiliated with Nexon
        </footer>
      </body>
    </html>
  );
}
