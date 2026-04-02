import { describe, it, expect } from "vitest";
import {
  mean,
  standardDeviation,
  calculatePercentile,
  weightedMovingAverage,
  wilsonScore,
  detectOutliers,
  cohensD,
  pearsonCorrelation,
  reliabilityGrade,
} from "@/lib/stats";

// ============================================================================
// mean
// ============================================================================
describe("mean", () => {
  it("returns 0 for empty array", () => {
    expect(mean([])).toBe(0);
  });

  it("returns the single value for n=1", () => {
    expect(mean([42])).toBe(42);
  });

  it("calculates mean of positive numbers", () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
  });

  it("handles negative numbers", () => {
    expect(mean([-10, 10])).toBe(0);
  });

  it("handles all same values", () => {
    expect(mean([7, 7, 7])).toBe(7);
  });
});

// ============================================================================
// standardDeviation
// ============================================================================
describe("standardDeviation", () => {
  it("returns 0 for empty array", () => {
    expect(standardDeviation([])).toBe(0);
  });

  it("returns 0 for single element", () => {
    expect(standardDeviation([5])).toBe(0);
  });

  it("returns 0 for all same values", () => {
    expect(standardDeviation([3, 3, 3, 3])).toBe(0);
  });

  it("calculates population stddev correctly", () => {
    // [2, 4, 4, 4, 5, 5, 7, 9] → mean=5, variance=4, stddev=2
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2, 5);
  });

  it("handles large spread", () => {
    expect(standardDeviation([0, 100])).toBeCloseTo(50, 5);
  });
});

// ============================================================================
// calculatePercentile
// ============================================================================
describe("calculatePercentile", () => {
  it("returns 0 percentile for empty distribution", () => {
    const result = calculatePercentile(50, []);
    expect(result.percentile).toBe(0);
    expect(result.sampleSize).toBe(0);
  });

  it("handles single-element distribution equal to value", () => {
    const result = calculatePercentile(10, [10]);
    expect(result.percentile).toBe(0);
    expect(result.sampleSize).toBe(1);
  });

  it("calculates percentile for typical distribution", () => {
    const dist = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const result = calculatePercentile(75, dist);
    expect(result.percentile).toBeGreaterThan(60);
    expect(result.percentile).toBeLessThan(80);
    expect(result.sampleSize).toBe(10);
  });

  it("returns rank string with 상위 for high percentile", () => {
    const dist = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const result = calculatePercentile(95, dist);
    expect(result.rank).toMatch(/상위/);
  });

  it("returns rank string with 하위 for low percentile", () => {
    const dist = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const result = calculatePercentile(15, dist);
    expect(result.rank).toMatch(/하위/);
  });

  it("value below all → percentile 0", () => {
    const result = calculatePercentile(0, [10, 20, 30]);
    expect(result.percentile).toBe(0);
  });

  it("value above all → percentile 100", () => {
    const result = calculatePercentile(100, [10, 20, 30]);
    expect(result.percentile).toBe(100);
  });
});

// ============================================================================
// weightedMovingAverage
// ============================================================================
describe("weightedMovingAverage", () => {
  it("returns empty for empty values", () => {
    expect(weightedMovingAverage([], 3)).toEqual([]);
  });

  it("returns empty when window > values length", () => {
    expect(weightedMovingAverage([1, 2], 3)).toEqual([]);
  });

  it("returns single WMA when window equals length", () => {
    // [1, 0, 1, 1, 0], window=5
    // weights: [5,4,3,2,1], sum = 5+0+3+2+0=10, total=15
    const result = weightedMovingAverage([1, 0, 1, 1, 0], 5);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeCloseTo(10 / 15, 5);
  });

  it("slides window correctly", () => {
    const result = weightedMovingAverage([1, 2, 3, 4, 5], 3);
    // window [1,2,3]: (1*3+2*2+3*1)/(3+2+1) = 10/6
    // window [2,3,4]: (2*3+3*2+4*1)/(6) = 16/6
    // window [3,4,5]: (3*3+4*2+5*1)/(6) = 22/6
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(10 / 6, 5);
    expect(result[1]).toBeCloseTo(16 / 6, 5);
    expect(result[2]).toBeCloseTo(22 / 6, 5);
  });

  it("window=1 returns original values", () => {
    expect(weightedMovingAverage([3, 1, 4], 1)).toEqual([3, 1, 4]);
  });
});

// ============================================================================
// wilsonScore
// ============================================================================
describe("wilsonScore", () => {
  it("returns {0,0,0} for total=0", () => {
    const result = wilsonScore(0, 0);
    expect(result).toEqual({ lower: 0, upper: 0, center: 0 });
  });

  it("handles perfect success", () => {
    const result = wilsonScore(20, 20);
    expect(result.center).toBeGreaterThan(0.8);
    expect(result.upper).toBeLessThanOrEqual(1);
    expect(result.lower).toBeGreaterThan(0);
  });

  it("handles zero successes", () => {
    const result = wilsonScore(0, 20);
    expect(result.lower).toBe(0);
    expect(result.center).toBeGreaterThan(0);
    expect(result.upper).toBeGreaterThan(0);
  });

  it("wider interval for small sample", () => {
    const small = wilsonScore(3, 5);
    const large = wilsonScore(60, 100);
    const smallWidth = small.upper - small.lower;
    const largeWidth = large.upper - large.lower;
    expect(smallWidth).toBeGreaterThan(largeWidth);
  });

  it("lower ≤ center ≤ upper always", () => {
    const result = wilsonScore(13, 20);
    expect(result.lower).toBeLessThanOrEqual(result.center);
    expect(result.center).toBeLessThanOrEqual(result.upper);
  });

  it("successes > total clamps upper to 1", () => {
    // edge case: shouldn't happen but be defensive
    const result = wilsonScore(25, 20);
    expect(result.upper).toBeLessThanOrEqual(1);
  });

  it("custom z value changes interval width", () => {
    const z90 = wilsonScore(10, 20, 1.645);
    const z95 = wilsonScore(10, 20, 1.96);
    const w90 = z90.upper - z90.lower;
    const w95 = z95.upper - z95.lower;
    expect(w95).toBeGreaterThan(w90);
  });
});

