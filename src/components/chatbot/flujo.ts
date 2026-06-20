// Flujo guiado del asesor (SIN LLM): árbol de pasos con botones de opciones.
// América Cardozo trabaja VENTA y ALQUILER de inmuebles → el flujo está pensado
// para (a) entender qué busca, (b) acotar tipo/zona/dormitorios/presupuesto,
// (c) recomendar propiedades reales y capturar bien la consulta.
// Cada respuesta se acumula en `Respuestas` y al final arma el mensaje de WhatsApp.

import type { Propiedad } from "@/types";
import { formatPrecio, tituloPropiedad } from "@/lib/format";

/* ------------------------------------------------------------------ */
/*  Tipos del árbol de pasos                                          */
/* ------------------------------------------------------------------ */

/** Claves de los datos que vamos capturando a lo largo de la charla. */
export type RespKey =
  | "intencion"
  | "operacion"
  | "tipo"
  | "zona"
  | "dormitorios"
  | "presupuesto";

export type Opcion = {
  label: string;
  /** Texto humano que queda guardado y va al mensaje de WhatsApp. */
  value: string;
  /** Id del próximo paso. "reco" dispara recomendaciones; "input" pide texto libre. */
  next: string;
  emoji?: string;
};

export type Paso = {
  bot: string;
  /** Si está, la respuesta elegida se guarda bajo esta clave. */
  key?: RespKey;
  /** Paso de texto libre (ej. zona / barrio puntual). */
  input?: { key: RespKey; placeholder: string; next: string };
  opciones: Opcion[];
};

export type Respuestas = Partial<Record<RespKey, string>>;

/* ------------------------------------------------------------------ */
/*  El árbol (flujo largo y conversacional)                          */
/* ------------------------------------------------------------------ */

export const FLUJO: Record<string, Paso> = {
  inicio: {
    bot: "¡Hola! 👋 Soy el asesor de Inmobiliaria América Cardozo. Te ayudo a encontrar tu próxima propiedad en 1 minuto. ¿Con qué arrancamos?",
    key: "intencion",
    opciones: [
      { label: "Quiero comprar", value: "comprar una propiedad", next: "operacionComprar", emoji: "🏡" },
      { label: "Quiero alquilar", value: "alquilar una propiedad", next: "operacionAlquilar", emoji: "🔑" },
      { label: "Que me asesoren", value: "que me asesoren para elegir", next: "tipo", emoji: "🧭" },
      { label: "Hablar con una persona", value: "hablar con un asesor", next: "cierre", emoji: "💬" },
    ],
  },

  // Pasos puente: fijan la operación y siguen al tipo de propiedad.
  operacionComprar: {
    bot: "¡Buenísimo! Buscás en venta. ¿Qué tipo de propiedad tenés en mente?",
    key: "operacion",
    opciones: [
      { label: "Continuar", value: "venta", next: "tipo", emoji: "➡️" },
    ],
  },
  operacionAlquilar: {
    bot: "¡Dale! Buscás en alquiler. ¿Qué tipo de propiedad tenés en mente?",
    key: "operacion",
    opciones: [
      { label: "Continuar", value: "alquiler", next: "tipo", emoji: "➡️" },
    ],
  },

  tipo: {
    bot: "¿Qué tipo de propiedad estás buscando?",
    key: "tipo",
    opciones: [
      { label: "Casa", value: "Casa", next: "zona", emoji: "🏠" },
      { label: "Departamento", value: "Departamento", next: "zona", emoji: "🏢" },
      { label: "PH", value: "PH", next: "zona", emoji: "🏘️" },
      { label: "Terreno / Lote", value: "Terreno", next: "zona", emoji: "🌳" },
      { label: "Local / Oficina", value: "Local", next: "zona", emoji: "🏬" },
      { label: "No sé, asesorame", value: "abierto a recomendación", next: "zona", emoji: "🤔" },
    ],
  },

  // Texto libre: barrio o zona puntual (matchea contra barrio/ciudad/zona).
  zona: {
    bot: "¿En qué zona o barrio te gustaría? Escribilo (ej: «Centro», «Nueva Córdoba») o tocá «Cualquier zona».",
    input: {
      key: "zona",
      placeholder: "Barrio o zona…",
      next: "dormitorios",
    },
    opciones: [
      { label: "Cualquier zona", value: "cualquier zona", next: "dormitorios", emoji: "📍" },
    ],
  },

  dormitorios: {
    bot: "¿Cuántos dormitorios necesitás?",
    key: "dormitorios",
    opciones: [
      { label: "Monoambiente", value: "monoambiente", next: "presupuesto", emoji: "🛋️" },
      { label: "1 dormitorio", value: "1", next: "presupuesto", emoji: "1️⃣" },
      { label: "2 dormitorios", value: "2", next: "presupuesto", emoji: "2️⃣" },
      { label: "3 dormitorios", value: "3", next: "presupuesto", emoji: "3️⃣" },
      { label: "4 o más", value: "4+", next: "presupuesto", emoji: "🏠" },
      { label: "Indistinto", value: "indistinto", next: "presupuesto", emoji: "🤷" },
    ],
  },

  presupuesto: {
    bot: "Última pregunta para afinar la búsqueda: ¿en qué rango de presupuesto te movés?",
    key: "presupuesto",
    opciones: [
      { label: "Hasta USD 60.000", value: "hasta USD 60.000", next: "reco" },
      { label: "USD 60k a 120k", value: "entre USD 60.000 y 120.000", next: "reco" },
      { label: "USD 120k a 200k", value: "entre USD 120.000 y 200.000", next: "reco" },
      { label: "Más de USD 200k", value: "más de USD 200.000", next: "reco" },
      { label: "A definir / en ARS", value: "a definir o en pesos", next: "reco", emoji: "💵" },
    ],
  },

  // Estados terminales (la UI los maneja: reco = mostrar propiedades, cierre = handoff).
  reco: { bot: "", opciones: [] },
  cierre: { bot: "", opciones: [] },
};

