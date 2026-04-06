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

const POSITION_GROUPS = [
  { key: "FWD", label: "공격", positions: [25, 24, 26, 21, 20, 22, 23, 27] },
  { key: "MID", label: "미드필더", positions: [18, 17, 19, 14, 13, 15, 12, 16, 10, 9, 11] },
  { key: "DEF", label: "수비", positions: [5, 4, 6, 3, 7, 2, 8, 1] },
  { key: "GK", label: "골키퍼", positions: [0] },
];

const POSITION_STATS: Record<string, { key: keyof RankerMetaRow; label: string }[]> = {
  FWD: [
    { key: "goal", label: "골" },
    { key: "assist", label: "어시스트" },
    { key: "effective_shoot", label: "유효슈팅" },
    { key: "shoot", label: "슈팅" },
  ],
  MID: [
    { key: "assist", label: "어시스트" },
    { key: "pass_success", label: "패스 성공" },
    { key: "goal", label: "골" },
    { key: "dribble_success", label: "드리블 성공" },
  ],
  DEF: [
    { key: "tackle", label: "태클" },
    { key: "block", label: "블록" },
    { key: "pass_success", label: "패스 성공" },
  ],
  GK: [
    { key: "block", label: "세이브" },
    { key: "pass_success", label: "패스 성공" },
  ],
};

interface MetaDashboardProps {
  matchtype: number;
  rankerByPosition: Record<number, RankerMetaRow[]>;
  generalByPosition: Record<number, GeneralMetaRow[]>;
  playerNameMap: Record<number, string>;
  seasonMap: Record<number, string>;
}

function getSeasonLabel(spId: number, seasonMap: Record<number, string>): string {
  const seasonId = Math.floor(spId / 1_000_000);
  return seasonMap[seasonId] ?? `S${seasonId}`;
}

