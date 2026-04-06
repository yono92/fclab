"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getPositionName } from "@/lib/resolve-meta";
import type { RankerMetaRow, GeneralMetaRow } from "@/lib/meta-queries";
import { PlayerImage } from "@/components/player-image";

const MATCH_TYPES = [
  { matchtype: 50, desc: "공식경기", icon: "🏆" },
  { matchtype: 52, desc: "감독모드", icon: "📋" },
  { matchtype: 60, desc: "친선", icon: "⚽" },
  { matchtype: 204, desc: "볼타", icon: "🎮" },
];

// 포지션 그룹 및 표시 순서
const POSITION_GROUPS: { label: string; positions: number[] }[] = [
  { label: "FWD", positions: [25, 24, 26, 21, 20, 22, 23, 27] },
  { label: "MID", positions: [18, 17, 19, 14, 13, 15, 12, 16, 10, 9, 11] },
  { label: "DEF", positions: [5, 4, 6, 3, 7, 2, 8, 1] },
  { label: "GK", positions: [0] },
];

// 포지션별 표시할 주요 스탯
const POSITION_STATS: Record<string, { key: keyof RankerMetaRow; label: string }[]> = {
  FWD: [
    { key: "goal", label: "골" },
    { key: "assist", label: "어시" },
    { key: "effective_shoot", label: "유효슛" },
  ],
  MID: [
    { key: "assist", label: "어시" },
    { key: "pass_success", label: "패스" },
    { key: "goal", label: "골" },
  ],
  DEF: [
    { key: "tackle", label: "태클" },
    { key: "block", label: "블록" },
    { key: "pass_success", label: "패스" },
  ],
  GK: [
    { key: "block", label: "세이브" },
    { key: "pass_success", label: "패스" },
  ],
};

interface MetaDashboardProps {
  matchtype: number;
  rankerByPosition: Record<number, RankerMetaRow[]>;
  generalByPosition: Record<number, GeneralMetaRow[]>;
  playerNameMap: Record<number, string>;
}

