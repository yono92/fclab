/**
 * FCLab 분석 오케스트레이션
 * 유저 데이터 수집 → 통계 계산 → 제안 생성
 */

import { createNexonClient, NexonApiError } from "@/lib/nexon-api";
import {
  mean,
  standardDeviation,
  calculatePercentile,
  wilsonScore,
  detectOutliers,
  reliabilityGrade,
} from "@/lib/stats";
import { evaluateRules, type UserStats } from "@/lib/action-rules";
import {
  classifyPlayStyle,
  getMainStyle,
  type PlayStyle,
  type PlayStyleInput,
  type MainStyleResult,
} from "@/lib/play-style";
import type {
  UserBasic,
  MaxDivision,
  MatchResponse,
  MatchInfo,
  ShootDetailItem,
} from "@/types/nexon";

// ============================================================================
// Types
// ============================================================================

export interface AnalysisResult {
  user: UserBasic;
  maxDivisions: MaxDivision;
  matches: MatchResponse[];
  myStats: MatchInfo[];
  summary: MatchSummary;
  shootingStats: ShootingStats;
  passingStats: PassingStats;
  defendingStats: DefendingStats;
  playerStats: PlayerStat[];
  playStyle: PlayStyle;
  mainStyle: MainStyleResult;
  suggestions: ReturnType<typeof evaluateRules>;
  outlierIndices: number[];
  reliability: ReturnType<typeof reliabilityGrade>;
  allShots: ShootDetailItem[];
  recentMatches: RecentMatch[];
}

export interface MatchSummary {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  avgPossession: number;
  avgRating: number;
  goalsPerGame: number;
  effectiveShotsPerGame: number;
  winRateCI: { lower: number; upper: number; center: number };
}

export interface ShootingStats {
  effectiveShootRate: number;
  goalConversionRate: number;
  inBoxRate: number;
  headingGoalRate: number;
  pkSuccessRate: number;
  effectiveShootPercentile: number;
  goalConversionPercentile: number;
  inBoxPercentile: number;
  headingPercentile: number;
  pkPercentile: number;
}

export interface PassingStats {
  totalPassRate: number;
  shortPassRate: number;
  longPassRate: number;
  throughPassRate: number;
  lobPassRate: number;
  shortPassProportion: number;
  longPassProportion: number;
  throughPassProportion: number;
  lobPassProportion: number;
  groundPassProportion: number;
  totalPassPercentile: number;
  shortPassPercentile: number;
  longPassPercentile: number;
  throughPassPercentile: number;
  lobPassPercentile: number;
}

export interface DefendingStats {
  tackleRate: number;
  blockRate: number;
  avgFouls: number;
  avgYellow: number;
  avgRed: number;
  tacklePercentile: number;
  blockPercentile: number;
  foulPercentile: number;
}

export interface PlayerStat {
  spId: number;
  appearances: number;
  avgGoal: number;
  avgAssist: number;
  avgRating: number;
  totalGoals: number;
}

export interface RecentMatch {
  matchId: string;
  matchDate: string;
  matchType: number;
  result: string;
  possession: number;
  shootTotal: number;
  effectiveShoot: number;
  passRate: number;
  avgRating: number;
  goalTotal: number;
  goalTotalDisplay: number;
  opponentGoalDisplay: number;
  isOutlier: boolean;
}

// ============================================================================
// Helper functions
// ============================================================================

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

function extractMyInfo(match: MatchResponse, ouid: string): MatchInfo | null {
  return match.matchInfo.find((info) => info.ouid === ouid) ?? null;
}

// ============================================================================
// Match type counts
// ============================================================================

export interface MatchTypeCount {
  matchtype: number;
  desc: string;
  count: number;
}

const MAIN_MATCH_TYPES = [
  { matchtype: 50, desc: "공식" },
  { matchtype: 52, desc: "감독" },
  { matchtype: 40, desc: "친선" },
  { matchtype: 204, desc: "볼타" },
  { matchtype: 214, desc: "커스텀" },
];

export async function getMatchTypeCounts(
  ouid: string
): Promise<MatchTypeCount[]> {
  const client = createNexonClient();

  const results = await Promise.all(
    MAIN_MATCH_TYPES.map(async (mt) => {
      try {
        const ids = await client.getUserMatch({
          ouid,
          matchtype: mt.matchtype,
          limit: 100,
        });
        return { ...mt, count: ids.length };
      } catch {
        return { ...mt, count: 0 };
      }
    })
  );

  return results.sort((a, b) => b.count - a.count);
}

