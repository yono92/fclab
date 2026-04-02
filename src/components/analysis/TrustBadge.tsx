"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { reliabilityGrade } from "@/lib/stats";

interface TrustBadgeProps {
  sampleSize: number;
  dateRange: [Date, Date];
  lastUpdated: Date;
  matchType: string;
}

const gradeConfig = {
  insufficient: {
    label: "데이터 부족",
    icon: "⚠",
    barClass: "bg-red-500",
    badgeVariant: "destructive" as const,
    barWidth: "w-1/4",
  },
  limited: {
    label: "제한적",
    icon: "△",
    barClass: "bg-yellow-500",
    badgeVariant: "outline" as const,
    barWidth: "w-2/3",
  },
  sufficient: {
    label: "충분",
    icon: "✅",
    barClass: "bg-green-500",
    badgeVariant: "default" as const,
    barWidth: "w-full",
  },
};

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(d: Date): string {
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
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>📊</span>
          <span>{sampleSize}경기</span>
          <span>·</span>
          <span>{matchType}</span>
          <span>·</span>
          <span>
            {formatDate(dateRange[0])}~{formatDate(dateRange[1])}
          </span>
          <span>·</span>
          <span>갱신 {formatDateTime(lastUpdated)}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${config.barClass} ${config.barWidth} transition-all`}
            />
          </div>
          <Badge variant={config.badgeVariant}>
            {config.icon} {config.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
