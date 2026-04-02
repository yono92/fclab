"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface WinRateDonutProps {
  wins: number;
  draws: number;
  losses: number;
}

const COLORS = ["#22c55e", "#6b7280", "#ef4444"];

export function WinRateDonut({ wins, draws, losses }: WinRateDonutProps) {
  const total = wins + draws + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const data = [
    { name: "승", value: wins },
    { name: "무", value: draws },
    { name: "패", value: losses },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
            <Label
              position="center"
              fill="#f5f5f5"
              fontSize={20}
              fontWeight="bold"
              value={`${winRate}%`}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground">
        {wins}승 {draws}무 {losses}패
      </p>
    </div>
  );
}
