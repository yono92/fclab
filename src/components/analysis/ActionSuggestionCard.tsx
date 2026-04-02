"use client";

import type { ActionSuggestion } from "@/lib/action-rules";

interface ActionSuggestionCardProps {
  suggestions: ActionSuggestion[];
}

const priorityConfig = {
  high: { dot: "bg-red-500", label: "HIGH" },
  medium: { dot: "bg-yellow-500", label: "MED" },
  low: { dot: "bg-emerald-500", label: "LOW" },
} as const;

export function ActionSuggestionCard({
  suggestions,
}: ActionSuggestionCardProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/30 bg-card/50 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
        Action Suggestions
      </p>
      <div className="space-y-2.5">
        {suggestions.map((s) => {
          const config = priorityConfig[s.priority];
          return (
            <div key={s.id} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {config.label}
                </span>
                <span className="text-sm">{s.suggestion}</span>
              </div>
              <p className="pl-5 font-mono text-[10px] text-muted-foreground">
                → {s.evidence}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
