"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrustBadge } from "@/components/analysis/TrustBadge";
import { PercentileGauge } from "@/components/analysis/PercentileGauge";
import { StatCard } from "@/components/analysis/StatCard";
import { ActionSuggestionCard } from "@/components/analysis/ActionSuggestionCard";
import { ShootingHeatmap } from "@/components/charts/ShootingHeatmap";
import { PlayStyleRadar } from "@/components/charts/PlayStyleRadar";
import { WinRateDonut } from "@/components/charts/WinRateDonut";
import { PassDistributionDonut } from "@/components/charts/PassDistributionDonut";
import { ConcededTimeHistogram } from "@/components/charts/ConcededTimeHistogram";
import type { AnalysisResult, MatchTypeCount } from "@/lib/analyze";
import { MatchTypeChips } from "@/components/analysis/MatchTypeChips";
import Link from "next/link";

interface DashboardProps {
  result: AnalysisResult;
  nickname: string;
  matchtype: number;
  limit: number;
  matchTypeCounts: MatchTypeCount[];
  playerNameMap?: Record<string, string>;
}

const pct = (v: number) => (v * 100).toFixed(1);

const LIMITS = [10, 20, 50, 100];

function Section({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-lg border border-dashed border-primary/15 p-4 ${className}`}>
      <span className="absolute -top-1 -left-1 font-mono text-[7px] text-primary/30">+</span>
      <span className="absolute -top-1 -right-1 font-mono text-[7px] text-primary/30">+</span>
      <span className="absolute -bottom-1 -left-1 font-mono text-[7px] text-primary/30">+</span>
      <span className="absolute -bottom-1 -right-1 font-mono text-[7px] text-primary/30">+</span>
      <p className="font-mono text-[9px] text-primary/40 mb-3">{label}</p>
      {children}
    </div>
  );
}

export function Dashboard({ result, nickname, matchtype, limit, matchTypeCounts, playerNameMap = {} }: DashboardProps) {
  const router = useRouter();
  const {
    user,
    maxDivisions,
    summary,
    shootingStats: ss,
    passingStats: ps,
    defendingStats: ds,
    playerStats,
    playStyle,
    mainStyle,
    suggestions,
    allShots,
    recentMatches,
    reliability,
  } = result;

  const firstDate = recentMatches.length > 0
    ? new Date(recentMatches[recentMatches.length - 1].matchDate)
    : new Date();
  const lastDate = recentMatches.length > 0
    ? new Date(recentMatches[0].matchDate)
    : new Date();

  // opponent conceded goal times (from all matches)
  const concededGoalTimes: number[] = result.matches.flatMap((m) => {
    const opponent = m.matchInfo.find((info) => info.ouid !== user.ouid);
    return (opponent?.shootDetail ?? [])
      .filter((s) => s.result === 1)
      .map((s) => s.goalTime);
  });

  const bestDivision = maxDivisions.find((d) => d.matchType === matchtype);

  function changeParam(key: string, value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    router.push(url.pathname + url.search);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* A: Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-mono text-xl font-black">
            <span className="text-primary/50">$</span> {user.nickname}
          </h1>
          <span className="font-mono text-[10px] text-muted-foreground/50">
            Lv.{user.level}
          </span>
        </div>
        <select
          value={limit}
          onChange={(e) => changeParam("limit", e.target.value)}
          className="h-7 rounded border border-dashed border-primary/20 bg-transparent px-2 font-mono text-xs text-muted-foreground hover:border-primary/40 transition-colors"
        >
          {LIMITS.map((l) => (
            <option key={l} value={l}>
              최근 {l}G
            </option>
          ))}
        </select>
      </div>

      {/* Match Type Chips */}
      <MatchTypeChips
        matchTypeCounts={matchTypeCounts}
        selected={matchtype}
        onSelect={(mt) => changeParam("matchtype", String(mt))}
      />

      {/* B: TrustBadge */}
      <TrustBadge
        sampleSize={summary.totalMatches}
        dateRange={[firstDate, lastDate]}
        lastUpdated={new Date()}
        matchType={matchTypeCounts.find((m) => m.matchtype === matchtype)?.desc ?? ""}
      />

      {/* C: Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Section label="SUMMARY.overview">
          <div className="flex items-center gap-6">
            <WinRateDonut
              wins={summary.wins}
              draws={summary.draws}
              losses={summary.losses}
            />
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  title="점유율"
                  value={`${summary.avgPossession.toFixed(1)}%`}
                />
                <StatCard
                  title="경기당 골"
                  value={summary.goalsPerGame.toFixed(1)}
                />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground/50">
                win_rate_ci(0.95): [{pct(summary.winRateCI.lower)}%, {pct(summary.winRateCI.upper)}%]
              </p>
            </div>
          </div>
        </Section>

        <Section label="STYLE.classification">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <PlayStyleRadar style={playStyle} />
            </div>
            <div className="text-center">
              <p className="font-mono text-lg font-bold">{mainStyle.name}</p>
              <p className="font-mono text-sm text-primary">
                {mainStyle.score}/100
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mainStyle.description}
              </p>
              {bestDivision && (
                <p className="mt-3 font-mono text-[10px] text-muted-foreground/50">
                  max_division: {bestDivision.division}
                </p>
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* D: Analysis Tabs */}
      <Tabs defaultValue="shooting">
        <TabsList>
          <TabsTrigger value="shooting">슈팅</TabsTrigger>
          <TabsTrigger value="passing">패스</TabsTrigger>
          <TabsTrigger value="defending">수비</TabsTrigger>
          <TabsTrigger value="players">선수</TabsTrigger>
        </TabsList>

        {/* Shooting Tab */}
        <TabsContent value="shooting">
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <ShootingHeatmap
              shots={allShots.map((s) => ({
                x: s.x,
                y: s.y,
                result: s.result,
                goalTime: s.goalTime,
                spId: s.spId,
                inPenalty: s.inPenalty,
              }))}
              showZones
            />
            <div className="space-y-4">
              <PercentileGauge
                label="유효슈팅률"
                value={Number(pct(ss.effectiveShootRate))}
                unit="%"
                percentile={ss.effectiveShootPercentile}
              />
              <PercentileGauge
                label="골전환율"
                value={Number(pct(ss.goalConversionRate))}
                unit="%"
                percentile={ss.goalConversionPercentile}
              />
              <PercentileGauge
                label="박스내 슈팅비율"
                value={Number(pct(ss.inBoxRate))}
                unit="%"
                percentile={ss.inBoxPercentile}
              />
              <PercentileGauge
                label="헤딩골 비율"
                value={Number(pct(ss.headingGoalRate))}
                unit="%"
                percentile={ss.headingPercentile}
              />
              <PercentileGauge
                label="PK 성공률"
                value={Number(pct(ss.pkSuccessRate))}
                unit="%"
                percentile={ss.pkPercentile}
              />
            </div>
          </div>
        </TabsContent>

        {/* Passing Tab */}
        <TabsContent value="passing">
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <PassDistributionDonut
              shortPass={ps.shortPassProportion}
              longPass={ps.longPassProportion}
              throughPass={ps.throughPassProportion}
              lobPass={ps.lobPassProportion}
              groundPass={ps.groundPassProportion}
            />
            <div className="space-y-4">
              <PercentileGauge
                label="전체 패스 성공률"
                value={Number(pct(ps.totalPassRate))}
                unit="%"
                percentile={ps.totalPassPercentile}
              />
              <PercentileGauge
                label="숏패스 성공률"
                value={Number(pct(ps.shortPassRate))}
                unit="%"
                percentile={ps.shortPassPercentile}
              />
              <PercentileGauge
                label="롱패스 성공률"
                value={Number(pct(ps.longPassRate))}
                unit="%"
                percentile={ps.longPassPercentile}
              />
              <PercentileGauge
                label="스루패스 성공률"
                value={Number(pct(ps.throughPassRate))}
                unit="%"
                percentile={ps.throughPassPercentile}
              />
              <PercentileGauge
                label="로빙스루 성공률"
                value={Number(pct(ps.lobPassRate))}
                unit="%"
                percentile={ps.lobPassPercentile}
              />
            </div>
          </div>
        </TabsContent>

        {/* Defending Tab */}
        <TabsContent value="defending">
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <PercentileGauge
                label="태클 성공률"
                value={Number(pct(ds.tackleRate))}
                unit="%"
                percentile={ds.tacklePercentile}
              />
              <PercentileGauge
                label="블록 성공률"
                value={Number(pct(ds.blockRate))}
                unit="%"
                percentile={ds.blockPercentile}
              />
              <StatCard
                title="경기당 파울"
                value={ds.avgFouls.toFixed(1)}
              />
              <StatCard
                title="경기당 옐로카드"
                value={ds.avgYellow.toFixed(1)}
              />
              <StatCard
                title="경기당 레드카드"
                value={ds.avgRed.toFixed(1)}
              />
            </div>
            <ConcededTimeHistogram goalTimes={concededGoalTimes} />
          </div>
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players">
          <Section label="PLAYER.top10" className="mt-4">
            <div className="space-y-1">
              <div className="grid grid-cols-[24px_1fr_48px_56px_56px_44px] gap-1 font-mono text-[9px] text-muted-foreground/50 border-b border-border/30 pb-1.5">
                <span>#</span><span>선수</span><span className="text-center">출전</span><span className="text-right">골/G</span><span className="text-right">어시/G</span><span className="text-right">평점</span>
              </div>
              {playerStats.map((p, i) => {
                const ratingColor = p.avgRating >= 7.0 ? "text-primary" : p.avgRating >= 5.0 ? "text-foreground" : "text-red-400";
                return (
                  <div key={p.spId} className="grid grid-cols-[24px_1fr_48px_56px_56px_44px] gap-1 items-center py-1.5 border-b border-border/15 text-sm">
                    <span className="font-mono text-[10px] text-muted-foreground/40">{i + 1}</span>
                    <span className="truncate">{playerNameMap[String(p.spId)] ?? "Unknown"}</span>
                    <span className="text-center font-mono text-xs">{p.appearances}</span>
                    <span className="text-right font-mono text-xs">{p.avgGoal.toFixed(2)}</span>
                    <span className="text-right font-mono text-xs">{p.avgAssist.toFixed(2)}</span>
                    <span className={`text-right font-mono text-xs font-bold ${ratingColor}`}>{p.avgRating.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      {/* E: Action Suggestions */}
      <ActionSuggestionCard suggestions={suggestions} />

      {/* F: Recent Matches */}
      <Section label="MATCH.recent">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/30 text-left text-[10px] text-muted-foreground/50">
                <th className="pb-1.5 pr-3">날짜</th>
                <th className="pb-1.5 pr-3">상대</th>
                <th className="pb-1.5 pr-3">결과</th>
                <th className="pb-1.5 pr-3">점유</th>
                <th className="pb-1.5 pr-3">슈팅</th>
                <th className="pb-1.5 pr-3">패스%</th>
                <th className="pb-1.5">평점</th>
              </tr>
            </thead>
            <tbody>
              {recentMatches.map((m) => {
                const date = new Date(m.matchDate);
                const resultColor =
                  m.result === "승"
                    ? "text-green-400"
                    : m.result === "패"
                      ? "text-red-400"
                      : "text-muted-foreground";
                return (
                  <tr
                    key={m.matchId}
                    className={`border-b border-border/15 cursor-pointer hover:bg-primary/5 transition-colors ${m.isOutlier ? "bg-yellow-500/5" : ""}`}
                    onClick={() =>
                      router.push(
                        `/player/${encodeURIComponent(nickname)}/match/${m.matchId}`
                      )
                    }
                  >
                    <td className="py-1.5 pr-3 text-muted-foreground/60">
                      {date.getMonth() + 1}/{date.getDate()}
                    </td>
                    <td className="py-1.5 pr-3 text-muted-foreground max-w-[90px] truncate">
                      {m.opponentNickname}
                    </td>
                    <td className={`py-1.5 pr-3 font-bold ${resultColor}`}>
                      {m.goalTotalDisplay}:{m.opponentGoalDisplay} {m.result}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">{m.possession}%</td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {m.shootTotal}({m.effectiveShoot})
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">{m.passRate.toFixed(0)}%</td>
                    <td className="py-1.5 tabular-nums">{m.avgRating.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {recentMatches.some((m) => m.isOutlier) && (
          <p className="mt-2 font-mono text-[10px] text-yellow-400/70">
            ! 노란색 배경 = outlier (z-score {">"} 2.0)
          </p>
        )}
      </Section>

      {/* Navigation links */}
      <div className="flex gap-3">
        <Link
          href={`/player/${encodeURIComponent(nickname)}/compare`}
          className="rounded border border-dashed border-primary/20 px-4 py-2 font-mono text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
        >
          $ compare --ranker
        </Link>
        <Link
          href={`/player/${encodeURIComponent(nickname)}/trend`}
          className="rounded border border-dashed border-primary/20 px-4 py-2 font-mono text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
        >
          $ trend --weekly
        </Link>
      </div>
    </div>
  );
}
