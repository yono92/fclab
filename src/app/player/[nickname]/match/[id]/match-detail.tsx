"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShootingHeatmap } from "@/components/charts/ShootingHeatmap";
import { GoalTimeline } from "@/components/charts/GoalTimeline";
import type { MatchResponse, MatchInfo } from "@/types/nexon";

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
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 돌아가기
        </Link>
        <span className="text-sm text-muted-foreground">{dateStr} · 매치타입 {match.matchType}</span>
      </div>

      {/* Score */}
      <Card>
        <CardContent className="flex items-center justify-center gap-8 py-8">
          <div className="text-center">
            <p className="text-sm text-blue-400">나</p>
            <p className="text-lg font-bold">{me.nickname}</p>
            <p className={`text-sm ${resultColor}`}>{me.matchDetail.matchResult}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">
              {me.shoot.goalTotalDisplay} : {op?.shoot.goalTotalDisplay ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-red-400">상대</p>
            <p className="text-lg font-bold">{op?.nickname ?? "?"}</p>
            <p className={`text-sm ${
              op?.matchDetail.matchResult === "승" ? "text-green-400" :
              op?.matchDetail.matchResult === "패" ? "text-red-400" : "text-muted-foreground"
            }`}>{op?.matchDetail.matchResult ?? ""}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">경기 요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {comparisons.map((c) => (
            <ComparisonBar key={c.label} {...c} />
          ))}
        </CardContent>
      </Card>

      {/* Heatmaps */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400">나의 슈팅</CardTitle>
          </CardHeader>
          <CardContent>
            <ShootingHeatmap
              shots={me.shootDetail.map((s) => ({
                x: s.x, y: s.y, result: s.result, goalTime: s.goalTime, spId: s.spId, inPenalty: s.inPenalty,
              }))}
              width={380}
              height={246}
            />
          </CardContent>
        </Card>
        {op && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-400">상대 슈팅</CardTitle>
            </CardHeader>
            <CardContent>
              <ShootingHeatmap
                shots={op.shootDetail.map((s) => ({
                  x: s.x, y: s.y, result: s.result, goalTime: s.goalTime, spId: s.spId, inPenalty: s.inPenalty,
                }))}
                width={380}
                height={246}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Goal Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">골 타임라인</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalTimeline myGoals={myGoals} opGoals={opGoals} />
        </CardContent>
      </Card>

      {/* Player Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">선수별 퍼포먼스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3">선수</th>
                  <th className="pb-2 pr-3">포지션</th>
                  <th className="pb-2 pr-3">골</th>
                  <th className="pb-2 pr-3">어시</th>
                  <th className="pb-2 pr-3">패스%</th>
                  <th className="pb-2">평점</th>
                </tr>
              </thead>
              <tbody>
                {me.player
                  .sort((a, b) => b.status.spRating - a.status.spRating)
                  .map((p) => (
                    <tr key={p.spId} className="border-b border-border/50">
                      <td className="py-2 pr-3">
                        <span className="text-sm">{playerNameMap[String(p.spId)] ?? "Unknown"}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
                          {POSITION_MAP[p.spPosition] ?? `P${p.spPosition}`}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{p.status.goal}</td>
                      <td className="py-2 pr-3">{p.status.assist}</td>
                      <td className="py-2 pr-3">
                        {p.status.passTry > 0
                          ? Math.round((p.status.passSuccess / p.status.passTry) * 100)
                          : 0}%
                      </td>
                      <td className="py-2">{p.status.spRating.toFixed(1)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
