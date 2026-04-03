"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getPositionName } from "@/lib/resolve-meta";
import type { MetaPlayerRow } from "@/lib/meta-queries";

const MATCH_TYPES = [
  { matchtype: 50, desc: "공식경기", icon: "🏆" },
  { matchtype: 52, desc: "감독모드", icon: "📋" },
  { matchtype: 60, desc: "친선", icon: "⚽" },
  { matchtype: 204, desc: "볼타", icon: "🎮" },
];

// GK → DEF → MID → FWD 순서
const POSITION_ORDER = [0, 5, 4, 6, 3, 7, 2, 8, 1, 10, 9, 11, 14, 13, 15, 12, 16, 18, 17, 19, 25, 24, 26, 21, 20, 22, 23, 27];

const POSITION_GROUP: Record<string, string> = {
  GK: "GK",
  SW: "DEF", RWB: "DEF", RB: "DEF", RCB: "DEF", CB: "DEF", LCB: "DEF", LB: "DEF", LWB: "DEF",
  RDM: "MID", CDM: "MID", LDM: "MID", RM: "MID", RCM: "MID", CM: "MID", LCM: "MID", LM: "MID",
  RAM: "MID", CAM: "MID", LAM: "MID",
  RF: "FWD", CF: "FWD", LF: "FWD", RW: "FWD", RS: "FWD", ST: "FWD", LS: "FWD", LW: "FWD",
};

interface MetaDashboardProps {
  matchtype: number;
  rankerByPosition: Record<number, MetaPlayerRow[]>;
  generalByPosition: Record<number, MetaPlayerRow[]>;
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

  const byPosition = tab === "ranker" ? rankerByPosition : generalByPosition;

  // 데이터가 있는 포지션만 정렬된 순서로
  const sortedPositions = POSITION_ORDER.filter((p) => byPosition[p]?.length);

  // 포지션 그룹별로 묶기
  const groups: { label: string; positions: number[] }[] = [];
  let currentGroup = "";
  for (const pos of sortedPositions) {
    const name = getPositionName(pos);
    const group = POSITION_GROUP[name] ?? "기타";
    if (group !== currentGroup) {
      groups.push({ label: group, positions: [] });
      currentGroup = group;
    }
    groups[groups.length - 1].positions.push(pos);
  }

  const maxUsage = Math.max(
    ...sortedPositions.flatMap((p) => (byPosition[p] ?? []).map((r) => r.usage)),
    1,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-mono text-lg text-primary">
        &gt; meta_dashboard<span className="animate-pulse">_</span>
      </h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        랭커와 일반 유저의 선수 사용률을 분리해서 비교합니다
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

      {/* 탭: 랭커 / 일반 */}
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mt-6"
      >
        <TabsList variant="line">
          <TabsTrigger value="ranker">랭커 메타</TabsTrigger>
          <TabsTrigger value="general">일반 메타</TabsTrigger>
        </TabsList>

        <TabsContent value="ranker">
          <PositionGrid
            groups={groups}
            byPosition={rankerByPosition}
            playerNameMap={playerNameMap}
            maxUsage={maxUsage}
          />
        </TabsContent>

        <TabsContent value="general">
          <PositionGrid
            groups={groups}
            byPosition={generalByPosition}
            playerNameMap={playerNameMap}
            maxUsage={maxUsage}
          />
        </TabsContent>
      </Tabs>

      {sortedPositions.length === 0 && (
        <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
          데이터가 아직 없습니다
        </p>
      )}
    </div>
  );
}

function PositionGrid({
  groups,
  byPosition,
  playerNameMap,
  maxUsage,
}: {
  groups: { label: string; positions: number[] }[];
  byPosition: Record<number, MetaPlayerRow[]>;
  playerNameMap: Record<number, string>;
  maxUsage: number;
}) {
  return (
    <div className="mt-4 space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="mb-3 font-mono text-xs font-semibold text-muted-foreground tracking-widest">
            -- {group.label} --
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.positions.map((pos) => (
              <PositionCard
                key={pos}
                position={pos}
                players={byPosition[pos] ?? []}
                playerNameMap={playerNameMap}
                maxUsage={maxUsage}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PositionCard({
  position,
  players,
  playerNameMap,
  maxUsage,
}: {
  position: number;
  players: MetaPlayerRow[];
  playerNameMap: Record<number, string>;
  maxUsage: number;
}) {
  const top5 = players.slice(0, 5);

  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
          {getPositionName(position)}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {players.length}명
        </span>
      </div>
      <div className="space-y-1.5">
        {top5.map((player, i) => {
          const name = playerNameMap[player.sp_id] ?? `#${player.sp_id}`;
          const barWidth = (player.usage / maxUsage) * 100;
          return (
            <div key={player.sp_id} className="flex items-center gap-2 font-mono text-xs">
              <span className="w-4 shrink-0 text-right text-muted-foreground">
                {i + 1}
              </span>
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
