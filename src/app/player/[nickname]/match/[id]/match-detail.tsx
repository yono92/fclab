"use client";

import Link from "next/link";
import { ShootingHeatmap } from "@/components/charts/ShootingHeatmap";
import { GoalTimeline } from "@/components/charts/GoalTimeline";
import type { MatchResponse, MatchInfo } from "@/types/nexon";
import { PlayerImage } from "@/components/player-image";

const MATCH_TYPE_NAME: Record<number, string> = {
  50: "공식경기", 52: "감독모드", 60: "공식친선", 40: "클래식1on1", 204: "볼타친선", 214: "볼타공식",
};

const POSITION_MAP: Record<number, string> = {
  0: "GK", 1: "SW", 2: "RWB", 3: "RB", 4: "RCB", 5: "CB", 6: "LCB", 7: "LB", 8: "LWB",
  9: "RDM", 10: "CDM", 11: "LDM", 12: "RM", 13: "RCM", 14: "CM", 15: "LCM", 16: "LM",
  17: "RAM", 18: "CAM", 19: "LAM", 20: "RF", 21: "CF", 22: "LF", 23: "RW", 24: "RS",
  25: "ST", 26: "LS", 27: "LW", 28: "SUB",
};

interface MatchDetailViewProps {
  match: MatchResponse;
  me: MatchInfo;
  opponent: MatchInfo | null;
  nickname: string;
  playerNameMap?: Record<string, string>;
}

interface ComparisonRow {
  label: string;
  myValue: number;
  opValue: number;
  format: "number" | "percent";
}

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

