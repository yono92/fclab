"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageUrl } from "@/types/nexon";

const SIZES = {
  sm: 24,
  md: 32,
  lg: 48,
} as const;

interface PlayerImageProps {
  spId: number;
  size?: keyof typeof SIZES;
  className?: string;
}

export function PlayerImage({ spId, size = "sm", className }: PlayerImageProps) {
  const [stage, setStage] = useState<"action-spid" | "action-pid" | "portrait" | "none">("action-spid");
  const px = SIZES[size];
  const pid = spId % 1_000_000;

  if (stage === "none") {
    return (
      <div
        className={`shrink-0 rounded-full bg-muted/30 ${className ?? ""}`}
        style={{ width: px, height: px }}
      />
    );
  }

  const src =
    stage === "action-spid"
      ? ImageUrl.playerAction(spId)
      : stage === "action-pid"
        ? ImageUrl.playerActionByPid(pid)
        : ImageUrl.playerByPid(pid);

  function handleError() {
    if (stage === "action-spid") setStage("action-pid");
    else if (stage === "action-pid") setStage("portrait");
    else setStage("none");
  }

  return (
    <Image
      key={stage}
      src={src}
      alt=""
      width={px}
      height={px}
      className={`shrink-0 rounded-full object-cover bg-muted/10 ${className ?? ""}`}
      onError={handleError}
      unoptimized
    />
  );
}
