"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="flex flex-col items-center gap-3 pt-24 pb-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">FCLab</h1>
        <p className="text-lg text-muted-foreground">
          통계로 증명하는 플레이 분석
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 flex w-full max-w-lg gap-2"
      >
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
          className={`h-12 text-base ${shake ? "animate-shake" : ""}`}
        />
        <Button type="submit" size="lg" className="h-12 px-6">
          분석하기
        </Button>
      </form>

      {/* Why FCLab */}
      <section className="mt-24 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl">📊</p>
            <p className="mt-2 text-lg font-semibold">통계 근거</p>
            <p className="mt-2 text-sm text-muted-foreground">
              &quot;상위 15%&quot;
              <br />
              AI 추측이 아닌 정량적 근거
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl">🎯</p>
            <p className="mt-2 text-lg font-semibold">액션 제안</p>
            <p className="mt-2 text-sm text-muted-foreground">
              &quot;박스 내 침투를 높이세요&quot;
              <br />
              뭘 바꿔야 하는지 구체적으로
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl">📈</p>
            <p className="mt-2 text-lg font-semibold">변화 추적</p>
            <p className="mt-2 text-sm text-muted-foreground">
              &quot;주간 트렌드&quot;
              <br />
              나아지고 있는지 눈으로 확인
            </p>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-16 pb-8 text-center text-xs text-muted-foreground">
        FC Online 공식 서비스가 아닙니다 · Nexon OpenAPI 기반
      </footer>
    </div>
  );
}
