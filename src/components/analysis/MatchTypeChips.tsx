"use client";

interface MatchTypeCount {
  matchtype: number;
  desc: string;
  count: number;
}

interface MatchTypeChipsProps {
  matchTypeCounts: MatchTypeCount[];
  selected: number;
  onSelect: (matchtype: number) => void;
}

const icons: Record<number, string> = {
  50: "🏆",
  52: "📋",
  60: "⚽",
  40: "⚽",
  204: "🎮",
  214: "🎮",
};

export function MatchTypeChips({
  matchTypeCounts,
  selected,
  onSelect,
}: MatchTypeChipsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {matchTypeCounts.map((mt) => {
        const isSelected = mt.matchtype === selected;
        const isDisabled = mt.count === 0;
        const icon = icons[mt.matchtype] ?? "⚙️";

        return (
          <button
            key={mt.matchtype}
            disabled={isDisabled}
            onClick={() => !isDisabled && onSelect(mt.matchtype)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
              isSelected
                ? "border-primary/50 bg-primary/10 text-primary"
                : isDisabled
                  ? "border-border/20 bg-transparent text-muted-foreground/30 cursor-not-allowed"
                  : "border-border/30 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span>{icon}</span>
            <span>{mt.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
