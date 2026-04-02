/**
 * FCLab 액션 제안 규칙 엔진
 * Constitution: Statistics-First — 규칙 기반 (LLM 의존 X)
 */

export interface UserStats {
  // 슈팅
  shootInPenaltyRate: number; // 박스내 슈팅 비율 (0-1)
  shootOutPenaltyRate: number; // 박스밖 슈팅 비율 (0-1)
  goalConversionRate: number; // 골전환율 (0-1)
  effectiveShootRate: number; // 유효슈팅률 (0-1)
  goalOutPenaltyCount: number; // 박스밖 골 수
  shootOutPenaltyCount: number; // 박스밖 슈팅 수
  // 패스
  passSuccessRate: number; // 패스 성공률 (0-1)
  throughPassSuccessRate: number; // 스루패스 성공률 (0-1)
  throughPassRate: number; // 스루패스 비중 (0-1)
  longPassSuccessRate: number; // 롱패스 성공률 (0-1)
  // 수비
  tackleSuccessRate: number; // 태클 성공률 (0-1)
  avgFoulsPerGame: number;
  avgYellowPerGame: number;
  // 실점
  lateConcedingRate: number; // 75분 이후 실점 비율 (0-1)
  // 점유 & 전체
  avgPossession: number; // 평균 점유율 (0-100)
  winRate: number; // 승률 (0-1)
  // 선수 의존
  topScorerGoalShare: number; // 최다 득점자 골 비중 (0-1)
  topScorerName: string;
  // 공중볼
  aerialSuccessRate: number; // 공중볼 성공률 (0-1)
  // 평점
  ratingStdDev: number; // 평점 표준편차
  // 백분위 (일부 규칙에서 사용)
  passPercentile?: number;
  tacklePercentile?: number;
  effectiveShootPercentile?: number;
  foulPercentile?: number;
  aerialPercentile?: number;
}

export type Priority = "high" | "medium" | "low";
export type Category = "shooting" | "passing" | "defending" | "general";

export interface ActionRule {
  id: string;
  condition: (stats: UserStats) => boolean;
  suggestion: string;
  evidence: (stats: UserStats) => string;
  priority: Priority;
  category: Category;
}

export interface ActionSuggestion {
  id: string;
  suggestion: string;
  evidence: string;
  priority: Priority;
  category: Category;
}

const pct = (v: number): string => (v * 100).toFixed(1);

