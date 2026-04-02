"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

const pct = (v: number) => (v * 100).toFixed(1);

const LIMITS = [10, 20, 50, 100];

export function Dashboard({ result, nickname, matchtype, limit, matchTypeCounts }: DashboardProps) {
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
        <div>
          <h1 className="font-mono text-xl font-bold">
            {user.nickname}
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
              Lv.{user.level}
            </span>
          </h1>
        </div>
        <select
          value={limit}
          onChange={(e) => changeParam("limit", e.target.value)}
          className="h-7 rounded-md border border-border/30 bg-card/30 px-2 font-mono text-xs text-muted-foreground"
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
        <Card>
          <CardContent className="flex items-center gap-6 pt-6">
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
              <p className="text-xs text-muted-foreground">
                승률 95% CI: {pct(summary.winRateCI.lower)}% ~ {pct(summary.winRateCI.upper)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">플레이 스타일</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex-1">
              <PlayStyleRadar style={playStyle} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{mainStyle.name}</p>
              <p className="text-sm text-muted-foreground">
                {mainStyle.score}/100
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mainStyle.description}
              </p>
              {bestDivision && (
                <p className="mt-3 text-xs text-muted-foreground">
                  역대 최고: Division {bestDivision.division}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
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
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">주요 사용 선수 TOP 10</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">spId</th>
                        <th className="pb-2 pr-4">출전</th>
                        <th className="pb-2 pr-4">골/경기</th>
                        <th className="pb-2 pr-4">어시/경기</th>
                        <th className="pb-2">평점</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.map((p, i) => (
                        <tr key={p.spId} className="border-b border-border/50">
                          <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{p.spId}</td>
                          <td className="py-2 pr-4">{p.appearances}</td>
                          <td className="py-2 pr-4">{p.avgGoal.toFixed(2)}</td>
                          <td className="py-2 pr-4">{p.avgAssist.toFixed(2)}</td>
                          <td className="py-2">{p.avgRating.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* E: Action Suggestions */}
      <ActionSuggestionCard suggestions={suggestions} />

      {/* F: Recent Matches */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">최근 매치</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3">날짜</th>
                  <th className="pb-2 pr-3">결과</th>
                  <th className="pb-2 pr-3">점유</th>
                  <th className="pb-2 pr-3">슈팅(유효)</th>
                  <th className="pb-2 pr-3">패스%</th>
                  <th className="pb-2">평점</th>
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
                      className={`border-b border-border/50 cursor-pointer hover:bg-muted/30 ${m.isOutlier ? "bg-yellow-500/5" : ""}`}
                      onClick={() =>
                        router.push(
                          `/player/${encodeURIComponent(nickname)}/match/${m.matchId}`
                        )
                      }
                    >
                      <td className="py-2 pr-3 text-muted-foreground">
                        {date.getMonth() + 1}/{date.getDate()}
                      </td>
                      <td className={`py-2 pr-3 font-medium ${resultColor}`}>
                        {m.goalTotalDisplay}:{m.opponentGoalDisplay} {m.result}
                      </td>
                      <td className="py-2 pr-3">{m.possession}%</td>
                      <td className="py-2 pr-3">
                        {m.shootTotal}({m.effectiveShoot})
                      </td>
                      <td className="py-2 pr-3">{m.passRate.toFixed(0)}%</td>
                      <td className="py-2">{m.avgRating.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {recentMatches.some((m) => m.isOutlier) && (
            <p className="mt-2 text-xs text-yellow-400">
              ⚠ 노란색 배경의 경기는 평소와 크게 다른 이상치 경기입니다
            </p>
          )}
        </CardContent>
      </Card>

      {/* Navigation links */}
      <div className="flex gap-3">
        <Link
          href={`/player/${encodeURIComponent(nickname)}/compare`}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          🔄 랭커와 비교하기
        </Link>
        <Link
          href={`/player/${encodeURIComponent(nickname)}/trend`}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          📈 변화 추적 보기
        </Link>
      </div>
    </div>
  );
}
