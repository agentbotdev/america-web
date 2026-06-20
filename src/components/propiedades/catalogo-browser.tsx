"use client";

import { useMemo, useState, useCallback } from "react";
import { SearchX, Search, X } from "lucide-react";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import PropertyCard from "@/components/propiedades/property-card";
import { Tilt } from "@/components/ui/tilt";
import { labelOperacion } from "@/lib/format";
import type { Propiedad } from "@/types";

// Catálogo de propiedades: filtrado + orden 100% en memoria (instantáneo, sin
// tocar el server). El server pasa los filtros del URL como estado inicial
// (deep-links sin flash) y, a partir de ahí, todo es client-side. La barra del
// navegador se sincroniza con history.replaceState (no hay viaje al server).

const OPERACIONES = [
  { value: "venta", label: "En venta" },
  { value: "alquiler", label: "En alquiler" },
];
const DORMITORIOS = [
  { value: "1", label: "1+ dorm." },
  { value: "2", label: "2+ dorm." },
  { value: "3", label: "3+ dorm." },
  { value: "4", label: "4+ dorm." },
];
const BANOS = [
  { value: "1", label: "1+ baño" },
  { value: "2", label: "2+ baños" },
  { value: "3", label: "3+ baños" },
];
const PRECIOS = [
  { value: "50000", label: "Hasta 50.000" },
  { value: "100000", label: "Hasta 100.000" },
  { value: "150000", label: "Hasta 150.000" },
  { value: "250000", label: "Hasta 250.000" },
];
const SUPERFICIES = [
  { value: "50", label: "50 m² o más" },
  { value: "80", label: "80 m² o más" },
  { value: "120", label: "120 m² o más" },
  { value: "200", label: "200 m² o más" },
];
const ORDENES = [
  { value: "destacadas", label: "Destacadas" },
  { value: "precio_asc", label: "Menor precio" },
  { value: "precio_desc", label: "Mayor precio" },
  { value: "nuevas", label: "Más nuevas" },
  { value: "superficie_desc", label: "Mayor superficie" },
];

type Filters = {
  q: string;
  operacion: string;
  tipo: string;
  barrio: string;
  dormitorios: string;
  banos: string;
  precio_max: string;
  superficie_min: string;
  orden: string;
};

export const FILTROS_VACIOS: Filters = {
  q: "",
  operacion: "all",
  tipo: "all",
  barrio: "all",
  dormitorios: "all",
  banos: "all",
  precio_max: "all",
  superficie_min: "all",
  orden: "destacadas",
};

export type CatalogoFilters = Filters;

function superficieDe(p: Propiedad): number {
  return p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos ?? 0;
}

// Filtra + ordena EN MEMORIA (instantáneo, sin tocar el servidor).
// `index` preserva el orden original del server (updated_at desc) para "Más nuevas".
function filtrar(items: Propiedad[], f: Filters): Propiedad[] {
  const indexed = items.map((p, index) => ({ p, index }));
  let r = indexed;

  const q = f.q.toLowerCase().trim();
  if (q) {
    r = r.filter(({ p }) =>
      `${p.titulo} ${p.barrio ?? ""} ${p.ciudad ?? ""} ${p.descripcion}`
        .toLowerCase()
        .includes(q),
    );
  }
  if (f.operacion !== "all") r = r.filter(({ p }) => p.tipo_operacion === f.operacion);
  if (f.tipo !== "all") r = r.filter(({ p }) => p.tipo_propiedad === f.tipo);
  if (f.barrio !== "all") r = r.filter(({ p }) => p.barrio === f.barrio);

  if (f.dormitorios !== "all") {
    const min = Number(f.dormitorios);
    if (Number.isFinite(min)) r = r.filter(({ p }) => (p.dormitorios ?? 0) >= min);
  }
  if (f.banos !== "all") {
    const min = Number(f.banos);
    if (Number.isFinite(min)) r = r.filter(({ p }) => (p.banos ?? 0) >= min);
  }
  if (f.precio_max !== "all") {
    const max = Number(f.precio_max);
    if (Number.isFinite(max)) {
      // Solo aplica a propiedades con precio visible y cargado; las "Consultar" no se filtran por precio.
      r = r.filter(({ p }) => p.precio == null || !p.precio_visible || p.precio <= max);
    }
  }
  if (f.superficie_min !== "all") {
    const min = Number(f.superficie_min);
    if (Number.isFinite(min)) r = r.filter(({ p }) => superficieDe(p) >= min);
  }

  const sorted = [...r].sort((a, b) => {
    switch (f.orden) {
      case "precio_asc":
        return (a.p.precio ?? Infinity) - (b.p.precio ?? Infinity);
      case "precio_desc":
        return (b.p.precio ?? -Infinity) - (a.p.precio ?? -Infinity);
      case "superficie_desc":
        return superficieDe(b.p) - superficieDe(a.p);
      case "nuevas":
        return a.index - b.index; // orden original del server (updated_at desc)
      default: // destacadas
        return Number(b.p.destacada_web) - Number(a.p.destacada_web) || a.index - b.index;
    }
  });

  return sorted.map(({ p }) => p);
}

