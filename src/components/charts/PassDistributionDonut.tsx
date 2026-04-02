"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PassDistributionDonutProps {
  shortPass: number;
  longPass: number;
  throughPass: number;
  lobPass: number;
  groundPass: number;
}

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#a855f7", "#6b7280"];

export function PassDistributionDonut({
  shortPass,
  longPass,
  throughPass,
  lobPass,
  groundPass,
}: PassDistributionDonutProps) {
  const other = Math.max(0, 1 - shortPass - longPass - throughPass - lobPass - groundPass);

  const data = [
    { name: "숏패스", value: Math.round(shortPass * 100) },
    { name: "스루패스", value: Math.round(throughPass * 100) },
    { name: "그라운더", value: Math.round(groundPass * 100) },
    { name: "롱패스", value: Math.round(longPass * 100) },
    { name: "기타", value: Math.round((lobPass + other) * 100) },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => `${value}%`}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: "11px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
