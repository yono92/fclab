"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PlayStyle } from "@/lib/play-style";

interface PlayStyleRadarProps {
  style: PlayStyle;
  rankerStyle?: PlayStyle;
}

const axisLabels: Record<keyof PlayStyle, string> = {
  possession: "점유",
  counter: "역습",
  pressing: "프레싱",
  shooting: "슈팅",
  buildup: "빌드업",
};

export function PlayStyleRadar({ style, rankerStyle }: PlayStyleRadarProps) {
  const data = (Object.keys(axisLabels) as (keyof PlayStyle)[]).map((key) => ({
    axis: axisLabels[key],
    value: style[key],
    ...(rankerStyle ? { ranker: rankerStyle[key] } : {}),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#6b7280", fontSize: 10 }}
        />
        <Radar
          name="나"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
        />
        {rankerStyle && (
          <Radar
            name="랭커"
            dataKey="ranker"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.15}
            strokeDasharray="4 2"
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
