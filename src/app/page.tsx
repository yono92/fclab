"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const [shake, setShake] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    router.push(`/player/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-2 pt-28 pb-2 text-center">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
          Statistics-driven analysis
        </p>
        <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-primary">FC</span>Lab
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          통계로 증명하는 플레이 분석
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSubmit}
        className="mt-10 flex w-full max-w-md gap-2"
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-primary/60">
            &gt;
          </span>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className={`h-11 pl-7 font-mono text-sm bg-card border-border/50 focus:border-primary/50 ${shake ? "animate-shake" : ""}`}
          />
        </div>
        <Button type="submit" className="h-11 px-5 font-mono text-xs">
          분석
        </Button>
      </form>

      {/* Features */}
      <section className="mt-24 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            tag: "01",
            title: "통계 근거",
            desc: '"상위 15%" — 정량적 근거 기반',
          },
          {
            tag: "02",
            title: "액션 제안",
            desc: '"박스 내 침투↑" — 구체적 개선점',
          },
          {
            tag: "03",
            title: "변화 추적",
            desc: '"주간 트렌드" — 성장 시각화',
          },
        ].map((f) => (
          <div
            key={f.tag}
            className="group rounded-lg border border-border/30 bg-card/50 p-4 transition-colors hover:border-primary/30"
          >
            <p className="font-mono text-[10px] text-primary/60">{f.tag}</p>
            <p className="mt-1 text-sm font-semibold">{f.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
