"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "flat";
  percentile?: number;
}

const trendIcons = {
  up: "↑",
  down: "↓",
  flat: "→",
} as const;

const trendColors = {
  up: "text-green-400",
  down: "text-red-400",
  flat: "text-muted-foreground",
} as const;

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  percentile,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            <span className={trendColors[trend]}>{trendIcons[trend]}</span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
        {percentile !== undefined && (
          <p className="mt-1 text-xs text-muted-foreground">
            {percentile >= 50
              ? `상위 ${Math.round(100 - percentile)}%`
              : `하위 ${Math.round(percentile)}%`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
