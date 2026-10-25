import { createPublicClient } from "@/lib/supabase/server";
import {
  getPropiedades as mockPropiedades,
  getPropiedadBySlug as mockBySlug,
  getDestacadas as mockDestacadas,
} from "@/data/propiedades";
import { propiedadSlug, idFromSlug } from "@/lib/slug";
import type { Propiedad, FotoPropiedad, TipoOperacion, Moneda } from "@/types";

// La web pública lee SOLO las vistas blindadas `propiedades_publicas` y
// `fotos_publicas` (columnas seguras, RLS-safe). La tabla base `propiedades`
// está cerrada a `anon` (permission denied). Las fotos NO tienen FK → 2 queries
// separadas (decisión verificada): traemos propiedades y luego sus fotos por `.in`.

const COLS =
  "tokko_id,titulo,descripcion,reference_code,tipo_propiedad,tipo_propiedad_code," +
  "tipo_operacion,estado_propiedad,ambientes,dormitorios,banos,toilettes,cocheras," +
  "plantas,antiguedad,superficie_total,superficie_cubierta,superficie_semicubierta," +
  "superficie_descubierta,metros_cubiertos,frente,fondo,precio,moneda,precio_venta," +
  "precio_alquiler,moneda_venta,moneda_alquiler,precio_visible,expensas,apto_credito," +
  "barrio,ciudad,zona,provincia,direccion_publica,location_short,location_full," +
  "coordenadas_lat,coordenadas_lng,destacada_web,alquiler_temporal,tags,tiene_video,orientacion,videos";

const FOTO_COLS = "propiedad_id,url,thumbnail,descripcion,es_portada,es_plano,orden";

/**
 * Supabase falló (error, timeout, red). ANTES se devolvía el MOCK de data/propiedades.ts:
 * avisos inventados con precio ("Casa 3 dormitorios… USD 145.000") que la caché ISR podía
 * dejar publicados más de 10 minutos (auditoría 24/10). Ahora se TIRA el error: en una
 * revalidación ISR, Next conserva la última versión buena de la página y reintenta en la
 * próxima, así que el visitante sigue viendo el catálogo real. El mock queda solo para
 * desarrollo local sin variables de entorno (`hasSupabase()` falso).
 */
function falloSupabase(donde: string, error: unknown): never {
  console.error(`[supabase] ${donde}:`, error);
  throw new Error(`No se pudo leer ${donde} de Supabase`);
}

function hasSupabase() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// numeric de Postgres llega como string → number (o undefined si vacío).
function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function str(v: unknown): string | undefined {
  return v === null || v === undefined || v === "" ? undefined : String(v);
}

function mapFotos(rows: Array<Record<string, unknown>>): FotoPropiedad[] {
  return [...rows]
    .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0))
    .map((f) => ({
      url: String(f.url),
      thumbnail: str(f.thumbnail),
      // Sin `?? ""`: un alt vacío es peor que ausente — pisaba al título en el
      // fallback de PropertyImage y dejaba la foto sin texto alternativo.
      alt: str(f.descripcion),
      es_portada: Boolean(f.es_portada),
      es_plano: Boolean(f.es_plano),
      orden: Number(f.orden) || 0,
    }));
}

