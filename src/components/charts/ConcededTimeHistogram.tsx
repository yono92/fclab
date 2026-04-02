"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ConcededTimeHistogramProps {
  /** Array of goal times in seconds from opponent */
  goalTimes: number[];
}

export function ConcededTimeHistogram({
  goalTimes,
}: ConcededTimeHistogramProps) {
  const buckets = [
    { label: "0-15", min: 0, max: 900 },
    { label: "15-30", min: 900, max: 1800 },
    { label: "30-45", min: 1800, max: 2700 },
    { label: "45-60", min: 2700, max: 3600 },
    { label: "60-75", min: 3600, max: 4500 },
    { label: "75-90", min: 4500, max: 5400 },
  ];

  const data = buckets.map((b) => ({
    name: b.label,
    goals: goalTimes.filter((t) => t >= b.min && t < b.max).length,
  }));

  return (
    <div>
      <p className="mb-2 text-sm font-medium">실점 시간대</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            axisLine={false}
            width={20}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="goals" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
