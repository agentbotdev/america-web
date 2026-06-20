import type { Propiedad } from "@/types";
import { formatM2, formatNumero, formatPrecio, labelOperacion } from "@/lib/format";

// Ficha técnica de una PROPIEDAD, organizada por categorías. Cada item se omite
// si no tiene valor (no inventamos datos: lo que no está en la DB no se muestra).
// Las "Comodidades y servicios" salen de `p.tags` (ya en español) y se renderizan
// como chips aparte (categoría con `chips`, sin pares label/value).

export type FichaItem = { label: string; value: string };

export type FichaCategoria = {
  titulo: string;
  icon: "ambientes" | "superficies" | "caracteristicas" | "comodidades";
  /** Pares label/value (omitir cuando es categoría de chips). */
  items: FichaItem[];
  /** Lista de etiquetas para render tipo chip (comodidades / servicios). */
  chips?: string[];
};

const m2 = (v: number | null | undefined) => formatM2(v); // null si vacío/≤0

/** Empuja un item solo si tiene valor (string no vacío). */
function push(items: FichaItem[], label: string, value: string | null | undefined) {
  if (value != null && value !== "") items.push({ label, value });
}

/** Número > 0 → string; si no, null (para omitir el item). */
function numVal(n: number | null | undefined): string | null {
  return n != null && n > 0 ? formatNumero(n) : null;
}

export function fichaTecnica(p: Propiedad): FichaCategoria[] {
  const cats: FichaCategoria[] = [];

  // 1. Ambientes
  const ambientes: FichaItem[] = [];
  push(ambientes, "Dormitorios", numVal(p.dormitorios));
  push(ambientes, "Baños", numVal(p.banos));
  push(ambientes, "Toilettes", numVal(p.toilettes));
  push(ambientes, "Ambientes", numVal(p.ambientes));
  push(ambientes, "Cocheras", numVal(p.cocheras));
  push(ambientes, "Plantas", numVal(p.plantas));
  if (ambientes.length) cats.push({ titulo: "Ambientes", icon: "ambientes", items: ambientes });

  // 2. Superficies
  const superficies: FichaItem[] = [];
  push(superficies, "Superficie total", m2(p.superficie_total));
  push(superficies, "Superficie cubierta", m2(p.superficie_cubierta));
  push(superficies, "Superficie semicubierta", m2(p.superficie_semicubierta));
  push(superficies, "Superficie descubierta", m2(p.superficie_descubierta));
  push(superficies, "Frente", m2(p.frente));
  push(superficies, "Fondo", m2(p.fondo));
  if (superficies.length) cats.push({ titulo: "Superficies", icon: "superficies", items: superficies });

  // 3. Características
  const caracteristicas: FichaItem[] = [];
  push(caracteristicas, "Tipo", p.tipo_propiedad);
  push(caracteristicas, "Operación", labelOperacion(p.tipo_operacion));
  push(
    caracteristicas,
    "Antigüedad",
    p.antiguedad != null && p.antiguedad > 0
      ? `${formatNumero(p.antiguedad)} ${p.antiguedad === 1 ? "año" : "años"}`
      : p.antiguedad === 0
        ? "A estrenar"
        : null,
  );
  push(caracteristicas, "Orientación", p.orientacion);
  push(caracteristicas, "Apto crédito", p.apto_credito);
  push(
    caracteristicas,
    "Expensas",
    p.expensas != null && p.expensas > 0 ? `${formatPrecio(p.expensas, "ARS")}/mes` : null,
  );
  if (caracteristicas.length)
    cats.push({ titulo: "Características", icon: "caracteristicas", items: caracteristicas });

  // 4. Comodidades y servicios (chips desde tags)
  const tags = (p.tags ?? []).filter((t) => t && t.trim() !== "");
  if (tags.length)
    cats.push({ titulo: "Comodidades y servicios", icon: "comodidades", items: [], chips: tags });

  return cats;
}