export function MetaDashboard({
  matchtype,
  rankerByPosition,
  generalByPosition,
  playerNameMap,
}: MetaDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("ranker");

  function selectMatchType(mt: number) {
    router.push(`/meta?matchtype=${mt}`);
  }

  const hasRankerData = Object.values(rankerByPosition).some((v) => v.length > 0);
  const hasGeneralData = Object.values(generalByPosition).some((v) => v.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-mono text-lg text-primary">
        &gt; meta_dashboard<span className="animate-pulse">_</span>
      </h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        TOP 10,000 랭커의 20경기 평균 스탯 · 포지션별 최고 퍼포먼스 선수
      </p>

      {/* 매치타입 칩 */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MATCH_TYPES.map((mt) => (
          <button
            key={mt.matchtype}
            onClick={() => selectMatchType(mt.matchtype)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
              mt.matchtype === matchtype
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/30 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span>{mt.icon}</span>
            <span>{mt.desc}</span>
          </button>
        ))}
      </div>

      {/* 탭 */}
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList variant="line">
          <TabsTrigger value="ranker">랭커 메타</TabsTrigger>
          <TabsTrigger value="general">일반 메타</TabsTrigger>
        </TabsList>

        <TabsContent value="ranker">
          {hasRankerData ? (
            <RankerGrid byPosition={rankerByPosition} />
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="general">
          {hasGeneralData ? (
            <GeneralGrid
              byPosition={generalByPosition}
              playerNameMap={playerNameMap}
            />
          ) : (
            <EmptyState />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState() {
  return (
    <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
      데이터가 아직 없습니다
    </p>
  );
}

/* ── 랭커 메타 그리드 ── */

function RankerGrid({
  byPosition,
}: {
  byPosition: Record<number, RankerMetaRow[]>;
}) {
  return (
    <div className="mt-4 space-y-8">
      {POSITION_GROUPS.map((group) => {
        const activePosns = group.positions.filter(
          (p) => byPosition[p]?.length,
        );
        if (activePosns.length === 0) return null;

        const stats = POSITION_STATS[group.label] ?? POSITION_STATS.MID;

        return (
          <div key={group.label}>
            <h2 className="mb-3 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
              -- {group.label} --
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activePosns.map((pos) => (
                <RankerPositionCard
                  key={pos}
                  position={pos}
                  players={byPosition[pos]}
                  statDefs={stats}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankerPositionCard({
  position,
  players,
  statDefs,
}: {
  position: number;
  players: RankerMetaRow[];
  statDefs: { key: keyof RankerMetaRow; label: string }[];
}) {
  // 골 기준 정렬
  const sorted = [...players].sort(
    (a, b) => (b.goal as number) - (a.goal as number),
  );
  const top5 = sorted.slice(0, 5);

  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-3">
      {/* 헤더 */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
            {getPositionName(position)}
          </span>
        </div>
        {/* 스탯 헤더 */}
        <div className="flex gap-3 font-mono text-[10px] text-muted-foreground/60">
          {statDefs.map((s) => (
            <span key={s.key} className="w-8 text-right">
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* 선수 목록 */}
      <div className="space-y-1">
        {top5.map((player, i) => (
          <div
            key={player.sp_id}
            className="flex items-center gap-2 font-mono text-xs"
          >
            <span
              className={`w-4 shrink-0 text-right ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"}`}
            >
              {i + 1}
            </span>
            <PlayerImage spId={player.sp_id} size="sm" />
            <span className="min-w-0 flex-1 truncate text-foreground">
              {player.player_name}
            </span>
            {/* 스탯 값 */}
            <div className="flex shrink-0 gap-3">
              {statDefs.map((s) => {
                const val = player[s.key] as number;
                return (
                  <span
                    key={s.key}
                    className={`w-8 text-right tabular-nums ${
                      i === 0
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {val % 1 === 0 ? val : val.toFixed(1)}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 일반 메타 그리드 ── */

function GeneralGrid({
  byPosition,
  playerNameMap,
}: {
  byPosition: Record<number, GeneralMetaRow[]>;
  playerNameMap: Record<number, string>;
}) {
  const maxUsage = Math.max(
    ...Object.values(byPosition).flatMap((arr) =>
      arr.map((r) => r.usage),
    ),
    1,
  );

  return (
    <div className="mt-4 space-y-8">
      {POSITION_GROUPS.map((group) => {
        const activePosns = group.positions.filter(
          (p) => byPosition[p]?.length,
        );
        if (activePosns.length === 0) return null;
        return (
          <div key={group.label}>
            <h2 className="mb-3 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
              -- {group.label} --
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activePosns.map((pos) => (
                <GeneralPositionCard
                  key={pos}
                  position={pos}
                  players={byPosition[pos]}
                  playerNameMap={playerNameMap}
                  maxUsage={maxUsage}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GeneralPositionCard({
  position,
  players,
  playerNameMap,
  maxUsage,
}: {
  position: number;
  players: GeneralMetaRow[];
  playerNameMap: Record<number, string>;
  maxUsage: number;
}) {
  const top5 = players.slice(0, 5);

  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-3">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
          {getPositionName(position)}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {players.length}명
        </span>
      </div>
      <div className="space-y-1.5">
        {top5.map((player, i) => {
          const name =
            playerNameMap[player.sp_id] ?? `#${player.sp_id}`;
          const barWidth = (player.usage / maxUsage) * 100;
          return (
            <div
              key={player.sp_id}
              className="flex items-center gap-2 font-mono text-xs"
            >
              <span className="w-4 shrink-0 text-right text-muted-foreground">
                {i + 1}
              </span>
              <PlayerImage spId={player.sp_id} size="sm" />
              <div className="relative min-w-0 flex-1">
                <div
                  className="absolute inset-y-0 left-0 rounded-sm bg-primary/10"
                  style={{ width: `${barWidth}%` }}
                />
                <span className="relative truncate pl-1.5 text-foreground">
                  {name}
                </span>
              </div>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {player.usage.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
