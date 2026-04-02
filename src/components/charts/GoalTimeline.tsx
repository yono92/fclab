"use client";

interface GoalEvent {
  time: number; // seconds
  spId: number;
}

interface GoalTimelineProps {
  myGoals: GoalEvent[];
  opGoals: GoalEvent[];
  width?: number;
}

export function GoalTimeline({
  myGoals,
  opGoals,
  width = 500,
}: GoalTimelineProps) {
  const height = 60;
  const pad = 30;
  const lineY = height / 2;
  const maxTime = 5400; // 90 minutes in seconds

  function timeToX(time: number): number {
    return pad + (time / maxTime) * (width - 2 * pad);
  }

  const ticks = [0, 15, 30, 45, 60, 75, 90];

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      {/* Main line */}
      <line x1={pad} y1={lineY} x2={width - pad} y2={lineY} stroke="#4a5568" strokeWidth={2} />

      {/* Tick marks */}
      {ticks.map((min) => {
        const x = timeToX(min * 60);
        return (
          <g key={min}>
            <line x1={x} y1={lineY - 4} x2={x} y2={lineY + 4} stroke="#6b7280" strokeWidth={1} />
            <text x={x} y={lineY + 16} textAnchor="middle" fill="#9ca3af" fontSize={9}>
              {min}
            </text>
          </g>
        );
      })}

      {/* My goals (blue, above) */}
      {myGoals.map((g, i) => (
        <circle
          key={`my-${i}`}
          cx={timeToX(g.time)}
          cy={lineY - 12}
          r={6}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
        />
      ))}

      {/* Opponent goals (red, below) */}
      {opGoals.map((g, i) => (
        <circle
          key={`op-${i}`}
          cx={timeToX(g.time)}
          cy={lineY + 12}
          r={6}
          fill="#ef4444"
          stroke="white"
          strokeWidth={1}
        />
      ))}

      {/* Labels */}
      <text x={4} y={lineY - 10} fill="#3b82f6" fontSize={8}>나</text>
      <text x={4} y={lineY + 16} fill="#ef4444" fontSize={8}>상대</text>
    </svg>
  );
}
