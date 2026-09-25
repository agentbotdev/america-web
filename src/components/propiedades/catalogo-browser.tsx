"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { SearchX, Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useMediaQuery } from "@/lib/use-client-hooks";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import PropertyCard from "@/components/propiedades/property-card";
import { labelOperacion } from "@/lib/format";
import type { Propiedad } from "@/types";

// Catálogo de propiedades: filtrado + orden 100% en memoria (instantáneo, sin
// tocar el server). El server pasa los filtros del URL como estado inicial
// (deep-links sin flash) y, a partir de ahí, todo es client-side. La barra del
// navegador se sincroniza con history.replaceState (no hay viaje al server).
//
// RENDER: tandas con botón "Ver más" EXPLÍCITO (antes era scroll infinito).
// El scroll infinito seguía cargando solo mientras bajabas: en el celular
// terminabas con decenas de cards montadas, la página no terminaba nunca y al
// pie no se llegaba. Con un botón, las tandas las pide el usuario.
// La tanda se resetea al cambiar cualquier filtro/orden → siempre arrancás
// desde arriba con resultados frescos.

// Menos cards por tanda en el celular que en escritorio: en mobile la grilla es
// de UNA columna, así que 9 cards son 9 pantallazos de scroll. En escritorio son
// 3 columnas → 9 entran en tres filas prolijas.
const PASO_MOBILE = 6;
const PASO_DESKTOP = 9;

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
  precio_min: string;
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
  precio_min: "",
  precio_max: "",
  superficie_min: "all",
  orden: "destacadas",
};

export type CatalogoFilters = Filters;

function superficieDe(p: Propiedad): number {
  return p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos ?? 0;
}

