"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionSuggestion } from "@/lib/action-rules";

interface ActionSuggestionCardProps {
  suggestions: ActionSuggestion[];
}

const priorityConfig = {
  high: { icon: "🔴", label: "HIGH" },
  medium: { icon: "🟡", label: "MED" },
  low: { icon: "🟢", label: "LOW" },
} as const;

export function ActionSuggestionCard({
  suggestions,
}: ActionSuggestionCardProps) {
  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">💡 플레이 개선 제안</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((s) => {
          const config = priorityConfig[s.priority];
          return (
            <div key={s.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span>{config.icon}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  [{config.label}]
                </span>
                <span className="text-sm font-medium">{s.suggestion}</span>
              </div>
              <p className="pl-8 text-xs text-muted-foreground">
                근거: {s.evidence}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
