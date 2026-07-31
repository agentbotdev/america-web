"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Marquee infinito y SMOOTH (CSS puro, sin rAF → liviano). El track son DOS
// MITADES IDÉNTICAS y se traslada -50% → loop sin cortes con gap uniforme.
//
// `repeat`: cuántas veces se repite el set de items EN CADA MITAD. Con pocos
// items (ej. 5 logos) una sola copia es más angosta que un monitor ancho y el
// loop muestra un HUECO al final de la vuelta. Repetir el set hasta que cada
// mitad supere el viewport lo hace verdaderamente "de corrido". Cada copia va
// en su propio <ul> (aísla keys de React). Pausa al hover.
export function Marquee({
  children,
  duration = 34,
  gap = "3rem",
  repeat = 1,
  reverse = false,
  pauseOnHover = true,
  className,
}: {
  children: ReactNode;
  duration?: number;
  gap?: string;
  /** Copias del set por mitad del track (subir si la cinta "se corta"). */
  repeat?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  const listStyle: CSSProperties = { gap, marginRight: gap };
  const copias = Math.max(1, repeat) * 2; // total: 2 mitades idénticas
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
        {Array.from({ length: copias }, (_, i) => (
          <ul
            key={i}
            aria-hidden={i > 0 || undefined}
            className="flex shrink-0 items-center"
            style={listStyle}
          >
            {children}
          </ul>
        ))}
      </div>
    </div>
  );
}
