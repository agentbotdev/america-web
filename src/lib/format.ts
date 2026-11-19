// Helpers de formato (es-AR). Números y moneda al estilo argentino.

import type { Moneda } from "@/types";

const monedaFmt: Record<Moneda, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
  ARS: new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }),
};

export function formatPrecio(monto: number | null | undefined, moneda: Moneda = "USD") {
  if (monto == null || Number.isNaN(monto)) return "Consultar";
  return monedaFmt[moneda].format(Math.round(monto));
}

const numFmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

/** Superficie en metros cuadrados: 120 → "120 m²". */
export function formatM2(m2: number | null | undefined) {
  if (m2 == null || Number.isNaN(m2) || m2 <= 0) return null;
  return `${numFmt.format(m2)} m²`;
}

const haFmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
// Rango de tildes armado con fromCharCode, como en buscador.ts (target ES2017: sin \p{...}).
const TILDES = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
const sinAcentos = (s: string) => s.normalize("NFD").replace(TILDES, "").trim().toLowerCase();
/** Tipos de tierra: desde 1 ha la superficie va en hectáreas (mismo criterio que el CRM). */
const TIPOS_EN_HECTAREAS = ["campo", "terreno", "lote", "quinta"];

/**
 * Superficie TOTAL para mostrar (19/11): un campo de 600 ha salía como "6.000.000 m²" mientras el
 * CRM y Mercado Libre ya decían "600 ha". En tipos de tierra, desde 10.000 m² va en hectáreas;
 * el resto, igual que formatM2.
 */
export function formatSuperficie(m2: number | null | undefined, tipo?: string | null) {
  if (m2 == null || Number.isNaN(m2) || m2 <= 0) return null;
  if (m2 >= 10_000 && TIPOS_EN_HECTAREAS.includes(sinAcentos(tipo ?? ""))) {
    return `${haFmt.format(m2 / 10_000)} ha`;
  }
  return formatM2(m2);
}

/**
 * Antigüedad para mostrar (19/11). `antiguedad = 0` es el valor POR DEFECTO de la base (95 de 163
 * fichas), no "a estrenar": la web le decía "A estrenar" a 30 casas y a 29 terrenos. Mismo criterio
 * que el aviso de Mercado Libre: a estrenar solo si la ficha lo dice (etiqueta o título). En
 * terrenos y lotes no se muestra: no hay construcción.
 */
export function textoAntiguedad(p: {
  antiguedad?: number | null;
  tipo_propiedad?: string | null;
  titulo?: string | null;
  tags?: string[] | null;
}): string | null {
  const tipo = sinAcentos(p.tipo_propiedad ?? "");
  if (tipo === "terreno" || tipo === "lote") return null;
  const a = p.antiguedad;
  if (a != null && a > 0) return `${numFmt.format(a)} ${a === 1 ? "año" : "años"}`;
  const dice = (p.tags ?? []).some((t) => sinAcentos(t) === "a estrenar") || /a\s+estrenar/i.test(p.titulo ?? "");
  return dice ? "A estrenar" : null;
}

export function formatNumero(n: number) {
  return numFmt.format(Math.round(n));
}

/**
 * Título de la propiedad: EL QUE CARGA LA INMOBILIARIA en el CRM.
 *
 * Reclamo del 24/10: "los títulos que ponemos no se ven en la web, sale uno inventado".
 * Hasta acá la web armaba SIEMPRE un título propio ("Casa 3 dorm. en Moreno") y el que
 * escribían en el CRM no aparecía en ningún lado, así que cambiarlo no tenía efecto. Ahora
 * se usa el suyo tal cual (solo se limpian espacios repetidos) y el compuesto queda de
 * respaldo para las fichas sin título ("Propiedad" es el valor por defecto de mapRow).
 */
export function tituloPropiedad(p: {
  titulo?: string;
  tipo_propiedad: string;
  barrio?: string;
  ciudad?: string;
  dormitorios?: number;
  ambientes?: number;
}) {
  const propio = (p.titulo ?? "").replace(/\s+/g, " ").trim();
  if (propio && propio.toLowerCase() !== "propiedad") return propio;
  return tituloCompuesto(p);
}

/** Título armado con los datos: "Casa 3 dorm. en General Rodríguez". Respaldo sin título. */
export function tituloCompuesto(p: {
  tipo_propiedad: string;
  barrio?: string;
  ciudad?: string;
  dormitorios?: number;
  ambientes?: number;
}) {
  const partes: string[] = [p.tipo_propiedad];
  if (p.dormitorios && p.dormitorios > 0) partes.push(`${p.dormitorios} dorm.`);
  else if (p.ambientes && p.ambientes > 0) partes.push(`${p.ambientes} amb.`);
  const lugar = p.barrio || p.ciudad;
  if (lugar) partes.push(`en ${lugar}`);
  return partes.join(" ");
}

// Conectores del español que quedan en minúscula al title-casear.
const CONECTORES = new Set(["de", "del", "la", "las", "los", "el", "y", "e", "al"]);

/**
 * "SANTIAGO DERQUI 482" → "Santiago Derqui 482". Solo actúa si el texto viene
 * TODO en mayúsculas (así llega de la carga del CRM); uno ya bien escrito se
 * respeta tal cual. Para direcciones y nombres de lugar en las cards — en
 * mayúsculas gritaban al lado del resto de la tipografía.
 */
export function suavizarMayusculas(texto: string | null | undefined): string | null {
  const limpio = (texto ?? "").trim();
  if (!limpio) return null;
  if (limpio !== limpio.toUpperCase()) return limpio;
  const out = limpio
    .toLowerCase()
    .replace(/\p{L}+/gu, (w) => (CONECTORES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)));
  return out.charAt(0).toUpperCase() + out.slice(1);
}

const LABELS: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  Frente: "Frente",
  Interno: "Interno",
  Contrafrente: "Contrafrente",
  Lateral: "Lateral",
};

export function label(key: string) {
  return LABELS[key] ?? key;
}

/** "En venta" / "En alquiler" para badges. */
export function labelOperacion(op: "venta" | "alquiler") {
  return op === "venta" ? "En venta" : "En alquiler";
}
