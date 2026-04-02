"use client";

interface PercentileGaugeProps {
  label: string;
  value: number;
  unit: string;
  percentile: number;
  benchmark?: number;
}

export function PercentileGauge({
  label,
  value,
  unit,
  percentile,
  benchmark,
}: PercentileGaugeProps) {
  const rankText =
    percentile >= 50
      ? `상위 ${Math.round(100 - percentile)}%`
      : `하위 ${Math.round(percentile)}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-muted">
        {/* Filled bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(percentile, 100)}%` }}
        />
        {/* Pointer */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${Math.min(percentile, 100)}%` }}
        >
          <div className="h-4 w-1 rounded-full bg-foreground" />
        </div>
        {/* Benchmark marker */}
        {benchmark !== undefined && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${Math.min(benchmark, 100)}%` }}
            title={`랭커 평균`}
          >
            <div className="h-5 w-0.5 bg-yellow-400" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>하위</span>
        <span className="font-medium text-foreground">{rankText}</span>
        <span>상위</span>
      </div>
    </div>
  );
}
