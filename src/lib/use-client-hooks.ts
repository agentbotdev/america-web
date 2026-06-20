"use client";

import { useSyncExternalStore } from "react";

// Hooks SSR-safe basados en useSyncExternalStore (sin setState en effects → lint-clean
// con react-hooks/set-state-in-effect, y sin hydration mismatch: el server snapshot es
// estable y el cliente toma el valor real tras hidratar).

const noopSubscribe = () => () => {};

/** `true` en cliente (tras hidratar), `false` en SSR / primer render. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** Media query reactiva y SSR-safe (devuelve `false` en el server). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false,
  );
}