/* ------------------------------------------------------------------ */
/*  Recomendador (filtra las propiedades reales según los criterios)   */
/* ------------------------------------------------------------------ */

// Tasa de referencia SOLO para normalizar ARS→USD al filtrar por presupuesto
// (heurística interna, no se muestra).
const USD_REF = 1100;

function topePresupuestoUSD(presupuesto?: string): number | null {
  switch (presupuesto) {
    case "hasta USD 60.000":
      return 60_000;
    case "entre USD 60.000 y 120.000":
      return 120_000;
    case "entre USD 120.000 y 200.000":
      return 200_000;
    case "más de USD 200.000":
    case "a definir o en pesos":
      return null; // sin techo
    default:
      return null;
  }
}

function precioUSD(p: Propiedad): number | null {
  if (p.precio == null) return null;
  return p.moneda === "ARS" ? p.precio / USD_REF : p.precio;
}

function matchOperacion(p: Propiedad, operacion?: string): boolean {
  if (operacion !== "venta" && operacion !== "alquiler") return true;
  return p.tipo_operacion === operacion;
}

function matchTipo(p: Propiedad, tipo?: string): boolean {
  if (!tipo || tipo === "abierto a recomendación") return true;
  return p.tipo_propiedad.toLowerCase().includes(tipo.toLowerCase());
}

function matchZona(p: Propiedad, zona?: string): boolean {
  if (!zona || zona === "cualquier zona") return true;
  const q = zona.trim().toLowerCase();
  if (!q) return true;
  return [p.barrio, p.ciudad, p.zona, p.location_full, p.location_short]
    .filter(Boolean)
    .some((campo) => (campo as string).toLowerCase().includes(q));
}

function matchDormitorios(p: Propiedad, dorm?: string): boolean {
  if (!dorm || dorm === "indistinto") return true;
  if (dorm === "monoambiente") return (p.dormitorios ?? 0) === 0;
  if (dorm === "4+") return (p.dormitorios ?? 0) >= 4;
  const n = Number(dorm);
  if (Number.isNaN(n)) return true;
  return (p.dormitorios ?? 0) === n;
}

/**
 * Devuelve 2-4 propiedades recomendadas según lo capturado, filtrando el
 * catálogo REAL (traído de /api/propiedades por el componente). Va relajando
 * criterios si quedan pocas para nunca devolver vacío teniendo stock.
 */
