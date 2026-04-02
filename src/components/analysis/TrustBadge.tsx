"use client";

import { reliabilityGrade } from "@/lib/stats";

interface TrustBadgeProps {
  sampleSize: number;
  dateRange: [Date, Date];
  lastUpdated: Date;
  matchType: string;
}

const gradeConfig = {
  insufficient: {
    label: "INSUFFICIENT",
    dot: "bg-red-500",
    text: "text-red-400",
  },
  limited: {
    label: "LIMITED",
    dot: "bg-yellow-500",
    text: "text-yellow-400",
  },
  sufficient: {
    label: "SUFFICIENT",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
  },
};

function fmt(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function fmtTime(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function TrustBadge({
  sampleSize,
  dateRange,
  lastUpdated,
  matchType,
}: TrustBadgeProps) {
  const grade = reliabilityGrade(sampleSize);
  const config = gradeConfig[grade];

  return (
    <div className="flex items-center gap-3 rounded-md border border-border/30 bg-card/30 px-3 py-2 font-mono text-xs">
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        <span className={config.text}>{config.label}</span>
      </div>
      <span className="text-muted-foreground/50">|</span>
      <span className="text-muted-foreground">
        {sampleSize}G · {matchType} · {fmt(dateRange[0])}~{fmt(dateRange[1])} · updated {fmtTime(lastUpdated)}
      </span>
    </div>
  );
}
