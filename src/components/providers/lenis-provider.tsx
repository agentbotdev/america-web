"use client";

import type { ReactNode } from "react";

// Scroll NATIVO (sin smooth-scroll). Se quitó Lenis a propósito: su inercia
// (lerp) hacía que el scroll "se moviera solo" tras soltar y que el contenido
// se percibiera borroso durante el desplazamiento. El scroll nativo responde
// 1:1, es nítido y predecible.
export function LenisProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