function ComparisonBar({ label, myValue, opValue, format }: ComparisonRow) {
  const total = myValue + opValue || 1;
  const myPct = (myValue / total) * 100;
  const display = format === "percent"
    ? (v: number) => `${v.toFixed(0)}%`
    : (v: number) => String(v);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
      <div className="flex items-center justify-end gap-2">
        <span className="font-medium">{display(myValue)}</span>
        <div className="h-3 w-24 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full ml-auto"
            style={{ width: `${myPct}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground w-20 text-center">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-3 w-24 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full"
            style={{ width: `${100 - myPct}%` }}
          />
        </div>
        <span className="font-medium">{display(opValue)}</span>
      </div>
    </div>
  );
}

export function MatchDetailView({ match, me, opponent, nickname, playerNameMap = {} }: MatchDetailViewProps) {
  const date = new Date(match.matchDate);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const resultColor =
    me.matchDetail.matchResult === "승"
      ? "text-green-400"
      : me.matchDetail.matchResult === "패"
        ? "text-red-400"
        : "text-muted-foreground";

  const op = opponent;
  const comparisons: ComparisonRow[] = [
    { label: "점유율", myValue: me.matchDetail.possession, opValue: op?.matchDetail.possession ?? 0, format: "percent" },
    { label: "슈팅(유효)", myValue: me.shoot.shootTotal, opValue: op?.shoot.shootTotal ?? 0, format: "number" },
    { label: "패스 성공률", myValue: Math.round(safeDiv(me.pass.passSuccess, me.pass.passTry) * 100), opValue: Math.round(safeDiv(op?.pass.passSuccess ?? 0, op?.pass.passTry ?? 1) * 100), format: "percent" },
    { label: "태클 성공률", myValue: Math.round(safeDiv(me.defence.tackleSuccess, me.defence.tackleTry) * 100), opValue: Math.round(safeDiv(op?.defence.tackleSuccess ?? 0, op?.defence.tackleTry ?? 1) * 100), format: "percent" },
    { label: "파울", myValue: me.matchDetail.foul, opValue: op?.matchDetail.foul ?? 0, format: "number" },
    { label: "코너킥", myValue: me.matchDetail.cornerKick, opValue: op?.matchDetail.cornerKick ?? 0, format: "number" },
    { label: "오프사이드", myValue: me.matchDetail.OffsideCount, opValue: op?.matchDetail.OffsideCount ?? 0, format: "number" },
  ];

  const myGoals = me.shootDetail.filter((s) => s.result === 1).map((s) => ({ time: s.goalTime, spId: s.spId }));
  const opGoals = (op?.shootDetail ?? []).filter((s) => s.result === 1).map((s) => ({ time: s.goalTime, spId: s.spId }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/player/${encodeURIComponent(nickname)}`}
          className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {"<"}- back
        </Link>
        <span className="font-mono text-[10px] text-muted-foreground/50">|</span>
        <span className="font-mono text-[10px] text-muted-foreground/60">{dateStr}</span>
        <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-[9px] text-primary/70">
          {MATCH_TYPE_NAME[match.matchType] ?? `type:${match.matchType}`}
        </span>
      </div>

      {/* Score */}
      <div className="relative rounded-lg border border-dashed border-primary/20 py-6 px-4">
        <span className="absolute -top-1 -left-1 font-mono text-[8px] text-primary/40">+</span>
        <span className="absolute -top-1 -right-1 font-mono text-[8px] text-primary/40">+</span>
        <span className="absolute -bottom-1 -left-1 font-mono text-[8px] text-primary/40">+</span>
        <span className="absolute -bottom-1 -right-1 font-mono text-[8px] text-primary/40">+</span>
        <p className="font-mono text-[9px] text-primary/40 mb-4">MATCH.result</p>
        <div className="flex items-center justify-center gap-6">
          {/* Me */}
          <div className="flex-1 text-right">
            <p className="font-mono text-[10px] text-blue-400/60 mb-1">ME</p>
            <p className="font-mono text-base font-bold truncate">{me.nickname}</p>
          </div>
          {/* Score */}
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-5xl font-black text-primary">{me.shoot.goalTotalDisplay}</span>
            <span className="font-mono text-lg text-muted-foreground/30">:</span>
            <span className="font-mono text-5xl font-black text-red-400/80">{op?.shoot.goalTotalDisplay ?? 0}</span>
          </div>
          {/* Opponent */}
          <div className="flex-1 text-left">
            <p className="font-mono text-[10px] text-red-400/60 mb-1">OPP</p>
            <p className="font-mono text-base font-bold truncate">{op?.nickname ?? "?"}</p>
          </div>
        </div>
        {/* Result label */}
        <p className={`mt-3 text-center font-mono text-sm font-bold ${resultColor}`}>
          {me.matchDetail.matchResult}
        </p>
      </div>

      {/* Comparison */}
      <div className="rounded-lg border border-border/30 bg-card/30 p-4">
        <p className="font-mono text-[9px] text-primary/40 mb-3">COMPARE.stats</p>
        <div className="space-y-3">
          {comparisons.map((c) => (
            <ComparisonBar key={c.label} {...c} />
          ))}
        </div>
      </div>

      {/* Heatmaps */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border/30 bg-card/30 p-4">
          <p className="font-mono text-[9px] text-blue-400/60 mb-2">SHOOT.heatmap(me)</p>
          <ShootingHeatmap
            shots={me.shootDetail.map((s) => ({
              x: s.x, y: s.y, result: s.result, goalTime: s.goalTime, spId: s.spId, inPenalty: s.inPenalty,
            }))}
            width={380}
            height={246}
          />
        </div>
        {op && (
          <div className="rounded-lg border border-border/30 bg-card/30 p-4">
            <p className="font-mono text-[9px] text-red-400/60 mb-2">SHOOT.heatmap(opp)</p>
            <ShootingHeatmap
              shots={op.shootDetail.map((s) => ({
                x: s.x, y: s.y, result: s.result, goalTime: s.goalTime, spId: s.spId, inPenalty: s.inPenalty,
              }))}
              width={380}
              height={246}
            />
          </div>
        )}
      </div>

      {/* Goal Timeline */}
      <div className="rounded-lg border border-border/30 bg-card/30 p-4">
        <p className="font-mono text-[9px] text-primary/40 mb-2">GOAL.timeline</p>
        <GoalTimeline myGoals={myGoals} opGoals={opGoals} />
      </div>

      {/* Player Performance */}
      <div className="rounded-lg border border-border/30 bg-card/30 p-4">
        <p className="font-mono text-[9px] text-primary/40 mb-3">PLAYER.performance</p>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[1fr_50px_36px_36px_48px_44px] gap-1 font-mono text-[9px] text-muted-foreground/50 border-b border-border/30 pb-1.5">
            <span>선수</span>
            <span>포지션</span>
            <span className="text-center">골</span>
            <span className="text-center">어시</span>
            <span className="text-right">패스%</span>
            <span className="text-right">평점</span>
          </div>
          {/* Starters (rating > 0) */}
          {me.player
            .filter((p) => p.status.spRating > 0)
            .sort((a, b) => b.status.spRating - a.status.spRating)
            .map((p) => {
              const passRate = p.status.passTry > 0
                ? Math.round((p.status.passSuccess / p.status.passTry) * 100)
                : 0;
              const ratingColor = p.status.spRating >= 7.0 ? "text-primary" : p.status.spRating >= 5.0 ? "text-foreground" : "text-red-400";
              return (
                <div key={p.spId} className="grid grid-cols-[1fr_50px_36px_36px_48px_44px] gap-1 items-center py-1 border-b border-border/20 text-sm">
                  <span className="flex items-center gap-1.5 truncate"><PlayerImage spId={p.spId} size="sm" />{playerNameMap[String(p.spId)] ?? "Unknown"}</span>
                  <span className="rounded bg-primary/5 border border-primary/15 px-1 py-0.5 font-mono text-[9px] text-primary/60 text-center w-fit">
                    {POSITION_MAP[p.spPosition] ?? `P${p.spPosition}`}
                  </span>
                  <span className="text-center font-mono text-xs">{p.status.goal || "-"}</span>
                  <span className="text-center font-mono text-xs">{p.status.assist || "-"}</span>
                  <span className="text-right font-mono text-xs text-muted-foreground">{passRate}%</span>
                  <span className={`text-right font-mono text-xs font-bold ${ratingColor}`}>{p.status.spRating.toFixed(1)}</span>
                </div>
              );
            })}
          {/* Subs (rating = 0) - collapsed */}
          {me.player.some((p) => p.status.spRating === 0) && (
            <p className="pt-1.5 font-mono text-[9px] text-muted-foreground/30">
              + {me.player.filter((p) => p.status.spRating === 0).length}명 벤치 (미출전)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