export function recomendar(
  resp: Respuestas,
  todas: Propiedad[],
  max = 4,
): Propiedad[] {
  if (!todas.length) return [];
  const tope = topePresupuestoUSD(resp.presupuesto);
  const dentroDePresupuesto = (p: Propiedad) => {
    if (tope == null) return true;
    const usd = precioUSD(p);
    return usd == null || usd <= tope * 1.12; // 12% de margen
  };

  // Filtros del más restrictivo al más laxo: si un nivel queda vacío, soltamos
  // el criterio menos importante y reintentamos.
  const niveles: Array<(p: Propiedad) => boolean> = [
    (p) =>
      matchOperacion(p, resp.operacion) &&
      matchTipo(p, resp.tipo) &&
      matchZona(p, resp.zona) &&
      matchDormitorios(p, resp.dormitorios) &&
      dentroDePresupuesto(p),
    (p) =>
      matchOperacion(p, resp.operacion) &&
      matchTipo(p, resp.tipo) &&
      matchDormitorios(p, resp.dormitorios) &&
      dentroDePresupuesto(p),
    (p) => matchOperacion(p, resp.operacion) && matchTipo(p, resp.tipo) && dentroDePresupuesto(p),
    (p) => matchOperacion(p, resp.operacion) && dentroDePresupuesto(p),
    (p) => matchOperacion(p, resp.operacion),
    () => true,
  ];

  let pool: Propiedad[] = [];
  for (const filtro of niveles) {
    pool = todas.filter(filtro);
    if (pool.length > 0) break;
  }

  // Orden: destacadas primero, luego con precio visible, luego precio asc.
  pool = [...pool].sort((a, b) => {
    if (a.destacada_web !== b.destacada_web) return a.destacada_web ? -1 : 1;
    if (a.precio_visible !== b.precio_visible) return a.precio_visible ? -1 : 1;
    return (precioUSD(a) ?? Infinity) - (precioUSD(b) ?? Infinity);
  });

  return pool.slice(0, Math.max(2, Math.min(max, pool.length)));
}

/* ------------------------------------------------------------------ */
/*  Mensaje de WhatsApp final (toda la data + propiedades de interés)  */
/* ------------------------------------------------------------------ */

const LABEL_KEY: Record<RespKey, string> = {
  intencion: "Busca",
  operacion: "Operación",
  tipo: "Tipo",
  zona: "Zona",
  dormitorios: "Dormitorios",
  presupuesto: "Presupuesto",
};

function valorLegible(key: RespKey, valor: string): string {
  if (key === "operacion") return valor === "alquiler" ? "Alquiler" : "Venta";
  if (key === "dormitorios") {
    if (valor === "monoambiente") return "Monoambiente";
    if (valor === "4+") return "4 o más";
    if (valor === "indistinto") return "Indistinto";
    return valor;
  }
  return valor;
}

function precioLinea(p: Propiedad): string {
  if (!p.precio_visible || p.precio == null) return "Consultar precio";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

/** Arma el mensaje BIEN detallado para el handoff a WhatsApp. */
export function mensajeWhatsapp(
  resp: Respuestas,
  interesados: Propiedad[],
): string {
  const lineas: string[] = [
    "¡Hola Inmobiliaria América Cardozo! 👋 Vengo del asesor de la web.",
  ];

  if (resp.intencion) lineas.push(`\nQuiero *${resp.intencion}*.`);

  const orden: RespKey[] = ["operacion", "tipo", "zona", "dormitorios", "presupuesto"];
  const detalles = orden
    .filter((k) => resp[k])
    .map((k) => `• ${LABEL_KEY[k]}: ${valorLegible(k, resp[k] as string)}`);

  if (detalles.length) lineas.push(`\n${detalles.join("\n")}`);

  if (interesados.length) {
    const lista = interesados
      .map((p) => `• ${tituloPropiedad(p)} — ${precioLinea(p)}`)
      .join("\n");
    lineas.push(`\n🏠 Propiedades que me interesaron:\n${lista}`);
  }

  lineas.push(`\n¿Me dan una mano para avanzar? 🙌`);
  return lineas.join("\n");
}