export const rules: ActionRule[] = [
  {
    id: "low-inbox-shooting",
    condition: (s) =>
      s.shootInPenaltyRate < 0.35 && s.goalConversionRate < 0.25,
    suggestion: "박스 안 침투 빈도를 높이세요",
    evidence: (s) =>
      `박스내 슈팅 비율 ${pct(s.shootInPenaltyRate)}% (상위권 평균 41%)`,
    priority: "high",
    category: "shooting",
  },
  {
    id: "excessive-longshot",
    condition: (s) =>
      s.shootOutPenaltyRate > 0.5 &&
      (s.shootOutPenaltyCount === 0 ||
        s.goalOutPenaltyCount / s.shootOutPenaltyCount < 0.05),
    suggestion: "중거리 슈팅을 줄이세요",
    evidence: (s) =>
      `박스밖 ${s.shootOutPenaltyCount}개 중 골 ${s.goalOutPenaltyCount}개`,
    priority: "high",
    category: "shooting",
  },
  {
    id: "low-effective-shoot",
    condition: (s) => s.effectiveShootRate < 0.4,
    suggestion: "슈팅 타이밍과 각도를 개선하세요",
    evidence: (s) =>
      `유효슈팅률 ${pct(s.effectiveShootRate)}%${s.effectiveShootPercentile != null ? ` (하위 ${s.effectiveShootPercentile}%)` : ""}`,
    priority: "high",
    category: "shooting",
  },
  {
    id: "low-pass-accuracy",
    condition: (s) => s.passSuccessRate < 0.75,
    suggestion: "안전한 숏패스 비중을 높이세요",
    evidence: (s) =>
      `패스 성공률 ${pct(s.passSuccessRate)}%${s.passPercentile != null ? ` (하위 ${s.passPercentile}%)` : ""}`,
    priority: "medium",
    category: "passing",
  },
  {
    id: "risky-through-pass",
    condition: (s) =>
      s.throughPassSuccessRate < 0.5 && s.throughPassRate > 0.2,
    suggestion: "스루패스 타이밍을 신중하게 선택하세요",
    evidence: (s) =>
      `스루패스 ${pct(s.throughPassSuccessRate)}% 성공, 비중 ${pct(s.throughPassRate)}%`,
    priority: "medium",
    category: "passing",
  },
  {
    id: "weak-longpass",
    condition: (s) => s.longPassSuccessRate < 0.4,
    suggestion: "롱패스 연습 또는 숏패스 전환을 권장합니다",
    evidence: (s) => `롱패스 성공률 ${pct(s.longPassSuccessRate)}%`,
    priority: "low",
    category: "passing",
  },
  {
    id: "low-tackle-rate",
    condition: (s) => s.tackleSuccessRate < 0.6,
    suggestion: "태클 타이밍을 보수적으로 가져가세요",
    evidence: (s) =>
      `태클 성공률 ${pct(s.tackleSuccessRate)}%${s.tacklePercentile != null ? ` (하위 ${s.tacklePercentile}%)` : ""}`,
    priority: "medium",
    category: "defending",
  },
  {
    id: "high-foul",
    condition: (s) => s.avgFoulsPerGame > 3,
    suggestion: "수비 접근 방식을 변경하세요",
    evidence: (s) =>
      `경기당 ${s.avgFoulsPerGame.toFixed(1)}회 파울${s.foulPercentile != null ? ` (상위 ${s.foulPercentile}%)` : ""}`,
    priority: "medium",
    category: "defending",
  },
  {
    id: "card-heavy",
    condition: (s) => s.avgYellowPerGame > 1,
    suggestion: "거친 태클을 자제하세요",
    evidence: (s) => `경기당 옐로 ${s.avgYellowPerGame.toFixed(1)}장`,
    priority: "high",
    category: "defending",
  },
  {
    id: "late-concede",
    condition: (s) => s.lateConcedingRate > 0.4,
    suggestion: "후반 수비 집중도를 개선하세요",
    evidence: (s) =>
      `75분+ 실점 ${pct(s.lateConcedingRate)}% (전체 실점 대비)`,
    priority: "high",
    category: "defending",
  },
  {
    id: "low-possession",
    condition: (s) => s.avgPossession < 40 && s.winRate < 0.5,
    suggestion: "볼 소유 시간을 늘리세요",
    evidence: (s) =>
      `점유율 ${s.avgPossession.toFixed(1)}% + 승률 ${pct(s.winRate)}%`,
    priority: "medium",
    category: "general",
  },
  {
    id: "possession-no-result",
    condition: (s) => s.avgPossession > 60 && s.winRate < 0.45,
    suggestion: "점유 대비 결정력이 부족합니다",
    evidence: (s) =>
      `높은 점유(${s.avgPossession.toFixed(1)}%) 대비 승률 ${pct(s.winRate)}%`,
    priority: "high",
    category: "general",
  },
  {
    id: "one-man-team",
    condition: (s) => s.topScorerGoalShare > 0.6,
    suggestion: "득점원을 다변화하세요",
    evidence: (s) =>
      `${s.topScorerName}에 골 ${pct(s.topScorerGoalShare)}% 의존`,
    priority: "medium",
    category: "general",
  },
  {
    id: "aerial-weakness",
    condition: (s) => s.aerialSuccessRate < 0.3,
    suggestion: "공중전 대비 전술을 조정하세요",
    evidence: (s) =>
      `공중볼 ${pct(s.aerialSuccessRate)}% 성공${s.aerialPercentile != null ? ` (하위 ${s.aerialPercentile}%)` : ""}`,
    priority: "low",
    category: "defending",
  },
  {
    id: "rating-inconsistency",
    condition: (s) => s.ratingStdDev > 2.0,
    suggestion: "안정적인 플레이를 추구하세요",
    evidence: (s) =>
      `평점 편차 ${s.ratingStdDev.toFixed(1)} (변동 심함)`,
    priority: "medium",
    category: "general",
  },
];

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function evaluateRules(
  stats: UserStats,
  maxResults: number = 5
): ActionSuggestion[] {
  return rules
    .filter((rule) => rule.condition(stats))
    .map((rule) => ({
      id: rule.id,
      suggestion: rule.suggestion,
      evidence: rule.evidence(stats),
      priority: rule.priority,
      category: rule.category,
    }))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, maxResults);
}
