"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface WinRateDonutProps {
  wins: number;
  draws: number;
  losses: number;
}

const COLORS = ["#00d68f", "#4a5568", "#ef4444"];

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
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
            <Label
              position="center"
              fill="#e4e4e7"
              fontSize={18}
              fontWeight="bold"
              fontFamily="monospace"
              value={`${winRate}%`}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="font-mono text-xs text-muted-foreground">
        {wins}W {draws}D {losses}L
      </p>
    </div>
  );
}
