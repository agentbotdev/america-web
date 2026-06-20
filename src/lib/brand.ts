// Branding configurable por agencia (multi-tenant ready).
// Genera las CSS variables del tenant para inyectar como `style` en un wrapper.
// Cuando se conecte Supabase, los colores vienen de `agencias.colores` (JSONB).

import type { CSSProperties } from "react";
import type { Agencia } from "@/types";

export function brandStyle(agencia: Agencia): CSSProperties {
  return {
    "--brand": agencia.colores.brand,
    "--brand-foreground": agencia.colores.brandForeground,
    "--accent-warm": agencia.colores.accent,
    "--primary": agencia.colores.brand,
    "--primary-foreground": agencia.colores.brandForeground,
    "--ring": agencia.colores.brand,
  } as CSSProperties;
}
