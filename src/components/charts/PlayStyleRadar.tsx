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
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data}>
        <PolarGrid stroke="#1e293b" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="나"
          dataKey="value"
          stroke="#00d68f"
          fill="#00d68f"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        {rankerStyle && (
          <Radar
            name="랭커"
            dataKey="ranker"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.08}
            strokeDasharray="4 2"
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "6px",
            fontSize: "11px",
            fontFamily: "monospace",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
