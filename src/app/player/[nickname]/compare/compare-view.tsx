"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CompareMetric {
  label: string;
  myValue: number;
  rankerValue: number;
  diff: number;
  cohensD: number;
  verdict: string;
}

export interface PlayerComparison {
  spId: number;
  appearances: number;
  metrics: CompareMetric[];
  radarData: { axis: string; my: number; ranker: number }[];
}

interface CompareViewProps {
  nickname: string;
  players: PlayerComparison[];
}

function verdictColor(verdict: string): string {
  if (verdict.includes("유사")) return "text-green-400";
  if (verdict.includes("약간")) return "text-yellow-400";
  return "text-red-400";
}

function PlayerCard({ player }: { player: PlayerComparison }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          spId: {player.spId}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({player.appearances}경기 출전)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Radar */}
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={player.radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, "auto"]} tick={false} axisLine={false} />
              <Radar name="나" dataKey="my" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="랭커" dataKey="ranker" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeDasharray="4 2" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "12px" }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-2">지표</th>
                  <th className="pb-2 pr-2">나</th>
                  <th className="pb-2 pr-2">랭커</th>
                  <th className="pb-2 pr-2">차이</th>
                  <th className="pb-2">판정</th>
                </tr>
              </thead>
              <tbody>
                {player.metrics.map((m) => (
                  <tr key={m.label} className="border-b border-border/50">
                    <td className="py-1.5 pr-2">{m.label}</td>
                    <td className="py-1.5 pr-2">{m.myValue.toFixed(2)}</td>
                    <td className="py-1.5 pr-2">{m.rankerValue.toFixed(2)}</td>
                    <td className="py-1.5 pr-2">{m.diff > 0 ? "+" : ""}{m.diff.toFixed(2)}</td>
                    <td className={`py-1.5 ${verdictColor(m.verdict)}`}>{m.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompareView({ nickname, players }: CompareViewProps) {
  if (players.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{nickname} vs 랭커</h1>
        <p className="mt-4 text-muted-foreground">
          비교할 랭커 데이터가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">{nickname} vs TOP 10,000 랭커</h1>
      <p className="text-sm text-muted-foreground">
        내 주요 사용 선수별 랭커 평균과 비교합니다. Cohen&apos;s d 효과 크기로 차이를 판정합니다.
      </p>
      {players.map((p) => (
        <PlayerCard key={p.spId} player={p} />
      ))}
    </div>
  );
}
