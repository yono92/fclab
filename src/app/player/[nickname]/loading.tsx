export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Spinner */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>

        {/* Status */}
        <div className="space-y-2 text-center">
          <p className="font-mono text-sm text-foreground">
            <span className="text-primary">$</span> analyzing player data...
          </p>
          <p className="font-mono text-xs text-muted-foreground animate-pulse">
            매치 기록 수집 & 통계 분석 중
          </p>
        </div>

        {/* Terminal log */}
        <div className="mt-4 w-full max-w-sm rounded-lg border border-border/30 bg-card/50 p-4 font-mono text-[11px] text-muted-foreground">
          <div className="space-y-1.5">
            <p>
              <span className="text-primary">{">"}</span> connecting to api...
              <span className="ml-1 text-green-400">ok</span>
            </p>
            <p>
              <span className="text-primary">{">"}</span> loading match records...
              <span className="ml-1 animate-pulse">_</span>
            </p>
            <p className="animate-pulse text-muted-foreground/50">
              <span className="text-primary/50">{">"}</span> computing statistics...
            </p>
            <p className="animate-pulse text-muted-foreground/30">
              <span className="text-primary/30">{">"}</span> generating suggestions...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
