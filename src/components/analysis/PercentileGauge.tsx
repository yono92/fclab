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
      ? `top ${Math.round(100 - percentile)}%`
      : `bot ${Math.round(percentile)}%`;

  const barColor =
    percentile >= 70
      ? "bg-emerald-500"
      : percentile >= 40
        ? "bg-blue-500"
        : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          {value}
          <span className="text-muted-foreground">{unit}</span>
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-muted/50">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor} transition-all`}
          style={{ width: `${Math.min(percentile, 100)}%` }}
        />
        {benchmark !== undefined && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${Math.min(benchmark, 100)}%` }}
          >
            <div className="h-3 w-px bg-yellow-400" />
          </div>
        )}
      </div>
      <p className="font-mono text-[10px] text-primary/60">{rankText}</p>
    </div>
  );
}
