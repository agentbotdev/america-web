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

export function formatNumero(n: number) {
  return numFmt.format(Math.round(n));
}

/** Título lindo compuesto: "Casa 3 dorm. en General Rodríguez". */
export function tituloPropiedad(p: {
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
