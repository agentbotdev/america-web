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
  "coordenadas_lat,coordenadas_lng,destacada_web,alquiler_temporal,tags,tiene_video,orientacion";

const FOTO_COLS = "propiedad_id,url,thumbnail,descripcion,es_portada,es_plano,orden";

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
      alt: str(f.descripcion) ?? "",
      es_portada: Boolean(f.es_portada),
      es_plano: Boolean(f.es_plano),
      orden: Number(f.orden) || 0,
    }));
}

function mapRow(r: Record<string, unknown>, fotos: FotoPropiedad[]): Propiedad {
  const id = String(r.tokko_id);
  const operacion: TipoOperacion = r.tipo_operacion === "alquiler" ? "alquiler" : "venta";
  const moneda: Moneda = r.moneda === "ARS" ? "ARS" : "USD";
  return {
    id,
    slug: propiedadSlug(String(r.titulo ?? ""), id),
    titulo: String(r.titulo ?? "Propiedad"),
    descripcion: String(r.descripcion ?? ""),
    reference_code: str(r.reference_code),
    tipo_propiedad: String(r.tipo_propiedad ?? "Propiedad"),
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
    precio: num(r.precio),
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
    tags: Array.isArray(r.tags) ? (r.tags as unknown[]).map(String) : [],
    tiene_video: Boolean(r.tiene_video),
    orientacion: str(r.orientacion),
    fotos,
  };
}

type SB = ReturnType<typeof createPublicClient>;

// Segunda query: trae las fotos de las propiedades dadas y las pega a cada una.
async function attachFotos(sb: SB, props: Record<string, unknown>[]): Promise<Propiedad[]> {
  if (!props.length) return [];
  const ids = props.map((p) => String(p.tokko_id));
  const { data: fotosRows } = await sb
    .from("fotos_publicas")
    .select(FOTO_COLS)
    .in("propiedad_id", ids);

  const byProp = new Map<string, Array<Record<string, unknown>>>();
  for (const f of (fotosRows as unknown as Array<Record<string, unknown>> | null) ?? []) {
    const k = String(f.propiedad_id);
    if (!byProp.has(k)) byProp.set(k, []);
    byProp.get(k)!.push(f);
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
    if (error || !props?.length) return mockPropiedades();
    return attachFotos(sb, props as unknown as Record<string, unknown>[]);
  } catch {
    return mockPropiedades();
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
    if (error || !props?.length) return mockDestacadas();
    return attachFotos(sb, props as unknown as Record<string, unknown>[]);
  } catch {
    return mockDestacadas();
  }
}

export async function getPropiedadBySlug(slug: string): Promise<Propiedad | undefined> {
  const id = idFromSlug(slug);
  if (!hasSupabase()) return mockBySlug(slug);
  try {
    const sb = createPublicClient();
    const { data } = await sb
      .from("propiedades_publicas")
      .select(COLS)
      .eq("tokko_id", id)
      .maybeSingle();
    if (!data) return mockBySlug(slug);
    const { data: fotosRows } = await sb
      .from("fotos_publicas")
      .select(FOTO_COLS)
      .eq("propiedad_id", id);
    return mapRow(
      data as unknown as Record<string, unknown>,
      mapFotos((fotosRows as unknown as Array<Record<string, unknown>>) ?? []),
    );
  } catch {
    return mockBySlug(slug);
  }
}
