/**
 * FCLab 플레이 스타일 분류
 * 5축(점유/역습/프레싱/슈팅/빌드업) 0-100 점수
 */

export interface PlayStyleInput {
  avgPossession: number; // 0-100
  passTriesPerGame: number; // 경기당 패스 시도
  effectiveShootRate: number; // 0-1
  tackleTriesPerGame: number; // 경기당 태클 시도
  interceptPerGame: number; // 경기당 인터셉트
  shootsPerGame: number; // 경기당 슈팅 수
  shootZoneDiversity: number; // 슈팅 존 다양성 0-100
  shortPassRate: number; // 숏패스 비율 0-1
  shortPassSuccessRate: number; // 숏패스 성공률 0-1
  // 백분위 (0-100)
  passTriesPercentile: number;
  tackleTriesPercentile: number;
  interceptPercentile: number;
  shootsPercentile: number;
}

export interface PlayStyle {
  possession: number;
  counter: number;
  pressing: number;
  shooting: number;
  buildup: number;
}

export interface MainStyleResult {
  name: string;
  score: number;
  description: string;
}

const clamp = (v: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, v));

export function classifyPlayStyle(stats: PlayStyleInput): PlayStyle {
  const possession = clamp(
    stats.avgPossession * 0.6 + stats.passTriesPercentile * 0.4
  );

  const counter = clamp(
    (100 - stats.avgPossession) * 0.4 + stats.effectiveShootRate * 100 * 0.6
  );

  const pressing = clamp(
    stats.tackleTriesPercentile * 0.5 + stats.interceptPercentile * 0.5
  );

  const shooting = clamp(
    stats.shootsPercentile * 0.5 + stats.shootZoneDiversity * 0.5
  );

  const buildup = clamp(
    stats.shortPassRate * 100 * 0.4 + stats.shortPassSuccessRate * 100 * 0.6
  );

  return {
    possession: Math.round(possession * 10) / 10,
    counter: Math.round(counter * 10) / 10,
    pressing: Math.round(pressing * 10) / 10,
    shooting: Math.round(shooting * 10) / 10,
    buildup: Math.round(buildup * 10) / 10,
  };
}

const styleNames: Record<keyof PlayStyle, { name: string; desc: string }> = {
  possession: { name: "점유형 플레이어", desc: "볼 소유와 패스로 경기를 지배합니다" },
  counter: { name: "역습형 플레이어", desc: "효율적인 슈팅으로 기회를 살립니다" },
  pressing: { name: "프레싱형 플레이어", desc: "적극적인 수비로 상대를 압박합니다" },
  shooting: { name: "슈팅형 플레이어", desc: "다양한 위치에서 적극적으로 슈팅합니다" },
  buildup: { name: "빌드업형 플레이어", desc: "정확한 숏패스로 공격을 전개합니다" },
};

export function getMainStyle(style: PlayStyle): MainStyleResult {
  const entries = Object.entries(style) as [keyof PlayStyle, number][];
  const [topKey, topScore] = entries.reduce((best, curr) =>
    curr[1] > best[1] ? curr : best
  );

  const info = styleNames[topKey];
  return {
    name: info.name,
    score: topScore,
    description: info.desc,
  };
}
