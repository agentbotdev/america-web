import type { Propiedad } from "@/types";

/**
 * Score de "vidriera": las que mejor venden van primero. Priorizamos las
 * propiedades más COMPLETAS (más fotos, precio a la vista, specs cargadas) —
 * son las que mejor se ven en la home y generan más consultas.
 * La usan page.tsx (orden inicial de la home) y la búsqueda en vivo de la sección de
 * propiedades con mapa.
 */
export function scoreVidriera(p: Propiedad): number {
  let s = 0;
  // Fotos: lo que más pesa visualmente (hasta ~12 pts).
  s += Math.min(p.fotos.length, 6) * 2;
  // Precio visible → la card no dice "Consultar" (gancho fuerte).
  if (p.precio_visible && p.precio != null) s += 6;
  // Specs físicas cargadas.
  if (p.dormitorios) s += 2;
  if (p.banos) s += 1;
  if (p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos) s += 2;
  if (p.cocheras) s += 1;
  // Descripción y amenities → ficha rica.
  if (p.descripcion?.trim()) s += 2;
  s += Math.min(p.tags.length, 4);
  // Geolocalizada → entra al mapa.
  if (p.coordenadas_lat != null && p.coordenadas_lng != null) s += 1;
  return s;
}