export function MetaDashboard({
  matchtype,
  rankerByPosition,
  generalByPosition,
  playerNameMap,
  seasonMap,
}: MetaDashboardProps) {
  const router = useRouter();
  const [dataTab, setDataTab] = useState("ranker");
  const [posTab, setPosTab] = useState("FWD");

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

      {/* 데이터 소스 탭 (랭커/일반) */}
      <Tabs value={dataTab} onValueChange={setDataTab} className="mt-6">
        <TabsList variant="line">
          <TabsTrigger value="ranker">랭커 메타</TabsTrigger>
          <TabsTrigger value="general">일반 메타</TabsTrigger>
        </TabsList>

        <TabsContent value="ranker">
          {hasRankerData ? (
            <PositionTabView
              posTab={posTab}
              setPosTab={setPosTab}
              rankerByPosition={rankerByPosition}
              seasonMap={seasonMap}
            />
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="general">
          {hasGeneralData ? (
            <GeneralView
              posTab={posTab}
              setPosTab={setPosTab}
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

/* ── 포지션 탭 (랭커) ── */

function PositionTabView({
  posTab,
  setPosTab,
  rankerByPosition,
  seasonMap,
}: {
  posTab: string;
  setPosTab: (v: string) => void;
  rankerByPosition: Record<number, RankerMetaRow[]>;
  seasonMap: Record<number, string>;
}) {
  const group = POSITION_GROUPS.find((g) => g.key === posTab) ?? POSITION_GROUPS[0];
  const statDefs = POSITION_STATS[group.key] ?? POSITION_STATS.MID;
  const activePosns = group.positions.filter((p) => rankerByPosition[p]?.length);

  return (
    <div className="mt-4">
      {/* 포지션 그룹 탭 */}
      <div className="flex gap-1 border-b border-border/20 pb-2">
        {POSITION_GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setPosTab(g.key)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
              posTab === g.key
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* 포지션별 카드 */}
      <div className="mt-5 space-y-6">
        {activePosns.map((pos) => {
          const sortKey = group.key === "DEF" || group.key === "GK"
            ? (r: RankerMetaRow) => r.tackle + r.block + r.pass_success
            : group.key === "MID"
              ? (r: RankerMetaRow) => r.assist + r.pass_success + r.goal
              : (r: RankerMetaRow) => r.goal + r.assist + r.effective_shoot;
          const players = [...(rankerByPosition[pos] ?? [])].sort(
            (a, b) => sortKey(b) - sortKey(a),
          );
          return (
            <RankerPositionSection
              key={pos}
              position={pos}
              players={players}
              statDefs={statDefs}
              seasonMap={seasonMap}
            />
          );
        })}
        {activePosns.length === 0 && (
          <p className="py-8 text-center font-mono text-xs text-muted-foreground">
            해당 포지션 데이터 없음
          </p>
        )}
      </div>
    </div>
  );
}

function RankerPositionSection({
  position,
  players,
  statDefs,
  seasonMap,
}: {
  position: number;
  players: RankerMetaRow[];
  statDefs: { key: keyof RankerMetaRow; label: string }[];
  seasonMap: Record<number, string>;
}) {
  const top5 = players.slice(0, 5);
  const best = top5[0];
  const rest = top5.slice(1);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
          {getPositionName(position)}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {players.length}명
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        {/* 1위 선수 — 큰 카드 */}
        {best && (
          <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <PlayerImage spId={best.sp_id} size="lg" className="!h-16 !w-16 !rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">1st</span>
                <span className="truncate text-sm font-semibold text-foreground">
                  {best.player_name}
                </span>
                <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {getSeasonLabel(best.sp_id, seasonMap)}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                {statDefs.map((s) => {
                  const val = best[s.key] as number;
                  return (
                    <div key={s.key} className="flex items-baseline justify-between font-mono text-xs">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-semibold text-primary tabular-nums">
                        {val % 1 === 0 ? val : val.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2~5위 */}
        <div className="space-y-1">
          {/* 스탯 헤더 */}
          <div className="flex items-center gap-2 px-1 font-mono text-[10px] text-muted-foreground/50">
            <span className="w-5" />
            <span className="w-9" />
            <span className="flex-1" />
            {statDefs.map((s) => (
              <span key={s.key} className="w-10 text-right">{s.label}</span>
            ))}
          </div>
          {rest.map((player, i) => (
            <div
              key={player.sp_id}
              className="flex items-center gap-2 rounded-md px-1 py-1.5 font-mono text-xs hover:bg-card/50 transition-colors"
            >
              <span className="w-5 shrink-0 text-right text-muted-foreground">
                {i + 2}
              </span>
              <PlayerImage spId={player.sp_id} size="md" />
              <span className="min-w-0 flex-1 truncate text-foreground">
                {player.player_name}
                <span className="ml-1 rounded bg-muted/40 px-1 py-px font-mono text-[9px] text-muted-foreground/70">
                  {getSeasonLabel(player.sp_id, seasonMap)}
                </span>
              </span>
              {statDefs.map((s) => {
                const val = player[s.key] as number;
                return (
                  <span
                    key={s.key}
                    className="w-10 shrink-0 text-right tabular-nums text-muted-foreground"
                  >
                    {val % 1 === 0 ? val : val.toFixed(1)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 일반 메타 ── */

function GeneralView({
  posTab,
  setPosTab,
  byPosition,
  playerNameMap,
}: {
  posTab: string;
  setPosTab: (v: string) => void;
  byPosition: Record<number, GeneralMetaRow[]>;
  playerNameMap: Record<number, string>;
}) {
  const group = POSITION_GROUPS.find((g) => g.key === posTab) ?? POSITION_GROUPS[0];
  const activePosns = group.positions.filter((p) => byPosition[p]?.length);
  const maxUsage = Math.max(
    ...Object.values(byPosition).flatMap((arr) => arr.map((r) => r.usage)),
    1,
  );

  return (
    <div className="mt-4">
      <div className="flex gap-1 border-b border-border/20 pb-2">
        {POSITION_GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setPosTab(g.key)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
              posTab === g.key
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-6">
        {activePosns.map((pos) => (
          <GeneralPositionSection
            key={pos}
            position={pos}
            players={byPosition[pos]}
            playerNameMap={playerNameMap}
            maxUsage={maxUsage}
          />
        ))}
        {activePosns.length === 0 && (
          <p className="py-8 text-center font-mono text-xs text-muted-foreground">
            해당 포지션 데이터 없음
          </p>
        )}
      </div>
    </div>
  );
}

function GeneralPositionSection({
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
  const best = top5[0];
  const rest = top5.slice(1);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
          {getPositionName(position)}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {players.length}명
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        {best && (
          <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <PlayerImage spId={best.sp_id} size="lg" className="!h-16 !w-16 !rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">1st</span>
                <span className="truncate text-sm font-semibold text-foreground">
                  {playerNameMap[best.sp_id] ?? `#${best.sp_id}`}
                </span>
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                사용 {best.usage.toLocaleString()}회
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {rest.map((player, i) => {
            const name = playerNameMap[player.sp_id] ?? `#${player.sp_id}`;
            const barWidth = (player.usage / maxUsage) * 100;
            return (
              <div
                key={player.sp_id}
                className="flex items-center gap-2 rounded-md px-1 py-1.5 font-mono text-xs hover:bg-card/50 transition-colors"
              >
                <span className="w-5 shrink-0 text-right text-muted-foreground">
                  {i + 2}
                </span>
                <PlayerImage spId={player.sp_id} size="md" />
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
    </div>
  );
}
