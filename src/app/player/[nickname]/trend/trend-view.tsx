"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendMetric {
  label: string;
  previous: number;
  current: number;
  delta: number;
}

interface TrendDataPoint {
  date: string;
  winRate: number;
  wma: number;
}

interface TrendViewProps {
  nickname: string;
  chartData: TrendDataPoint[];
  metrics: TrendMetric[];
}

function deltaColor(delta: number): string {
  if (delta > 0) return "text-green-400";
  if (delta < 0) return "text-red-400";
  return "text-muted-foreground";
}

function deltaArrow(delta: number): string {
  if (delta > 0) return "↑";
  if (delta < 0) return "↓";
  return "→";
}

export function TrendView({ nickname, chartData, metrics }: TrendViewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">{nickname} — 변화 추적</h1>

      {/* WMA Line Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">승률 추이 (가중이동평균)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                width={35}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="winRate"
                name="승률"
                stroke="#6b7280"
                strokeWidth={1}
                dot={false}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="wma"
                name="WMA"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">핵심 지표 변화</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">지표</th>
                <th className="pb-2 pr-4">이전</th>
                <th className="pb-2 pr-4">현재</th>
                <th className="pb-2">변화</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.label} className="border-b border-border/50">
                  <td className="py-2 pr-4">{m.label}</td>
                  <td className="py-2 pr-4">{m.previous.toFixed(1)}</td>
                  <td className="py-2 pr-4">{m.current.toFixed(1)}</td>
                  <td className={`py-2 font-medium ${deltaColor(m.delta)}`}>
                    {deltaArrow(m.delta)} {m.delta > 0 ? "+" : ""}{m.delta.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Interpretation */}
      <Card>
        <CardContent className="pt-4 text-sm text-muted-foreground">
          {metrics.filter((m) => m.delta > 0).length > metrics.length / 2
            ? "📈 전반적으로 지표가 개선되고 있습니다. 현재 플레이 스타일을 유지하세요."
            : metrics.filter((m) => m.delta < 0).length > metrics.length / 2
              ? "📉 일부 지표가 하락세입니다. 액션 제안을 참고하여 개선 포인트를 찾아보세요."
              : "➡ 대부분의 지표가 안정적입니다. 꾸준한 플레이를 유지하고 있습니다."}
        </CardContent>
      </Card>
    </div>
  );
}
