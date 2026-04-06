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
  const [error, setError] = useState(false);
  const px = SIZES[size];
  const pid = spId % 1_000_000;
  const src = ImageUrl.playerActionByPid(pid);

  if (error) {
    return (
      <div
        className={`shrink-0 rounded-full bg-muted/30 ${className ?? ""}`}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      className={`shrink-0 rounded-full object-cover bg-muted/10 ${className ?? ""}`}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
