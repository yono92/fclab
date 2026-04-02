import { describe, it, expect } from "vitest";
import {
  classifyPlayStyle,
  getMainStyle,
  type PlayStyleInput,
  type PlayStyle,
} from "@/lib/play-style";

function makeInput(overrides: Partial<PlayStyleInput> = {}): PlayStyleInput {
  return {
    avgPossession: 50,
    passTriesPerGame: 200,
    effectiveShootRate: 0.5,
    tackleTriesPerGame: 10,
    interceptPerGame: 5,
    shootsPerGame: 5,
    shootZoneDiversity: 50,
    shortPassRate: 0.5,
    shortPassSuccessRate: 0.8,
    passTriesPercentile: 50,
    tackleTriesPercentile: 50,
    interceptPercentile: 50,
    shootsPercentile: 50,
    ...overrides,
  };
}

describe("classifyPlayStyle", () => {
  it("returns all 5 axes", () => {
    const style = classifyPlayStyle(makeInput());
    expect(style).toHaveProperty("possession");
    expect(style).toHaveProperty("counter");
    expect(style).toHaveProperty("pressing");
    expect(style).toHaveProperty("shooting");
    expect(style).toHaveProperty("buildup");
  });

  it("all values are between 0 and 100", () => {
    const style = classifyPlayStyle(makeInput());
    for (const v of Object.values(style)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("high possession input → high possession score", () => {
    const style = classifyPlayStyle(
      makeInput({ avgPossession: 80, passTriesPercentile: 90 })
    );
    expect(style.possession).toBeGreaterThan(70);
  });

  it("low possession + high effective shoot → high counter", () => {
    const style = classifyPlayStyle(
      makeInput({ avgPossession: 30, effectiveShootRate: 0.8 })
    );
    expect(style.counter).toBeGreaterThan(50);
  });

  it("high tackle + intercept percentile → high pressing", () => {
    const style = classifyPlayStyle(
      makeInput({ tackleTriesPercentile: 90, interceptPercentile: 90 })
    );
    expect(style.pressing).toBeGreaterThan(80);
  });

  it("high shoots + zone diversity → high shooting", () => {
    const style = classifyPlayStyle(
      makeInput({ shootsPercentile: 90, shootZoneDiversity: 90 })
    );
    expect(style.shooting).toBeGreaterThan(80);
  });

  it("high short pass rate + success → high buildup", () => {
    const style = classifyPlayStyle(
      makeInput({ shortPassRate: 0.9, shortPassSuccessRate: 0.95 })
    );
    expect(style.buildup).toBeGreaterThan(80);
  });

  it("extreme low values clamped to 0", () => {
    const style = classifyPlayStyle(
      makeInput({
        avgPossession: 0,
        passTriesPercentile: 0,
        effectiveShootRate: 0,
        tackleTriesPercentile: 0,
        interceptPercentile: 0,
        shootsPercentile: 0,
        shootZoneDiversity: 0,
        shortPassRate: 0,
        shortPassSuccessRate: 0,
      })
    );
    for (const v of Object.values(style)) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("getMainStyle", () => {
  it("returns possession style when it's highest", () => {
    const style: PlayStyle = {
      possession: 90,
      counter: 30,
      pressing: 40,
      shooting: 50,
      buildup: 60,
    };
    const main = getMainStyle(style);
    expect(main.name).toBe("점유형 플레이어");
    expect(main.score).toBe(90);
  });

  it("returns counter style when it's highest", () => {
    const main = getMainStyle({
      possession: 30,
      counter: 85,
      pressing: 40,
      shooting: 50,
      buildup: 60,
    });
    expect(main.name).toBe("역습형 플레이어");
  });

  it("returns pressing style when it's highest", () => {
    const main = getMainStyle({
      possession: 30,
      counter: 40,
      pressing: 95,
      shooting: 50,
      buildup: 60,
    });
    expect(main.name).toBe("프레싱형 플레이어");
  });

  it("returns shooting style when it's highest", () => {
    const main = getMainStyle({
      possession: 30,
      counter: 40,
      pressing: 50,
      shooting: 92,
      buildup: 60,
    });
    expect(main.name).toBe("슈팅형 플레이어");
  });

  it("returns buildup style when it's highest", () => {
    const main = getMainStyle({
      possession: 30,
      counter: 40,
      pressing: 50,
      shooting: 60,
      buildup: 88,
    });
    expect(main.name).toBe("빌드업형 플레이어");
  });

  it("always returns description string", () => {
    const main = getMainStyle({
      possession: 50,
      counter: 50,
      pressing: 50,
      shooting: 50,
      buildup: 51,
    });
    expect(main.description.length).toBeGreaterThan(0);
  });
});
