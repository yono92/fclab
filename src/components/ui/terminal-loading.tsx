"use client";

import { useState, useEffect } from "react";

interface Step {
  text: string;
  done: string;
}

interface TerminalLoadingProps {
  title: string;
  steps: Step[];
}

export function TerminalLoading({ title, steps }: TerminalLoadingProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= steps.length) return;
    const delay = step === 0 ? 600 : 800 + Math.random() * 700;
    const timer = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(timer);
  }, [step, steps.length]);

  const progress = Math.min(100, Math.round((step / steps.length) * 100));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Spinner with progress */}
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-primary/10" strokeWidth="3" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-primary transition-all duration-500"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${progress * 1.76} 176`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-primary">
            {progress}%
          </span>
        </div>

        {/* Status */}
        <div className="space-y-2 text-center">
          <p className="font-mono text-sm text-foreground">
            <span className="text-primary">$</span> {title}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {step < steps.length ? steps[step].text : "거의 완료..."}
          </p>
        </div>

        {/* Terminal log */}
        <div className="mt-2 w-full max-w-md rounded-lg border border-primary/15 bg-background/80 overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-primary/10 px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-red-500/50" />
            <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
            <div className="h-2 w-2 rounded-full bg-green-500/50" />
            <span className="ml-2 font-mono text-[9px] text-muted-foreground/40">fclab — analysis</span>
          </div>
          <div className="space-y-1 p-4 font-mono text-[11px]">
            {steps.map((s, i) => {
              if (i > step) return null;
              const isDone = i < step;
              const isCurrent = i === step;
              return (
                <div key={i} className="flex items-center gap-2 transition-opacity duration-300">
                  {isDone ? (
                    <span className="text-primary">✓</span>
                  ) : (
                    <span className="text-primary/40">{">"}</span>
                  )}
                  <span className={isDone ? "text-muted-foreground/60" : "text-muted-foreground"}>
                    {s.text}
                  </span>
                  {isDone && s.done && (
                    <span className="text-primary text-[10px]">{s.done}</span>
                  )}
                  {isCurrent && (
                    <span className="inline-block h-3 w-1 bg-primary animate-cursor ml-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="h-0.5 w-full rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(0,214,143,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
