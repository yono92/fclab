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
  30: "⚽",
  40: "⚽",
  204: "🎮",
  214: "🎮",
  215: "🎮",
  216: "🎮",
};

export function MatchTypeChips({
  matchTypeCounts,
  selected,
  onSelect,
}: MatchTypeChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {matchTypeCounts.map((mt) => {
        const isSelected = mt.matchtype === selected;
        const isDisabled = mt.count === 0;
        const icon = icons[mt.matchtype] ?? "⚙️";

        return (
          <button
            key={mt.matchtype}
            disabled={isDisabled}
            onClick={() => !isDisabled && onSelect(mt.matchtype)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : isDisabled
                  ? "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
                  : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <span>{icon}</span>
            <span>{mt.desc}</span>
            <span className="text-xs opacity-70">({mt.count})</span>
          </button>
        );
      })}
    </div>
  );
}
