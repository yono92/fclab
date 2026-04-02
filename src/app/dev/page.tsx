"use client";

import { TrustBadge } from "@/components/analysis/TrustBadge";
import { PercentileGauge } from "@/components/analysis/PercentileGauge";
import { StatCard } from "@/components/analysis/StatCard";
import { ActionSuggestionCard } from "@/components/analysis/ActionSuggestionCard";
import { ShootingHeatmap } from "@/components/charts/ShootingHeatmap";
import { PlayStyleRadar } from "@/components/charts/PlayStyleRadar";
import type { ActionSuggestion } from "@/lib/action-rules";

const sampleSuggestions: ActionSuggestion[] = [
  {
    id: "low-inbox-shooting",
    suggestion: "박스 안 침투 빈도를 높이세요",
    evidence: "박스내 슈팅 비율 23.5% (상위권 평균 41%)",
    priority: "high",
    category: "shooting",
  },
  {
    id: "risky-through-pass",
    suggestion: "스루패스 타이밍을 신중하게 선택하세요",
    evidence: "스루패스 42.1% 성공, 비중 25.0%",
    priority: "medium",
    category: "passing",
  },
  {
    id: "weak-longpass",
    suggestion: "롱패스 연습 또는 숏패스 전환을 권장합니다",
    evidence: "롱패스 성공률 38.2%",
    priority: "low",
    category: "passing",
  },
];

const sampleShots = [
  { x: 0.92, y: 0.45, result: 1, goalTime: 1920, spId: 272167135, inPenalty: true },
  { x: 0.88, y: 0.55, result: 2, goalTime: 2700, spId: 272167135, inPenalty: true },
  { x: 0.75, y: 0.3, result: 3, goalTime: 3600, spId: 277205401, inPenalty: false },
  { x: 0.95, y: 0.5, result: 1, goalTime: 4680, spId: 272167135, inPenalty: true },
  { x: 0.7, y: 0.6, result: 3, goalTime: 900, spId: 277205401, inPenalty: false },
  { x: 0.91, y: 0.35, result: 2, goalTime: 1500, spId: 272167135, inPenalty: true },
  { x: 0.6, y: 0.5, result: 3, goalTime: 2100, spId: 277205401, inPenalty: false },
  { x: 0.93, y: 0.6, result: 1, goalTime: 4200, spId: 272167135, inPenalty: true },
];

const sampleStyle = {
  possession: 72,
  counter: 35,
  pressing: 48,
  shooting: 61,
  buildup: 78,
};

export default function DevPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">컴포넌트 미리보기</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">TrustBadge</h2>
        <div className="space-y-3">
          <TrustBadge
            sampleSize={20}
            dateRange={[new Date("2026-03-15"), new Date("2026-04-01")]}
            lastUpdated={new Date("2026-04-02T13:00:00")}
            matchType="공식경기"
          />
          <TrustBadge
            sampleSize={8}
            dateRange={[new Date("2026-03-28"), new Date("2026-04-01")]}
            lastUpdated={new Date("2026-04-02T13:00:00")}
            matchType="감독모드"
          />
          <TrustBadge
            sampleSize={3}
            dateRange={[new Date("2026-03-30"), new Date("2026-04-01")]}
            lastUpdated={new Date("2026-04-02T13:00:00")}
            matchType="공식경기"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">PercentileGauge</h2>
        <div className="space-y-4 max-w-md">
          <PercentileGauge label="유효슈팅률" value={62.3} unit="%" percentile={82} benchmark={75} />
          <PercentileGauge label="골전환율" value={28.1} unit="%" percentile={75} />
          <PercentileGauge label="헤딩골 비율" value={15.0} unit="%" percentile={42} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">StatCard</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard title="승률" value="65%" trend="up" percentile={78} />
          <StatCard title="경기당 골" value="1.8" trend="flat" subtitle="최근 20경기" />
          <StatCard title="점유율" value="52.3%" trend="down" percentile={55} />
          <StatCard title="평균 평점" value="6.8" subtitle="경기당" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">ActionSuggestionCard</h2>
        <ActionSuggestionCard suggestions={sampleSuggestions} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">ShootingHeatmap</h2>
        <ShootingHeatmap shots={sampleShots} showZones />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">PlayStyleRadar</h2>
        <div className="max-w-md">
          <PlayStyleRadar
            style={sampleStyle}
            rankerStyle={{ possession: 55, counter: 60, pressing: 65, shooting: 70, buildup: 50 }}
          />
        </div>
      </section>
    </div>
  );
}
