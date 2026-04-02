"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { MatrixRain } from "@/components/ui/matrix-rain";

/* ASCII corner box wrapper */
function DashedBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative border border-dashed border-primary/20 ${className}`}>
      <span className="absolute -top-1 -left-1 font-mono text-[8px] text-primary/40">+</span>
      <span className="absolute -top-1 -right-1 font-mono text-[8px] text-primary/40">+</span>
      <span className="absolute -bottom-1 -left-1 font-mono text-[8px] text-primary/40">+</span>
      <span className="absolute -bottom-1 -right-1 font-mono text-[8px] text-primary/40">+</span>
      {children}
    </div>
  );
}

/* CRT scanline overlay */
function Scanlines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,214,143,0.008) 2px, rgba(0,214,143,0.008) 4px)",
      }}
    />
  );
}

/* Animated system status bar */
function StatusBar() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  const uptime = `${Math.floor(tick / 30)}h ${(tick * 2) % 60}m`;
  const mem = (42 + (tick % 15)).toFixed(0);
  const cpu = (3 + (tick % 8)).toFixed(0);
  const ping = (12 + (tick % 20)).toFixed(0);

  return (
    <div className="relative z-10 w-full max-w-3xl px-4">
      <div className="flex items-center justify-between rounded border border-primary/10 bg-primary/[0.02] px-4 py-1.5 font-mono text-[9px] text-primary/30">
        <span>SYS.status: <span className="text-primary/50">ONLINE</span></span>
        <span>uptime: {uptime}</span>
        <span className="hidden sm:inline">mem: {mem}MB</span>
        <span className="hidden sm:inline">cpu: {cpu}%</span>
        <span>api.ping: {ping}ms</span>
        <span className="animate-pulse">●</span>
      </div>
    </div>
  );
}

/* Single line that types out character by character */
function TerminalLine({ prefix, text, color, speed = 25, onDone }: {
  prefix: string; text: string; color: string; speed?: number; onDone?: () => void;
}) {
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex >= text.length) {
      onDone?.();
      return;
    }
    const timer = setTimeout(() => setCharIndex((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [charIndex, text.length, speed, onDone]);

  const prefixColor =
    prefix === "!" ? "text-yellow-400" :
    prefix === "✓" ? "text-primary" :
    prefix === "→" ? "text-primary" :
    "text-primary/40";

  return (
    <div className="flex gap-2">
      <span className={prefixColor}>{prefix}</span>
      <span className={color}>
        {text.slice(0, charIndex)}
        {charIndex < text.length && <span className="inline-block h-3 w-1 bg-primary animate-cursor ml-px" />}
      </span>
    </div>
  );
}

/* Terminal preview — fixed height, types each line */
function TerminalPreview() {
  const [currentLine, setCurrentLine] = useState(0);
  const [doneLines, setDoneLines] = useState<number[]>([]);

  const lines = [
    { prefix: "$", text: "fclab analyze --nick nickname --limit 20", color: "text-foreground", speed: 20 },
    { prefix: ">", text: "connecting to nexon_api... [200 OK]", color: "text-muted-foreground", speed: 18 },
    { prefix: ">", text: "fetching match_records... 20/20 loaded", color: "text-muted-foreground", speed: 18 },
    { prefix: ">", text: "computing wilson_score_ci(0.95)...", color: "text-muted-foreground", speed: 22 },
    { prefix: ">", text: "evaluating action_rules(15)...", color: "text-muted-foreground", speed: 22 },
    { prefix: "✓", text: "win_rate: 62.0%  ci_95: [48.1%, 74.4%]", color: "text-primary", speed: 15 },
    { prefix: "✓", text: "play_style: BUILDUP (score: 78/100)", color: "text-primary", speed: 15 },
    { prefix: "!", text: "WARN: in_box_rate=28% (bottom 35%)", color: "text-yellow-400", speed: 15 },
    { prefix: "→", text: "report_generated. opening dashboard...", color: "text-primary", speed: 18 },
  ];

  const handleLineDone = (lineIndex: number) => {
    setDoneLines((prev) => prev.includes(lineIndex) ? prev : [...prev, lineIndex]);
    if (lineIndex < lines.length - 1) {
      setTimeout(() => setCurrentLine(lineIndex + 1), 200);
    }
  };

  return (
    <div className="w-full rounded-lg border border-primary/20 bg-background/90 shadow-[0_0_60px_rgba(0,214,143,0.06)]">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 border-b border-primary/10 px-4 py-2">
        <div className="h-2 w-2 rounded-full bg-red-500/50" />
        <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
        <div className="h-2 w-2 rounded-full bg-green-500/50" />
        <span className="ml-2 font-mono text-[9px] text-muted-foreground/40">fclab@terminal — ~/analysis</span>
      </div>
      {/* Content — fixed height */}
      <div className="h-[220px] space-y-0.5 p-4 font-mono text-[11px] leading-relaxed">
        {lines.map((line, i) => {
          if (i > currentLine) return null;
          if (doneLines.includes(i)) {
            // Already typed — show full text
            const prefixColor =
              line.prefix === "!" ? "text-yellow-400" :
              line.prefix === "✓" ? "text-primary" :
              line.prefix === "→" ? "text-primary" :
              "text-primary/40";
            return (
              <div key={i} className="flex gap-2">
                <span className={prefixColor}>{line.prefix}</span>
                <span className={line.color}>{line.text}</span>
              </div>
            );
          }
          // Currently typing
          return (
            <TerminalLine
              key={i}
              prefix={line.prefix}
              text={line.text}
              color={line.color}
              speed={line.speed}
              onDone={() => handleLineDone(i)}
            />
          );
        })}
        {doneLines.includes(lines.length - 1) && (
          <div className="flex gap-2 mt-1">
            <span className="text-primary/40">$</span>
            <span className="inline-block h-3.5 w-1.5 bg-primary animate-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}

/* Typing text component */
function TypingText({ text, className = "" }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && <span className="animate-cursor">|</span>}
    </span>
  );
}

/* Feature card with hover terminal output */
function FeatureCard({ varName, title, desc, code, output }: {
  varName: string; title: string; desc: string; code: string; output: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <DashedBox className="p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_20px_rgba(0,214,143,0.06)] group">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <p className="font-mono text-[9px] text-primary/50 mb-2">{varName}.module</p>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
        <div className="mt-3 rounded bg-primary/5 px-2 py-1.5 font-mono text-[9px] overflow-hidden">
          <p className="text-primary/60 group-hover:text-primary/80 transition-colors">
            <span className="text-primary/30">$ </span>{code}
          </p>
          {hovered && (
            <p className="mt-1 text-primary/50">
              <span className="text-primary/30">{">"} </span>
              <TypingText text={output} />
            </p>
          )}
        </div>
      </div>
    </DashedBox>
  );
}

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
    <div className="relative flex flex-1 flex-col items-center overflow-hidden">
      {/* Matrix rain + grid background + scanlines */}
      <MatrixRain />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute inset-0 hero-gradient" />
      <Scanlines />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center gap-3 pt-16 pb-2 text-center px-4">
        <div className="relative animate-float">
          <div className="absolute -inset-8 rounded-3xl bg-primary/15 blur-3xl animate-glow" />
          <Image src="/logo.svg" alt="FCLab" width={220} height={56} priority className="relative" />
        </div>

        <p className="mt-2 font-mono text-xs text-muted-foreground">
          <span className="text-primary/50">#</span> ai 추측이 아닌, <span className="text-foreground font-semibold">통계적 근거</span>로 증명하는 플레이 분석
        </p>
      </div>

      {/* System status */}
      <div className="relative z-10 mt-5 w-full flex justify-center">
        <StatusBar />
      </div>

      {/* Search */}
      <div className="relative z-10 mt-6 w-full max-w-lg px-4">
        <DashedBox className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] text-primary/50">$ nickname_input:</span>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-primary/50">
                {">"}
              </span>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요 _"
                className={`h-11 pl-7 font-mono text-sm bg-background/60 border-primary/20 focus:border-primary/50 focus:shadow-[0_0_12px_rgba(0,214,143,0.12)] transition-shadow ${shake ? "animate-shake" : ""}`}
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 font-mono text-xs font-bold text-primary border border-dashed border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/60 hover:shadow-[0_0_16px_rgba(0,214,143,0.2)] transition-all"
            >
              분석
            </button>
          </form>
          <div className="mt-2.5 flex items-center justify-between font-mono text-[9px] text-muted-foreground/40">
            <span>$ fc_online nick input -{">"} initiate_analysis</span>
            <span>[ enter ]</span>
          </div>
        </DashedBox>
      </div>

      {/* Terminal preview */}
      <section className="relative z-10 mt-10 w-full max-w-lg px-4">
        <TerminalPreview />
      </section>

      {/* Features */}
      <section className="relative z-10 mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 px-4 sm:grid-cols-3">
        <FeatureCard
          varName="STAT"
          title="통계 근거"
          desc="wilson_score CI, percentile, z-score outlier detection"
          code="wilsonScore(wins, total)"
          output="{ lower: 0.321, upper: 0.584, center: 0.45 }"
        />
        <FeatureCard
          varName="RULE"
          title="액션 제안"
          desc="15개 룰 엔진으로 구체적 개선점 자동 도출"
          code="evaluateRules(stats, 5)"
          output='[{ id: "low-inbox", priority: "high" }]'
        />
        <FeatureCard
          varName="TREND"
          title="변화 추적"
          desc="가중 이동평균 트렌드로 성장 과정 시각화"
          code="weightedMovingAverage(data, 5)"
          output="[42.1, 44.3, 45.8, 47.2, 48.5]"
        />
      </section>

      {/* How it works */}
      <section className="relative z-10 mt-14 w-full max-w-3xl px-4">
        <p className="mb-6 text-center font-mono text-[10px] text-primary/30">[ HOW IT WORKS ]</p>
        <div className="flex items-center justify-center">
          {[
            { step: "1", label: "닉네임 입력" },
            { step: "2", label: "데이터 수집" },
            { step: "3", label: "통계 분석" },
            { step: "4", label: "리포트 생성" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary hover:bg-primary/20 hover:scale-110 transition-all cursor-default">
                  {s.step}
                </div>
                <span className="font-mono text-[9px] text-muted-foreground/60">{s.label}</span>
              </div>
              {i < 3 && (
                <span className="mx-2 mt-[-14px] font-mono text-[10px] text-primary/25 sm:mx-4">==={">"}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 mt-14 mb-16 grid w-full max-w-3xl grid-cols-2 gap-3 px-4 sm:grid-cols-4">
        {[
          { value: "9", varName: "STAT.count", label: "통계 함수" },
          { value: "15", varName: "ANALYSIS.rules", label: "분석 룰" },
          { value: "5", varName: "STYLE.axes", label: "스타일 축" },
          { value: "95%", varName: "CONFIDENCE.interval", label: "신뢰구간" },
        ].map((s) => (
          <DashedBox key={s.varName} className="p-4 text-center hover:border-primary/40 hover:shadow-[0_0_12px_rgba(0,214,143,0.05)] transition-all">
            <p className="font-mono text-2xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 font-mono text-[8px] text-primary/30">{s.varName}: {s.value}</p>
            <p className="font-mono text-[9px] text-muted-foreground/50">{s.label}</p>
          </DashedBox>
        ))}
      </section>
    </div>
  );
}
