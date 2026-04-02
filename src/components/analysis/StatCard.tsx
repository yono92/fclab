"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "flat";
  percentile?: number;
}

const trendConfig = {
  up: { icon: "▲", color: "text-emerald-400" },
  down: { icon: "▼", color: "text-red-400" },
  flat: { icon: "—", color: "text-muted-foreground" },
} as const;

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  percentile,
}: StatCardProps) {
  return (
    <div className="rounded-md border border-border/30 bg-card/50 px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="font-mono text-xl font-bold tabular-nums">{value}</span>
        {trend && (
          <span className={`font-mono text-xs ${trendConfig[trend].color}`}>
            {trendConfig[trend].icon}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{subtitle}</p>
      )}
      {percentile !== undefined && (
        <p className="mt-0.5 font-mono text-[10px] text-primary/70">
          {percentile >= 50
            ? `top ${Math.round(100 - percentile)}%`
            : `bot ${Math.round(percentile)}%`}
        </p>
      )}
    </div>
  );
}
