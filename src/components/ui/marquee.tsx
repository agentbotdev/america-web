"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Marquee infinito y SMOOTH (CSS puro, sin rAF → liviano). El track tiene DOS
// copias (cada una en su <ul>) y se traslada -50% → loop sin cortes con gap
// uniforme. Las dos <ul> aíslan las keys (sin warnings). Pausa al hover y
// respeta reduced-motion.
export function Marquee({
  children,
  duration = 34,
  gap = "3rem",
  reverse = false,
  pauseOnHover = true,
  className,
}: {
  children: ReactNode;
  duration?: number;
  gap?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  const listStyle: CSSProperties = { gap, marginRight: gap };
  return (
    <div className={cn("marquee-mask group flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex shrink-0 animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        <ul className="flex shrink-0 items-center" style={listStyle}>
          {children}
        </ul>
        <ul aria-hidden className="flex shrink-0 items-center" style={listStyle}>
          {children}
        </ul>
      </div>
    </div>
  );
}