// ============================================================================
// detectOutliers
// ============================================================================
describe("detectOutliers", () => {
  it("returns empty for empty array", () => {
    expect(detectOutliers([])).toEqual([]);
  });

  it("returns empty for single element", () => {
    expect(detectOutliers([5])).toEqual([]);
  });

  it("returns empty when all values are the same (stddev=0)", () => {
    expect(detectOutliers([3, 3, 3, 3])).toEqual([]);
  });

  it("detects extreme outlier", () => {
    const values = [10, 11, 10, 12, 10, 11, 10, 100]; // 100 is outlier
    const result = detectOutliers(values);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((r) => r.value === 100)).toBe(true);
  });

  it("returns index and zScore", () => {
    const values = [10, 10, 10, 10, 10, 10, 10, 100];
    const result = detectOutliers(values);
    expect(result.length).toBeGreaterThan(0);
    const outlier = result.find((r) => r.value === 100);
    expect(outlier).toBeDefined();
    expect(outlier!.index).toBe(7);
    expect(Math.abs(outlier!.zScore)).toBeGreaterThan(2);
  });

  it("respects custom threshold", () => {
    const values = [10, 10, 10, 10, 20];
    const loose = detectOutliers(values, 3);
    const strict = detectOutliers(values, 1);
    expect(strict.length).toBeGreaterThanOrEqual(loose.length);
  });
});

// ============================================================================
// cohensD
// ============================================================================
describe("cohensD", () => {
  it("returns 0 for identical groups", () => {
    expect(cohensD([5, 5, 5], [5, 5, 5])).toBe(0);
  });

  it("returns 0 for empty groups", () => {
    expect(cohensD([], [])).toBe(0);
  });

  it("computes positive d when group1 > group2", () => {
    const d = cohensD([10, 12, 14], [2, 4, 6]);
    expect(d).toBeGreaterThan(0);
  });

  it("computes negative d when group1 < group2", () => {
    const d = cohensD([2, 4, 6], [10, 12, 14]);
    expect(d).toBeLessThan(0);
  });

  it("known value check", () => {
    // group1 mean=5, group2 mean=10, both stddev≈1
    const g1 = [4, 5, 6];
    const g2 = [9, 10, 11];
    const d = cohensD(g1, g2);
    // population stddev of [4,5,6] = sqrt(2/3) ≈ 0.816
    // pooled = sqrt((0.816^2 + 0.816^2)/2) ≈ 0.816
    // d = (5-10)/0.816 ≈ -6.12
    expect(d).toBeCloseTo(-6.12, 0);
  });
});

// ============================================================================
// pearsonCorrelation
// ============================================================================
describe("pearsonCorrelation", () => {
  it("returns 0 for empty arrays", () => {
    expect(pearsonCorrelation([], [])).toBe(0);
  });

  it("returns 1 for perfect positive correlation", () => {
    expect(pearsonCorrelation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 5);
  });

  it("returns -1 for perfect negative correlation", () => {
    expect(pearsonCorrelation([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1, 5);
  });

  it("returns 0 for no correlation", () => {
    const r = pearsonCorrelation([1, 2, 3, 4], [1, -1, 1, -1]);
    expect(Math.abs(r)).toBeLessThan(0.5);
  });

  it("throws for mismatched lengths", () => {
    expect(() => pearsonCorrelation([1, 2], [1])).toThrow();
  });

  it("returns 0 for constant arrays (stddev=0)", () => {
    expect(pearsonCorrelation([5, 5, 5], [1, 2, 3])).toBe(0);
  });
});

// ============================================================================
// reliabilityGrade
// ============================================================================
describe("reliabilityGrade", () => {
  it("insufficient for n=0", () => {
    expect(reliabilityGrade(0)).toBe("insufficient");
  });

  it("insufficient for n=4", () => {
    expect(reliabilityGrade(4)).toBe("insufficient");
  });

  it("limited for n=5", () => {
    expect(reliabilityGrade(5)).toBe("limited");
  });

  it("limited for n=14", () => {
    expect(reliabilityGrade(14)).toBe("limited");
  });

  it("sufficient for n=15", () => {
    expect(reliabilityGrade(15)).toBe("sufficient");
  });

  it("sufficient for n=100", () => {
    expect(reliabilityGrade(100)).toBe("sufficient");
  });

  it("insufficient for negative n", () => {
    expect(reliabilityGrade(-1)).toBe("insufficient");
  });
});