export function CatalogoBrowser({
  propiedades,
  tipos,
  barrios,
  initial = FILTROS_VACIOS,
}: {
  propiedades: Propiedad[];
  tipos: string[];
  barrios: string[];
  initial?: Filters;
}) {
  const [f, setF] = useState<Filters>(initial);

  const sync = useCallback((next: Filters) => {
    const p = new URLSearchParams();
    if (next.q) p.set("q", next.q);
    if (next.operacion !== "all") p.set("operacion", next.operacion);
    if (next.tipo !== "all") p.set("tipo", next.tipo);
    if (next.barrio !== "all") p.set("barrio", next.barrio);
    if (next.dormitorios !== "all") p.set("dormitorios", next.dormitorios);
    if (next.banos !== "all") p.set("banos", next.banos);
    if (next.precio_max !== "all") p.set("precio_max", next.precio_max);
    if (next.superficie_min !== "all") p.set("superficie_min", next.superficie_min);
    if (next.orden !== "destacadas") p.set("orden", next.orden);
    const qs = p.toString();
    // Actualiza la barra del navegador SIN viaje al server (instantáneo).
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, []);

  const set = useCallback(
    (key: keyof Filters, value: string) => {
      setF((prev) => {
        const next = { ...prev, [key]: value };
        sync(next);
        return next;
      });
    },
    [sync],
  );

  const limpiar = useCallback(() => {
    setF(FILTROS_VACIOS);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const items = useMemo(() => filtrar(propiedades, f), [propiedades, f]);
  const hasFilters =
    f.q !== "" ||
    f.operacion !== "all" ||
    f.tipo !== "all" ||
    f.barrio !== "all" ||
    f.dormitorios !== "all" ||
    f.banos !== "all" ||
    f.precio_max !== "all" ||
    f.superficie_min !== "all" ||
    f.orden !== "destacadas";

  return (
    <>
      <p className="mb-6 text-muted-foreground">
        {items.length} {items.length === 1 ? "propiedad disponible" : "propiedades disponibles"}
      </p>

      {/* Filtros (instantáneos) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-1 items-center gap-2 sm:min-w-56">
          <Search className="ml-1.5 size-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={f.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Buscar por título, barrio..."
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Select value={f.operacion} onValueChange={(v) => set("operacion", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-36"><SelectValue>{(v) => (!v || v === "all" ? "Operación" : labelOperacion(v as "venta" | "alquiler"))}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Venta y alquiler</SelectItem>
            {OPERACIONES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.tipo} onValueChange={(v) => set("tipo", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-40"><SelectValue>{(v) => (!v || v === "all" ? "Tipo" : String(v))}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tipos.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.barrio} onValueChange={(v) => set("barrio", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-44"><SelectValue>{(v) => (!v || v === "all" ? "Barrio" : String(v))}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los barrios</SelectItem>
            {barrios.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.dormitorios} onValueChange={(v) => set("dormitorios", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-32"><SelectValue>{(v) => (!v || v === "all" ? "Dorm." : DORMITORIOS.find((d) => d.value === v)?.label ?? "Dorm.")}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Dormitorios</SelectItem>
            {DORMITORIOS.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.banos} onValueChange={(v) => set("banos", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-32"><SelectValue>{(v) => (!v || v === "all" ? "Baños" : BANOS.find((b) => b.value === v)?.label ?? "Baños")}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Baños</SelectItem>
            {BANOS.map((b) => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.precio_max} onValueChange={(v) => set("precio_max", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-36"><SelectValue>{(v) => (!v || v === "all" ? "Precio" : PRECIOS.find((p) => p.value === v)?.label ?? "Precio")}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier precio</SelectItem>
            {PRECIOS.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.superficie_min} onValueChange={(v) => set("superficie_min", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-36"><SelectValue>{(v) => (!v || v === "all" ? "Superficie" : SUPERFICIES.find((s) => s.value === v)?.label ?? "Superficie")}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier superficie</SelectItem>
            {SUPERFICIES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.orden} onValueChange={(v) => set("orden", String(v))}>
          <SelectTrigger className="h-9 w-full sm:w-40"><SelectValue>{(v) => ORDENES.find((o) => o.value === v)?.label ?? "Orden"}</SelectValue></SelectTrigger>
          <SelectContent>
            {ORDENES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={limpiar}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-muted-foreground hover:bg-secondary"
          >
            <X className="size-4" /> Limpiar
          </button>
        )}
      </div>

      {/* Grid (instantáneo, sin recargar) */}
      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <SearchX className="size-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">No encontramos propiedades con esos filtros</p>
          <p className="text-sm text-muted-foreground">Probá ampliando la búsqueda o limpiando los filtros.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Tilt key={p.id} className="h-full">
              <PropertyCard propiedad={p} />
            </Tilt>
          ))}
        </div>
      )}
    </>
  );
}

export default CatalogoBrowser;
