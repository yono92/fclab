"use client";

import { useState } from "react";

interface Shot {
  x: number;
  y: number;
  result: number; // 1=goal, 2=effective, 3+=miss
  goalTime: number;
  spId: number;
  inPenalty: boolean;
}

interface ShootingHeatmapProps {
  shots: Shot[];
  showZones?: boolean;
  width?: number;
  height?: number;
}

// Pitch dimensions (logical coords)
const PITCH_W = 105;
const PITCH_H = 68;

// Zone boundaries (6 zones: 3 in box, 3 outside)
const BOX_X = PITCH_W - 16.5;
const THIRD_Y = PITCH_H / 3;

interface ZoneStat {
  label: string;
  shots: number;
  effective: number;
  goals: number;
}

function getZoneStats(shots: Shot[]): ZoneStat[] {
  const zones: ZoneStat[] = [
    { label: "좌측박스", shots: 0, effective: 0, goals: 0 },
    { label: "중앙박스", shots: 0, effective: 0, goals: 0 },
    { label: "우측박스", shots: 0, effective: 0, goals: 0 },
    { label: "좌측밖", shots: 0, effective: 0, goals: 0 },
    { label: "중앙밖", shots: 0, effective: 0, goals: 0 },
    { label: "우측밖", shots: 0, effective: 0, goals: 0 },
  ];

  for (const shot of shots) {
    const px = shot.x * PITCH_W;
    const py = shot.y * PITCH_H;
    const inBox = px >= BOX_X;
    const yZone = py < THIRD_Y ? 0 : py < THIRD_Y * 2 ? 1 : 2;
    const idx = inBox ? yZone : yZone + 3;

    zones[idx].shots++;
    if (shot.result <= 2) zones[idx].effective++;
    if (shot.result === 1) zones[idx].goals++;
  }

  return zones;
}

function shotColor(result: number): string {
  if (result === 1) return "#ef4444"; // goal - red
  if (result === 2) return "#eab308"; // effective - yellow
  return "#6b7280"; // miss - gray
}

function shotRadius(result: number): number {
  if (result === 1) return 6;
  if (result === 2) return 4;
  return 3;
}

export function ShootingHeatmap({
  shots,
  showZones: initialShowZones = false,
  width = 420,
  height = 272,
}: ShootingHeatmapProps) {
  const [showZones, setShowZones] = useState(initialShowZones);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const scaleX = width / PITCH_W;
  const scaleY = height / PITCH_H;
  const zones = getZoneStats(shots);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">슈팅 히트맵</span>
        <button
          onClick={() => setShowZones(!showZones)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showZones ? "존 분석 숨기기" : "존 분석 보기"}
        </button>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="rounded border border-border bg-green-950/30"
      >
        {/* Pitch outline */}
        <rect
          x={1}
          y={1}
          width={width - 2}
          height={height - 2}
          fill="none"
          stroke="#4a5568"
          strokeWidth={1}
        />
        {/* Center line */}
        <line
          x1={width / 2}
          y1={0}
          x2={width / 2}
          y2={height}
          stroke="#4a5568"
          strokeWidth={0.5}
        />
        {/* Center circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={9.15 * scaleX}
          fill="none"
          stroke="#4a5568"
          strokeWidth={0.5}
        />
        {/* Right penalty box */}
        <rect
          x={(PITCH_W - 16.5) * scaleX}
          y={((PITCH_H - 40.3) / 2) * scaleY}
          width={16.5 * scaleX}
          height={40.3 * scaleY}
          fill="none"
          stroke="#4a5568"
          strokeWidth={0.5}
        />
        {/* Left penalty box */}
        <rect
          x={0}
          y={((PITCH_H - 40.3) / 2) * scaleY}
          width={16.5 * scaleX}
          height={40.3 * scaleY}
          fill="none"
          stroke="#4a5568"
          strokeWidth={0.5}
        />
        {/* Right goal */}
        <rect
          x={width - 3}
          y={(PITCH_H / 2 - 3.66) * scaleY}
          width={3}
          height={7.32 * scaleY}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1}
        />
        {/* Left goal */}
        <rect
          x={0}
          y={(PITCH_H / 2 - 3.66) * scaleY}
          width={3}
          height={7.32 * scaleY}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1}
        />

        {/* Zone overlays */}
        {showZones &&
          zones.map((zone, i) => {
            const inBox = i < 3;
            const yIdx = i % 3;
            const zx = inBox ? BOX_X * scaleX : 0;
            const zw = inBox
              ? 16.5 * scaleX
              : BOX_X * scaleX;
            const zy = yIdx * THIRD_Y * scaleY;
            const zh = THIRD_Y * scaleY;
            const opacity = zone.shots > 0 ? Math.min(zone.shots / 10, 0.5) : 0;

            return (
              <g key={i}>
                <rect
                  x={zx}
                  y={zy}
                  width={zw}
                  height={zh}
                  fill="#3b82f6"
                  fillOpacity={opacity}
                  stroke="#4a5568"
                  strokeWidth={0.3}
                  strokeDasharray="4 2"
                />
                {zone.shots > 0 && (
                  <text
                    x={zx + zw / 2}
                    y={zy + zh / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={9}
                    fontWeight="bold"
                  >
                    {zone.shots}슛 {zone.goals}골
                  </text>
                )}
              </g>
            );
          })}

        {/* Shot markers */}
        {shots.map((shot, i) => {
          const cx = shot.x * width;
          const cy = shot.y * height;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={shotRadius(shot.result)}
              fill={shotColor(shot.result)}
              fillOpacity={0.8}
              stroke="white"
              strokeWidth={0.5}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            />
          );
        })}

        {/* Tooltip */}
        {hoveredIdx !== null && shots[hoveredIdx] && (() => {
          const shot = shots[hoveredIdx];
          const tx = Math.min(shot.x * width + 10, width - 80);
          const ty = Math.max(shot.y * height - 10, 15);
          const resultText =
            shot.result === 1 ? "골" : shot.result === 2 ? "유효" : "빗나감";
          const minutes = Math.floor(shot.goalTime / 60);

          return (
            <g>
              <rect
                x={tx}
                y={ty - 12}
                width={75}
                height={28}
                rx={4}
                fill="#1a1a2e"
                fillOpacity={0.9}
              />
              <text x={tx + 4} y={ty} fill="white" fontSize={9}>
                {minutes}분 · {resultText}
              </text>
              <text x={tx + 4} y={ty + 12} fill="#9ca3af" fontSize={8}>
                spId: {shot.spId}
              </text>
            </g>
          );
        })()}

        {/* Legend */}
        <g transform={`translate(8, ${height - 18})`}>
          <circle cx={0} cy={0} r={4} fill="#ef4444" />
          <text x={8} y={4} fill="#9ca3af" fontSize={8}>골</text>
          <circle cx={30} cy={0} r={3} fill="#eab308" />
          <text x={37} y={4} fill="#9ca3af" fontSize={8}>유효</text>
          <circle cx={60} cy={0} r={2.5} fill="#6b7280" />
          <text x={67} y={4} fill="#9ca3af" fontSize={8}>빗나감</text>
        </g>
      </svg>
    </div>
  );
}
