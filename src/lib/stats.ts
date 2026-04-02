/**
 * FCLab 통계 함수 라이브러리
 * Constitution: Statistics-First, Type Safety
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function calculatePercentile(
  value: number,
  distribution: number[]
): { percentile: number; rank: string; sampleSize: number } {
  if (distribution.length === 0) {
    return { percentile: 0, rank: "하위 0%", sampleSize: 0 };
  }

  const sorted = [...distribution].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  const percentile = (below / sorted.length) * 100;
  const rounded = Math.round(percentile * 10) / 10;

  const rank =
    rounded >= 50
      ? `상위 ${Math.round(100 - rounded)}%`
      : `하위 ${Math.round(rounded)}%`;

  return { percentile: rounded, rank, sampleSize: sorted.length };
}

export function weightedMovingAverage(
  values: number[],
  window: number
): number[] {
  if (values.length < window || window <= 0) return [];

  const result: number[] = [];
  for (let i = 0; i <= values.length - window; i++) {
    const slice = values.slice(i, i + window);
    let weightedSum = 0;
    let weightTotal = 0;
    for (let j = 0; j < slice.length; j++) {
      const weight = slice.length - j; // 첫 번째(최신) 가중치 높음
      weightedSum += slice[j] * weight;
      weightTotal += weight;
    }
    result.push(weightedSum / weightTotal);
  }
  return result;
}

export function wilsonScore(
  successes: number,
  total: number,
  z: number = 1.96
): { lower: number; upper: number; center: number } {
  if (total === 0) return { lower: 0, upper: 0, center: 0 };

  const p = Math.min(successes / total, 1);
  const denominator = 1 + (z * z) / total;
  const center = (p + (z * z) / (2 * total)) / denominator;
  const margin =
    (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)) /
    denominator;

  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
    center,
  };
}

export function detectOutliers(
  values: number[],
  threshold: number = 2.0
): { index: number; value: number; zScore: number }[] {
  if (values.length <= 1) return [];

  const m = mean(values);
  const sd = standardDeviation(values);

  if (sd === 0) return [];

  return values
    .map((value, index) => ({
      index,
      value,
      zScore: (value - m) / sd,
    }))
    .filter((r) => Math.abs(r.zScore) > threshold);
}

export function cohensD(group1: number[], group2: number[]): number {
  if (group1.length === 0 || group2.length === 0) return 0;

  const m1 = mean(group1);
  const m2 = mean(group2);
  const sd1 = standardDeviation(group1);
  const sd2 = standardDeviation(group2);

  const pooledStd = Math.sqrt((sd1 ** 2 + sd2 ** 2) / 2);

  if (pooledStd === 0) return 0;

  return (m1 - m2) / pooledStd;
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error(
      `Array length mismatch: x(${x.length}) !== y(${y.length})`
    );
  }

  if (x.length === 0) return 0;

  const mx = mean(x);
  const my = mean(y);
  const sdx = standardDeviation(x);
  const sdy = standardDeviation(y);

  if (sdx === 0 || sdy === 0) return 0;

  const covariance =
    x.reduce((sum, xi, i) => sum + (xi - mx) * (y[i] - my), 0) / x.length;

  return covariance / (sdx * sdy);
}

export function reliabilityGrade(
  n: number
): "insufficient" | "limited" | "sufficient" {
  if (n < 5) return "insufficient";
  if (n < 15) return "limited";
  return "sufficient";
}