// "casa" y "Casa" llegaban como dos tipos distintos y el filtro los mostraba duplicados
// (Nacho, 20/10): algunas fichas se cargaron en minúscula. Se unifica con la inicial en
// mayúscula; "PH" y los tipos ya bien escritos quedan igual.
function tipoNormalizado(v: unknown): string {
  const t = String(v ?? "").trim();
  if (!t) return "Propiedad";
  return t === t.toLowerCase() ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

// `propiedades.videos` es jsonb: [{url, titulo}]. Se descarta lo que no sea un link http(s).
function videosDe(v: unknown): { url: string; titulo?: string }[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((x) => {
    const url = typeof (x as { url?: unknown })?.url === "string" ? (x as { url: string }).url.trim() : "";
    if (!/^https?:\/\//i.test(url)) return [];
    const titulo = (x as { titulo?: unknown }).titulo;
    return [{ url, ...(typeof titulo === "string" && titulo.trim() ? { titulo: titulo.trim() } : {}) }];
  });
}

function mapRow(r: Record<string, unknown>, fotos: FotoPropiedad[]): Propiedad {
  const id = String(r.tokko_id);
  const operacion: TipoOperacion = r.tipo_operacion === "alquiler" ? "alquiler" : "venta";
  // El CRM edita precio_venta / precio_alquiler (y sus monedas). La columna `precio` es la
  // vieja de Tokko: ya no se actualiza y en las propiedades cargadas a mano viene vacía, así
  // que la web mostraba el precio anterior o "Consultar" (la inmo, 19/10: Uruguay 1629 bajó
  // a 170.000 y la web seguía en 180.000). Manda el precio de la operación; `precio` queda
  // solo de respaldo.
  const esAlquiler = operacion === "alquiler";
  const precioReal = esAlquiler ? num(r.precio_alquiler) : num(r.precio_venta);
  const monedaReal = esAlquiler ? r.moneda_alquiler : r.moneda_venta;
  const moneda: Moneda = (monedaReal ?? r.moneda) === "ARS" ? "ARS" : "USD";
  return {
    id,
    slug: propiedadSlug(String(r.titulo ?? ""), id),
    titulo: String(r.titulo ?? "Propiedad"),
    descripcion: String(r.descripcion ?? ""),
    reference_code: str(r.reference_code),
    tipo_propiedad: tipoNormalizado(r.tipo_propiedad),
    tipo_propiedad_code: str(r.tipo_propiedad_code),
    tipo_operacion: operacion,
    estado_propiedad: str(r.estado_propiedad),
    ambientes: num(r.ambientes),
    dormitorios: num(r.dormitorios),
    banos: num(r.banos),
    toilettes: num(r.toilettes),
    cocheras: num(r.cocheras),
    plantas: num(r.plantas),
    antiguedad: num(r.antiguedad),
    superficie_total: num(r.superficie_total),
    superficie_cubierta: num(r.superficie_cubierta),
    superficie_semicubierta: num(r.superficie_semicubierta),
    superficie_descubierta: num(r.superficie_descubierta),
    metros_cubiertos: num(r.metros_cubiertos),
    frente: num(r.frente),
    fondo: num(r.fondo),
    precio: precioReal ?? num(r.precio),
    moneda,
    precio_venta: num(r.precio_venta),
    precio_alquiler: num(r.precio_alquiler),
    precio_visible: Boolean(r.precio_visible),
    expensas: num(r.expensas),
    apto_credito: str(r.apto_credito),
    barrio: str(r.barrio),
    ciudad: str(r.ciudad),
    zona: str(r.zona),
    provincia: str(r.provincia),
    direccion_publica: str(r.direccion_publica),
    location_short: str(r.location_short),
    location_full: str(r.location_full),
    coordenadas_lat: num(r.coordenadas_lat),
    coordenadas_lng: num(r.coordenadas_lng),
    destacada_web: Boolean(r.destacada_web),
    alquiler_temporal: Boolean(r.alquiler_temporal),
    // Dedup: Tokko repite tags entre amenities y servicios ("Cocina" dos veces)
    // → keys duplicadas en React en TODO lo que lista tags (ficha, brochure,
    // favoritos). Un Set en la fuente lo corta de raíz.
    tags: Array.isArray(r.tags) ? [...new Set((r.tags as unknown[]).map(String))] : [],
    tiene_video: Boolean(r.tiene_video),
    videos: videosDe(r.videos),
    orientacion: str(r.orientacion),
    fotos,
  };
}

type SB = ReturnType<typeof createPublicClient>;

// Segunda query: pega a cada propiedad SU FOTO DE PORTADA. Para los listados
// (catálogo, destacadas) con la portada alcanza → 1 foto por propiedad, muy por
// debajo del límite de filas de PostgREST (~1000). El bug que tenía: traer TODAS
// las fotos de las 109 propiedades de una (2400+) chocaba con ese límite y dejaba
// a la mayoría de las cards sin imagen. La ficha (getPropiedadBySlug) sí trae todas.
async function attachFotos(sb: SB, props: Record<string, unknown>[]): Promise<Propiedad[]> {
  if (!props.length) return [];
  const ids = props.map((p) => String(p.tokko_id));

  const byProp = new Map<string, Array<Record<string, unknown>>>();

  // 1) Portada de cada propiedad (es_portada = true). ~1 foto por propiedad.
  const { data: portadas } = await sb
    .from("fotos_publicas")
    .select(FOTO_COLS)
    .in("propiedad_id", ids)
    .eq("es_portada", true);
  for (const f of (portadas as unknown as Array<Record<string, unknown>> | null) ?? []) {
    byProp.set(String(f.propiedad_id), [f]);
  }

  // 2) Para las propiedades SIN es_portada marcada, su primera foto (orden asc).
  const sinPortada = ids.filter((id) => !byProp.has(id));
  if (sinPortada.length) {
    const { data: extras } = await sb
      .from("fotos_publicas")
      .select(FOTO_COLS)
      .in("propiedad_id", sinPortada)
      .order("orden", { ascending: true });
    for (const f of (extras as unknown as Array<Record<string, unknown>> | null) ?? []) {
      const k = String(f.propiedad_id);
      if (!byProp.has(k)) byProp.set(k, [f]); // primera por orden asc
    }
  }

  return props.map((p) => mapRow(p, mapFotos(byProp.get(String(p.tokko_id)) ?? [])));
}

export async function getPropiedades(): Promise<Propiedad[]> {
  if (!hasSupabase()) return mockPropiedades();
  try {
    const sb = createPublicClient();
    const { data: props, error } = await sb
      .from("propiedades_publicas")
      .select(COLS)
      .order("destacada_web", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });
    if (error) falloSupabase("propiedades_publicas", error);
    return attachFotos(sb, (props ?? []) as unknown as Record<string, unknown>[]);
  } catch (e) {
    falloSupabase("el catálogo", e);
  }
}

export async function getDestacadas(): Promise<Propiedad[]> {
  if (!hasSupabase()) return mockDestacadas();
  try {
    const sb = createPublicClient();
    const { data: props, error } = await sb
      .from("propiedades_publicas")
      .select(COLS)
      .eq("destacada_web", true);
    if (error) falloSupabase("las destacadas", error);
    return attachFotos(sb, (props ?? []) as unknown as Record<string, unknown>[]);
  } catch (e) {
    falloSupabase("las destacadas", e);
  }
}

export async function getPropiedadBySlug(slug: string): Promise<Propiedad | undefined> {
  const id = idFromSlug(slug);
  if (!hasSupabase()) return mockBySlug(slug);
  try {
    const sb = createPublicClient();
    const { data, error } = await sb
      .from("propiedades_publicas")
      .select(COLS)
      .eq("tokko_id", id)
      .maybeSingle();
    if (error) falloSupabase("la ficha", error);
    // Sin fila = la propiedad no está publicada (vendida, en borrador): 404 de verdad, no
    // una ficha de ejemplo con otro precio.
    if (!data) return undefined;
    const { data: fotosRows } = await sb
      .from("fotos_publicas")
      .select(FOTO_COLS)
      .eq("propiedad_id", id);
    return mapRow(
      data as unknown as Record<string, unknown>,
      mapFotos((fotosRows as unknown as Array<Record<string, unknown>>) ?? []),
    );
  } catch (e) {
    falloSupabase("la ficha", e);
  }
}
