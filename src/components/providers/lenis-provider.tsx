"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

// Smooth scroll cinemático (Lenis). Envuelve toda la app desde el root layout.
export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
