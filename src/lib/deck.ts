// Items del deck del hero: versión MÍNIMA y serializable de `Propiedad`.
// El mapeo corre en el SERVIDOR (page.tsx) y al cliente viajan solo los campos
// que la card del deck muestra — no la Propiedad completa (descripción larga,
// 40 tags, todas las fotos…). Menos bytes en el RSC payload, misma card.

import { formatPrecio, formatM2, labelOperacion, tituloPropiedad } from "@/lib/format";
import type { Propiedad } from "@/types";

export interface DeckItem {
  id: string;
  slug: string;
  titulo: string;
  ubicacion?: string;
  /** Precio ya formateado ("US$ 85.000" | "$ 900.000/mes" | "Consultar"). */
  precio: string;
  /** Badge ya resuelto ("En venta" / "En alquiler"). */
  operacion: string;
  tipo: string;
  fotoUrl?: string;
  fotoAlt?: string;
  dormitorios?: number;
  banos?: number;
  m2?: string | null;
}

function precioDeck(p: Propiedad): string {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

export function toDeckItems(props: Propiedad[]): DeckItem[] {
  return props.map((p) => {
    const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
    return {
      id: p.id,
      slug: p.slug,
      titulo: tituloPropiedad(p),
      ubicacion: [p.barrio, p.ciudad].filter(Boolean).join(", ") || undefined,
      precio: precioDeck(p),
      operacion: labelOperacion(p.tipo_operacion),
      tipo: p.tipo_propiedad,
      fotoUrl: portada?.url ?? portada?.thumbnail,
      fotoAlt: portada?.alt,
      dormitorios: p.dormitorios,
      banos: p.banos,
      m2: formatM2(p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos),
    };
  });
}