// Parseo tolerante de los inputs numéricos de precio (vacío / no-número → null).
function numOrNull(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// Formatea miles para los chips de precio: 150000 → "150.000".
const milesFmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

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

  // Rango de precio: solo aplica a propiedades con precio visible y cargado;
  // las "Consultar" (precio oculto) nunca se descartan por precio.
  const pMin = numOrNull(f.precio_min);
  const pMax = numOrNull(f.precio_max);
  if (pMin != null) {
    r = r.filter(({ p }) => p.precio == null || !p.precio_visible || p.precio >= pMin);
  }
  if (pMax != null) {
    r = r.filter(({ p }) => p.precio == null || !p.precio_visible || p.precio <= pMax);
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
  // Panel de filtros colapsable en mobile (en desktop siempre visible).
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  // Cuántas tandas EXTRA pidió el usuario con "Ver más". El total visible se
  // DERIVA de esto y del paso, no se guarda: así el paso puede cambiar al rotar
  // el teléfono (mobile ↔ desktop) sin quedar desincronizado con el estado.
  const [tandasExtra, setTandasExtra] = useState(0);
  const esDesktop = useMediaQuery("(min-width: 640px)");
  const paso = esDesktop ? PASO_DESKTOP : PASO_MOBILE;

  const sync = useCallback((next: Filters) => {
    const p = new URLSearchParams();
    if (next.q) p.set("q", next.q);
    if (next.operacion !== "all") p.set("operacion", next.operacion);
    if (next.tipo !== "all") p.set("tipo", next.tipo);
    if (next.barrio !== "all") p.set("barrio", next.barrio);
    if (next.dormitorios !== "all") p.set("dormitorios", next.dormitorios);
    if (next.banos !== "all") p.set("banos", next.banos);
    if (next.precio_min) p.set("precio_min", next.precio_min);
    if (next.precio_max) p.set("precio_max", next.precio_max);
    if (next.superficie_min !== "all") p.set("superficie_min", next.superficie_min);
    if (next.orden !== "destacadas") p.set("orden", next.orden);
    const qs = p.toString();
    // Actualiza la barra del navegador SIN viaje al server (instantáneo).
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, []);

  const set = useCallback((key: keyof Filters, value: string) => {
    // Updater PURO: nada de side effects acá. Antes llamaba a sync() adentro
    // y eso corre DURANTE el render — Next parchea history.replaceState para
    // sincronizar su Router, así que explotaba con "Cannot update Router while
    // rendering CatalogoBrowser" (y en StrictMode disparaba doble).
    setF((prev) => ({ ...prev, [key]: value }));
  }, []);

  const limpiar = useCallback(() => {
    setF(FILTROS_VACIOS);
  }, []);

  // La URL se sincroniza DESPUÉS del commit, cuando los filtros ya cambiaron.
  // Salteamos el primer render: el estado inicial YA viene de la URL (deep-link)
  // y reescribirla en el mount pisaría params ajenos (por ej. UTM).
  const primeraVez = useRef(true);
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    sync(f);
  }, [f, sync]);

  const items = useMemo(() => filtrar(propiedades, f), [propiedades, f]);

  // Al cambiar el resultado del filtrado, reseteamos la tanda visible: el usuario
  // siempre ve la "primera página" de su nueva búsqueda desde arriba.
  //
  // Se ajusta DURANTE el render comparando con los items previos, no con un
  // effect. Es el patrón que documenta React para "resetear estado cuando
  // cambia una entrada" (react.dev/learn/you-might-not-need-an-effect):
  // React detecta el setState en render, descarta el render en curso y vuelve
  // a renderizar de inmediato SIN pintar el intermedio.
  // Con el effect anterior el usuario veía un frame con la lista nueva y el
  // scroll/paginado viejo antes de que el effect corrigiera.
  const [itemsPrevios, setItemsPrevios] = useState(items);
  if (items !== itemsPrevios) {
    setItemsPrevios(items);
    setTandasExtra(0);
  }

  // Total visible DERIVADO: primera tanda + las que el usuario haya pedido.
  const visibles = Math.min(paso * (1 + tandasExtra), items.length);
  const mostrados = useMemo(() => items.slice(0, visibles), [items, visibles]);
  const hayMas = visibles < items.length;
  const restantes = items.length - visibles;

  const hasFilters =
    f.q !== "" ||
    f.operacion !== "all" ||
    f.tipo !== "all" ||
    f.barrio !== "all" ||
    f.dormitorios !== "all" ||
    f.banos !== "all" ||
    f.precio_min !== "" ||
    f.precio_max !== "" ||
    f.superficie_min !== "all" ||
    f.orden !== "destacadas";

  // Cantidad de filtros que REDUCEN el set (para el badge del botón mobile).
  const activosCount =
    (f.q ? 1 : 0) +
    (f.operacion !== "all" ? 1 : 0) +
    (f.tipo !== "all" ? 1 : 0) +
    (f.barrio !== "all" ? 1 : 0) +
    (f.dormitorios !== "all" ? 1 : 0) +
    (f.banos !== "all" ? 1 : 0) +
    (f.precio_min || f.precio_max ? 1 : 0) +
    (f.superficie_min !== "all" ? 1 : 0);

  // Chips de filtros ACTIVOS: label legible + cómo se resetea cada uno.
  // El orden no entra como chip (no "restringe" resultados, solo los reordena).
  const chips = useMemo(() => {
    const out: { key: string; label: string; clear: () => void }[] = [];
    if (f.q) out.push({ key: "q", label: `"${f.q}"`, clear: () => set("q", "") });
    if (f.operacion !== "all")
      out.push({ key: "operacion", label: labelOperacion(f.operacion as "venta" | "alquiler"), clear: () => set("operacion", "all") });
    if (f.tipo !== "all") out.push({ key: "tipo", label: f.tipo, clear: () => set("tipo", "all") });
    if (f.barrio !== "all") out.push({ key: "barrio", label: f.barrio, clear: () => set("barrio", "all") });
    if (f.dormitorios !== "all")
      out.push({ key: "dormitorios", label: DORMITORIOS.find((d) => d.value === f.dormitorios)?.label ?? f.dormitorios, clear: () => set("dormitorios", "all") });
    if (f.banos !== "all")
      out.push({ key: "banos", label: BANOS.find((b) => b.value === f.banos)?.label ?? f.banos, clear: () => set("banos", "all") });
    if (f.precio_min || f.precio_max) {
      const min = numOrNull(f.precio_min);
      const max = numOrNull(f.precio_max);
      const label =
        min != null && max != null
          ? `${milesFmt.format(min)} – ${milesFmt.format(max)}`
          : min != null
            ? `Desde ${milesFmt.format(min)}`
            : `Hasta ${milesFmt.format(max ?? 0)}`;
      out.push({
        key: "precio",
        label,
        clear: () => setF((prev) => { const next = { ...prev, precio_min: "", precio_max: "" }; sync(next); return next; }),
      });
    }
    if (f.superficie_min !== "all")
      out.push({ key: "superficie_min", label: SUPERFICIES.find((s) => s.value === f.superficie_min)?.label ?? f.superficie_min, clear: () => set("superficie_min", "all") });
    return out;
  }, [f, set, sync]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{items.length}</span>{" "}
          {items.length === 1 ? "propiedad" : "propiedades"}
          {/* "según tu búsqueda" solo si hay filtros que REDUCEN el set. */}
          {activosCount > 0 ? " según tu búsqueda" : " disponibles"}
        </p>

        {/* Toggle de filtros: solo en mobile/tablet (en lg+ los filtros viven siempre abiertos). */}
        {/* Botón de filtros mobile — pasa a ser un CTA de verdad.
            Era un chip discreto de 32px de alto sobre fondo claro: en el celular
            no se leía como "acá filtrás" y el catálogo parecía una lista sin
            controles. Ahora tiene el rojo de marca cuando hay filtros activos,
            44px de alto y dice qué hace. */}
        <button
          type="button"
          onClick={() => setFiltrosOpen((o) => !o)}
          aria-expanded={filtrosOpen}
          aria-controls="panel-filtros"
          className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors lg:hidden ${
            activosCount > 0
              ? "border border-brand bg-brand text-brand-foreground"
              : "border border-brand/45 bg-white/60 text-brand-text hover:border-brand"
          }`}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {filtrosOpen ? "Ocultar filtros" : "Filtrar"}
          {activosCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-foreground text-xs font-bold text-brand">
              {activosCount}
            </span>
          )}
        </button>
      </div>

      {/* Filtros (instantáneos). En mobile se colapsan; en lg+ siempre visibles. */}
      {/* `grid-cols-2` en mobile: los selects de una columna dejaban el panel
          larguísimo y había que scrollear dentro del panel para ver los últimos
          filtros. De a dos entra todo de un vistazo. El buscador y el orden
          ocupan la fila completa (`col-span-2`, más abajo). */}
      <div
        id="panel-filtros"
        className={`${filtrosOpen ? "grid" : "hidden"} grid-cols-2 gap-2.5 rounded-lg border border-border bg-card p-3 sm:gap-3 lg:flex lg:flex-wrap lg:items-center`}
      >
        {/* El buscador ocupa la fila entera en mobile: es el filtro que más se
            usa y de media columna no entraba el placeholder. */}
        <div className="col-span-2 flex items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 lg:col-span-1 lg:min-w-56 lg:flex-1">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={f.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Barrio, ciudad o palabra clave"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground lg:h-9"
          />
        </div>

        <Select value={f.operacion} onValueChange={(v) => set("operacion", String(v))}>
          <SelectTrigger className="h-11 lg:h-9 w-full lg:w-36"><SelectValue>{(v) => (!v || v === "all" ? "Operación" : labelOperacion(v as "venta" | "alquiler"))}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Venta y alquiler</SelectItem>
            {OPERACIONES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.tipo} onValueChange={(v) => set("tipo", String(v))}>
          <SelectTrigger className="h-11 lg:h-9 w-full lg:w-40"><SelectValue>{(v) => (!v || v === "all" ? "Tipo" : String(v))}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tipos.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.barrio} onValueChange={(v) => set("barrio", String(v))}>
          <SelectTrigger className="h-11 lg:h-9 w-full lg:w-44"><SelectValue>{(v) => (!v || v === "all" ? "Zona / Barrio" : String(v))}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las zonas</SelectItem>
            {barrios.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.dormitorios} onValueChange={(v) => set("dormitorios", String(v))}>
          <SelectTrigger className="h-11 lg:h-9 w-full lg:w-32"><SelectValue>{(v) => (!v || v === "all" ? "Dorm." : DORMITORIOS.find((d) => d.value === v)?.label ?? "Dorm.")}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Dormitorios</SelectItem>
            {DORMITORIOS.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.banos} onValueChange={(v) => set("banos", String(v))}>
          <SelectTrigger className="h-11 lg:h-9 w-full lg:w-32"><SelectValue>{(v) => (!v || v === "all" ? "Baños" : BANOS.find((b) => b.value === v)?.label ?? "Baños")}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Baños</SelectItem>
            {BANOS.map((b) => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
          </SelectContent>
        </Select>

        {/* Rango de precio (min – max). Inputs numéricos: filtran solo a las
            propiedades con precio visible (las "Consultar" no se descartan). */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={f.precio_min}
            onChange={(e) => set("precio_min", e.target.value)}
            placeholder="Precio mín."
            aria-label="Precio mínimo"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring lg:w-28"
          />
          <span className="text-muted-foreground" aria-hidden="true">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={f.precio_max}
            onChange={(e) => set("precio_max", e.target.value)}
            placeholder="Precio máx."
            aria-label="Precio máximo"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring lg:w-28"
          />
        </div>

        <Select value={f.superficie_min} onValueChange={(v) => set("superficie_min", String(v))}>
          <SelectTrigger className="h-11 lg:h-9 w-full lg:w-36"><SelectValue>{(v) => (!v || v === "all" ? "Superficie" : SUPERFICIES.find((s) => s.value === v)?.label ?? "Superficie")}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier superficie</SelectItem>
            {SUPERFICIES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={f.orden} onValueChange={(v) => set("orden", String(v))}>
          <SelectTrigger className="h-11 lg:h-9 w-full lg:w-40"><SelectValue>{(v) => ORDENES.find((o) => o.value === v)?.label ?? "Orden"}</SelectValue></SelectTrigger>
          <SelectContent>
            {ORDENES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={limpiar}
            aria-label="Limpiar todos los filtros"
            className="inline-flex h-9 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-brand-text transition-colors hover:bg-brand/10"
          >
            <X className="size-4" aria-hidden="true" /> Limpiar
          </button>
        )}
      </div>

      {/* Chips de filtros activos: cada uno se quita individualmente. */}
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filtros activos:</span>
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.clear}
              aria-label={`Quitar filtro ${c.label}`}
              className="inline-flex items-center gap-1 rounded-sm border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-text transition-colors hover:bg-brand/20"
            >
              {c.label}
              <X className="size-3" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {/* Grid (instantáneo, sin recargar) */}
      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/50 px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
            <SearchX className="size-8" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <p className="text-lg font-semibold">No encontramos propiedades con esos filtros</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Probá ampliando la búsqueda o limpiando los filtros para ver todo el stock disponible.
            </p>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand px-5 text-sm font-medium text-brand-foreground transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <X className="size-4" aria-hidden="true" /> Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mostrados.map((p) => (
              <div key={p.id} className="h-full">
                <PropertyCard propiedad={p} />
              </div>
            ))}
          </div>

          {/* VER MÁS explícito. Muestra cuántas quedan: sin ese número el
              usuario no sabe si faltan 3 o 130, y decide a ciegas si seguir. */}
          {hayMas ? (
            <div className="mt-10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setTandasExtra((t) => t + 1)}
                className="inline-flex h-13 items-center gap-2 rounded-md bg-brand px-8 text-sm font-semibold text-brand-foreground transition hover:brightness-110 active:scale-[0.98]"
              >
                Ver más propiedades
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Mostrando {visibles} de {items.length} · quedan {restantes}
              </p>
            </div>
          ) : (
            items.length > paso && (
              <p className="mt-10 text-center text-sm text-muted-foreground" aria-live="polite">
                Viste las {items.length} propiedades. ¿No encontraste lo que buscás?{" "}
                <span className="font-medium text-foreground">Escribinos por WhatsApp</span> y te
                conseguimos la propiedad ideal.
              </p>
            )
          )}
        </>
      )}
    </>
  );
}

export default CatalogoBrowser;
