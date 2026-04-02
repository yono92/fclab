import { describe, it, expect } from "vitest";
import {
  evaluateRules,
  rules,
  type UserStats,
  type ActionSuggestion,
} from "@/lib/action-rules";

/** Helper: creates a "clean" stats object where no rule fires */
function cleanStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    shootInPenaltyRate: 0.5,
    shootOutPenaltyRate: 0.3,
    goalConversionRate: 0.35,
    effectiveShootRate: 0.6,
    goalOutPenaltyCount: 2,
    shootOutPenaltyCount: 5,
    passSuccessRate: 0.85,
    throughPassSuccessRate: 0.7,
    throughPassRate: 0.1,
    longPassSuccessRate: 0.6,
    tackleSuccessRate: 0.75,
    avgFoulsPerGame: 1.5,
    avgYellowPerGame: 0.3,
    lateConcedingRate: 0.2,
    avgPossession: 52,
    winRate: 0.6,
    topScorerGoalShare: 0.3,
    topScorerName: "메시",
    aerialSuccessRate: 0.5,
    ratingStdDev: 1.0,
    ...overrides,
  };
}

// ============================================================================
// evaluateRules 기본 동작
// ============================================================================
describe("evaluateRules", () => {
  it("returns empty array when no rules match", () => {
    const result = evaluateRules(cleanStats());
    expect(result).toEqual([]);
  });

  it("returns at most 5 suggestions by default", () => {
    const badStats = cleanStats({
      shootInPenaltyRate: 0.1,
      goalConversionRate: 0.1,
      shootOutPenaltyRate: 0.6,
      goalOutPenaltyCount: 0,
      shootOutPenaltyCount: 10,
      effectiveShootRate: 0.2,
      passSuccessRate: 0.5,
      tackleSuccessRate: 0.3,
      avgFoulsPerGame: 5,
      avgYellowPerGame: 2,
      lateConcedingRate: 0.6,
      avgPossession: 30,
      winRate: 0.2,
      topScorerGoalShare: 0.8,
      aerialSuccessRate: 0.1,
      ratingStdDev: 3.0,
      throughPassSuccessRate: 0.3,
      throughPassRate: 0.3,
      longPassSuccessRate: 0.2,
    });
    const result = evaluateRules(badStats);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("respects custom maxResults", () => {
    const badStats = cleanStats({
      shootInPenaltyRate: 0.1,
      goalConversionRate: 0.1,
      effectiveShootRate: 0.2,
      passSuccessRate: 0.5,
    });
    const result = evaluateRules(badStats, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("sorts by priority: high first", () => {
    const stats = cleanStats({
      passSuccessRate: 0.5, // medium: low-pass-accuracy
      effectiveShootRate: 0.2, // high: low-effective-shoot
      longPassSuccessRate: 0.2, // low: weak-longpass
    });
    const result = evaluateRules(stats);
    if (result.length >= 2) {
      const priorities = result.map((r) => r.priority);
      const order = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < priorities.length; i++) {
        expect(order[priorities[i]]).toBeGreaterThanOrEqual(
          order[priorities[i - 1]]
        );
      }
    }
  });

  it("each suggestion has required fields", () => {
    const stats = cleanStats({ effectiveShootRate: 0.2 });
    const result = evaluateRules(stats);
    for (const s of result) {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("suggestion");
      expect(s).toHaveProperty("evidence");
      expect(s).toHaveProperty("priority");
      expect(s).toHaveProperty("category");
    }
  });
});

// ============================================================================
// 개별 규칙 테스트 (15개)
// ============================================================================
describe("rule: low-inbox-shooting", () => {
  it("fires when box rate < 35% AND conversion < 25%", () => {
    const r = evaluateRules(
      cleanStats({ shootInPenaltyRate: 0.2, goalConversionRate: 0.15 })
    );
    expect(r.some((s) => s.id === "low-inbox-shooting")).toBe(true);
  });

  it("does NOT fire when box rate >= 35%", () => {
    const r = evaluateRules(
      cleanStats({ shootInPenaltyRate: 0.4, goalConversionRate: 0.15 })
    );
    expect(r.some((s) => s.id === "low-inbox-shooting")).toBe(false);
  });

  it("does NOT fire when conversion >= 25%", () => {
    const r = evaluateRules(
      cleanStats({ shootInPenaltyRate: 0.2, goalConversionRate: 0.3 })
    );
    expect(r.some((s) => s.id === "low-inbox-shooting")).toBe(false);
  });
});

describe("rule: excessive-longshot", () => {
  it("fires when out-penalty > 50% AND conversion < 5%", () => {
    const r = evaluateRules(
      cleanStats({
        shootOutPenaltyRate: 0.6,
        goalOutPenaltyCount: 0,
        shootOutPenaltyCount: 10,
      })
    );
    expect(r.some((s) => s.id === "excessive-longshot")).toBe(true);
  });

  it("does NOT fire when out-penalty <= 50%", () => {
    const r = evaluateRules(
      cleanStats({
        shootOutPenaltyRate: 0.4,
        goalOutPenaltyCount: 0,
        shootOutPenaltyCount: 10,
      })
    );
    expect(r.some((s) => s.id === "excessive-longshot")).toBe(false);
  });
});

describe("rule: low-effective-shoot", () => {
  it("fires when effective shoot rate < 40%", () => {
    const r = evaluateRules(cleanStats({ effectiveShootRate: 0.3 }));
    expect(r.some((s) => s.id === "low-effective-shoot")).toBe(true);
  });

  it("does NOT fire when rate >= 40%", () => {
    const r = evaluateRules(cleanStats({ effectiveShootRate: 0.5 }));
    expect(r.some((s) => s.id === "low-effective-shoot")).toBe(false);
  });
});

describe("rule: low-pass-accuracy", () => {
  it("fires when pass rate < 75%", () => {
    const r = evaluateRules(cleanStats({ passSuccessRate: 0.6 }));
    expect(r.some((s) => s.id === "low-pass-accuracy")).toBe(true);
  });

  it("does NOT fire when rate >= 75%", () => {
    const r = evaluateRules(cleanStats({ passSuccessRate: 0.8 }));
    expect(r.some((s) => s.id === "low-pass-accuracy")).toBe(false);
  });
});

describe("rule: risky-through-pass", () => {
  it("fires when success < 50% AND rate > 20%", () => {
    const r = evaluateRules(
      cleanStats({ throughPassSuccessRate: 0.3, throughPassRate: 0.25 })
    );
    expect(r.some((s) => s.id === "risky-through-pass")).toBe(true);
  });

  it("does NOT fire when rate <= 20%", () => {
    const r = evaluateRules(
      cleanStats({ throughPassSuccessRate: 0.3, throughPassRate: 0.1 })
    );
    expect(r.some((s) => s.id === "risky-through-pass")).toBe(false);
  });
});

describe("rule: weak-longpass", () => {
  it("fires when long pass rate < 40%", () => {
    const r = evaluateRules(cleanStats({ longPassSuccessRate: 0.3 }));
    expect(r.some((s) => s.id === "weak-longpass")).toBe(true);
  });

  it("does NOT fire when rate >= 40%", () => {
    const r = evaluateRules(cleanStats({ longPassSuccessRate: 0.5 }));
    expect(r.some((s) => s.id === "weak-longpass")).toBe(false);
  });
});

describe("rule: low-tackle-rate", () => {
  it("fires when tackle rate < 60%", () => {
    const r = evaluateRules(cleanStats({ tackleSuccessRate: 0.4 }));
    expect(r.some((s) => s.id === "low-tackle-rate")).toBe(true);
  });

  it("does NOT fire when rate >= 60%", () => {
    const r = evaluateRules(cleanStats({ tackleSuccessRate: 0.7 }));
    expect(r.some((s) => s.id === "low-tackle-rate")).toBe(false);
  });
});

describe("rule: high-foul", () => {
  it("fires when fouls > 3", () => {
    const r = evaluateRules(cleanStats({ avgFoulsPerGame: 4 }));
    expect(r.some((s) => s.id === "high-foul")).toBe(true);
  });

  it("does NOT fire when fouls <= 3", () => {
    const r = evaluateRules(cleanStats({ avgFoulsPerGame: 2 }));
    expect(r.some((s) => s.id === "high-foul")).toBe(false);
  });
});

describe("rule: card-heavy", () => {
  it("fires when yellow > 1", () => {
    const r = evaluateRules(cleanStats({ avgYellowPerGame: 1.5 }));
    expect(r.some((s) => s.id === "card-heavy")).toBe(true);
  });

  it("does NOT fire when yellow <= 1", () => {
    const r = evaluateRules(cleanStats({ avgYellowPerGame: 0.5 }));
    expect(r.some((s) => s.id === "card-heavy")).toBe(false);
  });
});

describe("rule: late-concede", () => {
  it("fires when late conceding > 40%", () => {
    const r = evaluateRules(cleanStats({ lateConcedingRate: 0.5 }));
    expect(r.some((s) => s.id === "late-concede")).toBe(true);
  });

  it("does NOT fire when rate <= 40%", () => {
    const r = evaluateRules(cleanStats({ lateConcedingRate: 0.3 }));
    expect(r.some((s) => s.id === "late-concede")).toBe(false);
  });
});

describe("rule: low-possession", () => {
  it("fires when possession < 40 AND win rate < 50%", () => {
    const r = evaluateRules(
      cleanStats({ avgPossession: 35, winRate: 0.4 })
    );
    expect(r.some((s) => s.id === "low-possession")).toBe(true);
  });

  it("does NOT fire when possession >= 40", () => {
    const r = evaluateRules(
      cleanStats({ avgPossession: 45, winRate: 0.4 })
    );
    expect(r.some((s) => s.id === "low-possession")).toBe(false);
  });
});

describe("rule: possession-no-result", () => {
  it("fires when possession > 60 AND win rate < 45%", () => {
    const r = evaluateRules(
      cleanStats({ avgPossession: 65, winRate: 0.3 })
    );
    expect(r.some((s) => s.id === "possession-no-result")).toBe(true);
  });

  it("does NOT fire when win rate >= 45%", () => {
    const r = evaluateRules(
      cleanStats({ avgPossession: 65, winRate: 0.5 })
    );
    expect(r.some((s) => s.id === "possession-no-result")).toBe(false);
  });
});

describe("rule: one-man-team", () => {
  it("fires when top scorer share > 60%", () => {
    const r = evaluateRules(
      cleanStats({ topScorerGoalShare: 0.7, topScorerName: "호날두" })
    );
    expect(r.some((s) => s.id === "one-man-team")).toBe(true);
  });

  it("evidence includes player name", () => {
    const r = evaluateRules(
      cleanStats({ topScorerGoalShare: 0.7, topScorerName: "호날두" })
    );
    const s = r.find((s) => s.id === "one-man-team");
    expect(s?.evidence).toContain("호날두");
  });

  it("does NOT fire when share <= 60%", () => {
    const r = evaluateRules(cleanStats({ topScorerGoalShare: 0.4 }));
    expect(r.some((s) => s.id === "one-man-team")).toBe(false);
  });
});

describe("rule: aerial-weakness", () => {
  it("fires when aerial rate < 30%", () => {
    const r = evaluateRules(cleanStats({ aerialSuccessRate: 0.2 }));
    expect(r.some((s) => s.id === "aerial-weakness")).toBe(true);
  });

  it("does NOT fire when rate >= 30%", () => {
    const r = evaluateRules(cleanStats({ aerialSuccessRate: 0.5 }));
    expect(r.some((s) => s.id === "aerial-weakness")).toBe(false);
  });
});

describe("rule: rating-inconsistency", () => {
  it("fires when stddev > 2.0", () => {
    const r = evaluateRules(cleanStats({ ratingStdDev: 2.5 }));
    expect(r.some((s) => s.id === "rating-inconsistency")).toBe(true);
  });

  it("does NOT fire when stddev <= 2.0", () => {
    const r = evaluateRules(cleanStats({ ratingStdDev: 1.5 }));
    expect(r.some((s) => s.id === "rating-inconsistency")).toBe(false);
  });
});

// ============================================================================
// 규칙 메타
// ============================================================================
describe("rules metadata", () => {
  it("has exactly 15 rules", () => {
    expect(rules).toHaveLength(15);
  });

  it("all rules have unique ids", () => {
    const ids = rules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