// ============================================================================
// Main analysis function
// ============================================================================

export async function analyzePlayer(
  nickname: string,
  matchtype: number = 50,
  limit: number = 20
): Promise<AnalysisResult> {
  const client = createNexonClient();

  // 1. Get user info
  const { ouid } = await client.getOuid({ nickname });
  const [user, maxDivisions] = await Promise.all([
    client.getUserBasic({ ouid }),
    client.getUserMaxDivision({ ouid }),
  ]);

  // Try requested matchtype first, fallback to others if empty
  let matchIds = await client.getUserMatch({ ouid, matchtype, limit });
  let actualMatchtype = matchtype;

  if (matchIds.length === 0) {
    const fallbackTypes = [52, 40, 50, 214, 215, 216].filter((t) => t !== matchtype);
    for (const ft of fallbackTypes) {
      const ids = await client.getUserMatch({ ouid, matchtype: ft, limit });
      if (ids.length > 0) {
        matchIds = ids;
        actualMatchtype = ft;
        break;
      }
    }
  }

  // 2. Fetch match details (parallel, with error tolerance)
  const matchPromises = matchIds.map((matchid) =>
    client.getMatchDetail({ matchid }).catch(() => null)
  );
  const matchResults = await Promise.all(matchPromises);
  const matches = matchResults.filter(
    (m): m is MatchResponse => m !== null
  );

  // 3. Extract my stats from each match
  const myStats = matches
    .map((m) => extractMyInfo(m, ouid))
    .filter((s): s is MatchInfo => s !== null);

  if (myStats.length === 0) {
    throw new Error("최근 경기가 없습니다");
  }

  // 4. Compute summary
  const wins = myStats.filter((s) => s.matchDetail.matchResult === "승").length;
  const draws = myStats.filter((s) => s.matchDetail.matchResult === "무").length;
  const losses = myStats.length - wins - draws;
  const winRate = safeDiv(wins, myStats.length);
  const avgPossession = mean(myStats.map((s) => s.matchDetail.possession));
  const avgRating = mean(myStats.map((s) => s.matchDetail.averageRating));
  const totalGoals = myStats.reduce((a, s) => a + s.shoot.goalTotal, 0);
  const totalShoots = myStats.reduce((a, s) => a + s.shoot.shootTotal, 0);
  const totalEffective = myStats.reduce((a, s) => a + s.shoot.effectiveShootTotal, 0);
  const totalInBox = myStats.reduce((a, s) => a + s.shoot.shootInPenalty, 0);
  const totalHeadingGoals = myStats.reduce((a, s) => a + s.shoot.goalHeading, 0);
  const totalPK = myStats.reduce((a, s) => a + s.shoot.shootPenaltyKick, 0);
  const totalPKGoals = myStats.reduce((a, s) => a + s.shoot.goalPenaltyKick, 0);
  const totalPassTry = myStats.reduce((a, s) => a + s.pass.passTry, 0);
  const totalPassSuccess = myStats.reduce((a, s) => a + s.pass.passSuccess, 0);
  const totalShortTry = myStats.reduce((a, s) => a + s.pass.shortPassTry, 0);
  const totalShortSuccess = myStats.reduce((a, s) => a + s.pass.shortPassSuccess, 0);
  const totalLongTry = myStats.reduce((a, s) => a + s.pass.longPassTry, 0);
  const totalLongSuccess = myStats.reduce((a, s) => a + s.pass.longPassSuccess, 0);
  const totalThroughTry = myStats.reduce((a, s) => a + s.pass.throughPassTry, 0);
  const totalThroughSuccess = myStats.reduce((a, s) => a + s.pass.throughPassSuccess, 0);
  const totalLobTry = myStats.reduce((a, s) => a + s.pass.bouncingLobPassTry, 0);
  const totalLobSuccess = myStats.reduce((a, s) => a + s.pass.bouncingLobPassSuccess, 0);
  const totalGroundTry = myStats.reduce((a, s) => a + s.pass.drivenGroundPassTry, 0);
  const totalTackleTry = myStats.reduce((a, s) => a + s.defence.tackleTry, 0);
  const totalTackleSuccess = myStats.reduce((a, s) => a + s.defence.tackleSuccess, 0);
  const totalBlockTry = myStats.reduce((a, s) => a + s.defence.blockTry, 0);
  const totalBlockSuccess = myStats.reduce((a, s) => a + s.defence.blockSuccess, 0);
  const avgFouls = mean(myStats.map((s) => s.matchDetail.foul));
  const avgYellow = mean(myStats.map((s) => s.matchDetail.yellowCards));
  const avgRed = mean(myStats.map((s) => s.matchDetail.redCards));

  const effectiveShootRate = safeDiv(totalEffective, totalShoots);
  const goalConversionRate = safeDiv(totalGoals, totalShoots);
  const inBoxRate = safeDiv(totalInBox, totalShoots);
  const headingGoalRate = safeDiv(totalHeadingGoals, totalGoals);
  const pkSuccessRate = safeDiv(totalPKGoals, totalPK);

  // 5. Fake percentiles (placeholder — in real app, compare against DB distribution)
  const fakePercentile = (rate: number, avg: number): number =>
    Math.min(100, Math.max(0, 50 + (rate - avg) * 200));

  const shootingStats: ShootingStats = {
    effectiveShootRate,
    goalConversionRate,
    inBoxRate,
    headingGoalRate,
    pkSuccessRate,
    effectiveShootPercentile: fakePercentile(effectiveShootRate, 0.45),
    goalConversionPercentile: fakePercentile(goalConversionRate, 0.25),
    inBoxPercentile: fakePercentile(inBoxRate, 0.4),
    headingPercentile: fakePercentile(headingGoalRate, 0.15),
    pkPercentile: fakePercentile(pkSuccessRate, 0.7),
  };

  const totalPassRate = safeDiv(totalPassSuccess, totalPassTry);
  const shortPassRate = safeDiv(totalShortSuccess, totalShortTry);
  const longPassRate = safeDiv(totalLongSuccess, totalLongTry);
  const throughPassRate = safeDiv(totalThroughSuccess, totalThroughTry);
  const lobPassRate = safeDiv(totalLobSuccess, totalLobTry);

  const passingStats: PassingStats = {
    totalPassRate,
    shortPassRate,
    longPassRate,
    throughPassRate,
    lobPassRate,
    shortPassProportion: safeDiv(totalShortTry, totalPassTry),
    longPassProportion: safeDiv(totalLongTry, totalPassTry),
    throughPassProportion: safeDiv(totalThroughTry, totalPassTry),
    lobPassProportion: safeDiv(totalLobTry, totalPassTry),
    groundPassProportion: safeDiv(totalGroundTry, totalPassTry),
    totalPassPercentile: fakePercentile(totalPassRate, 0.8),
    shortPassPercentile: fakePercentile(shortPassRate, 0.85),
    longPassPercentile: fakePercentile(longPassRate, 0.5),
    throughPassPercentile: fakePercentile(throughPassRate, 0.6),
    lobPassPercentile: fakePercentile(lobPassRate, 0.4),
  };

  const tackleRate = safeDiv(totalTackleSuccess, totalTackleTry);
  const blockRate = safeDiv(totalBlockSuccess, totalBlockTry);

  const defendingStats: DefendingStats = {
    tackleRate,
    blockRate,
    avgFouls,
    avgYellow,
    avgRed,
    tacklePercentile: fakePercentile(tackleRate, 0.65),
    blockPercentile: fakePercentile(blockRate, 0.3),
    foulPercentile: fakePercentile(1 - avgFouls / 5, 0.5),
  };

  // 6. Player stats aggregation
  const playerMap = new Map<number, { goals: number; assists: number; ratings: number[]; count: number }>();
  for (const stat of myStats) {
    for (const p of stat.player) {
      const existing = playerMap.get(p.spId) ?? { goals: 0, assists: 0, ratings: [], count: 0 };
      existing.goals += p.status.goal;
      existing.assists += p.status.assist;
      existing.ratings.push(p.status.spRating);
      existing.count++;
      playerMap.set(p.spId, existing);
    }
  }
  const playerStats: PlayerStat[] = [...playerMap.entries()]
    .map(([spId, d]) => ({
      spId,
      appearances: d.count,
      avgGoal: safeDiv(d.goals, d.count),
      avgAssist: safeDiv(d.assists, d.count),
      avgRating: mean(d.ratings),
      totalGoals: d.goals,
    }))
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, 10);

  // Top scorer share
  const topScorer = playerStats[0];
  const topScorerGoalShare = totalGoals > 0 ? safeDiv(topScorer?.totalGoals ?? 0, totalGoals) : 0;

  // 7. All shots for heatmap
  const allShots = myStats.flatMap((s) => s.shootDetail);

  // 8. Play style
  const playStyleInput: PlayStyleInput = {
    avgPossession,
    passTriesPerGame: safeDiv(totalPassTry, myStats.length),
    effectiveShootRate,
    tackleTriesPerGame: safeDiv(totalTackleTry, myStats.length),
    interceptPerGame: 0, // not in match-level stats
    shootsPerGame: safeDiv(totalShoots, myStats.length),
    shootZoneDiversity: 50, // placeholder
    shortPassRate: safeDiv(totalShortTry, totalPassTry),
    shortPassSuccessRate: shortPassRate,
    passTriesPercentile: fakePercentile(safeDiv(totalPassTry, myStats.length) / 200, 0.5),
    tackleTriesPercentile: fakePercentile(safeDiv(totalTackleTry, myStats.length) / 15, 0.5),
    interceptPercentile: 50,
    shootsPercentile: fakePercentile(safeDiv(totalShoots, myStats.length) / 8, 0.5),
  };
  const playStyle = classifyPlayStyle(playStyleInput);
  const mainStyle = getMainStyle(playStyle);

  // 9. Action suggestions
  const userStatsForRules: UserStats = {
    shootInPenaltyRate: inBoxRate,
    shootOutPenaltyRate: 1 - inBoxRate,
    goalConversionRate,
    effectiveShootRate,
    goalOutPenaltyCount: myStats.reduce((a, s) => a + s.shoot.goalOutPenalty, 0),
    shootOutPenaltyCount: myStats.reduce((a, s) => a + s.shoot.shootOutPenalty, 0),
    passSuccessRate: totalPassRate,
    throughPassSuccessRate: throughPassRate,
    throughPassRate: safeDiv(totalThroughTry, totalPassTry),
    longPassSuccessRate: longPassRate,
    tackleSuccessRate: tackleRate,
    avgFoulsPerGame: avgFouls,
    avgYellowPerGame: avgYellow,
    lateConcedingRate: 0, // would need opponent shoot details
    avgPossession,
    winRate,
    topScorerGoalShare,
    topScorerName: `spId:${topScorer?.spId ?? 0}`,
    aerialSuccessRate: 0.5, // placeholder
    ratingStdDev: standardDeviation(myStats.map((s) => s.matchDetail.averageRating)),
  };
  const suggestions = evaluateRules(userStatsForRules);

  // 10. Outlier detection (on possession as example metric)
  const possessionValues = myStats.map((s) => s.matchDetail.possession);
  const outliers = detectOutliers(possessionValues);
  const outlierIndices = outliers.map((o) => o.index);

  // 11. Recent matches list
  const recentMatches: RecentMatch[] = matches.map((m, i) => {
    const my = extractMyInfo(m, ouid);
    const opponent = m.matchInfo.find((info) => info.ouid !== ouid);
    return {
      matchId: m.matchId,
      matchDate: m.matchDate,
      matchType: m.matchType,
      result: my?.matchDetail.matchResult ?? "?",
      possession: my?.matchDetail.possession ?? 0,
      shootTotal: my?.shoot.shootTotal ?? 0,
      effectiveShoot: my?.shoot.effectiveShootTotal ?? 0,
      passRate: my ? safeDiv(my.pass.passSuccess, my.pass.passTry) * 100 : 0,
      avgRating: my?.matchDetail.averageRating ?? 0,
      goalTotal: my?.shoot.goalTotal ?? 0,
      goalTotalDisplay: my?.shoot.goalTotalDisplay ?? 0,
      opponentGoalDisplay: opponent?.shoot.goalTotalDisplay ?? 0,
      isOutlier: outlierIndices.includes(i),
    };
  });

  const winRateCI = wilsonScore(wins, myStats.length);

  const summary: MatchSummary = {
    totalMatches: myStats.length,
    wins,
    draws,
    losses,
    winRate,
    avgPossession,
    avgRating,
    goalsPerGame: safeDiv(totalGoals, myStats.length),
    effectiveShotsPerGame: safeDiv(totalEffective, myStats.length),
    winRateCI,
  };

  return {
    user,
    maxDivisions,
    matches,
    myStats,
    summary,
    shootingStats,
    passingStats,
    defendingStats,
    playerStats,
    playStyle,
    mainStyle,
    suggestions,
    outlierIndices,
    reliability: reliabilityGrade(myStats.length),
    allShots,
    recentMatches,
  };
}
