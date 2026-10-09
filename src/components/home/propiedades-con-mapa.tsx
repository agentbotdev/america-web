"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search } from "lucide-react";
import PropertyCard from "@/components/propiedades/property-card";
import { MapaPropiedades, type PuntoMapa } from "./mapa-propiedades";
import { coincideBusqueda, datosBuscables, interpretarBusqueda, type DatosBuscables } from "@/lib/buscador";
import { scoreVidriera } from "@/lib/vidriera";
import type { Propiedad } from "@/types";

// PROPIEDADES, justo debajo del hero (pedido de Nacho, 08/10): el video termina adentro
// de una casa y acá se "aterriza" en las propiedades. Arriba el título y una BARRA de
// búsqueda (la de la versión 1: una sola frase, "casa en venta en Moreno"), debajo el MAPA
// (el de la versión 3) y abajo las propiedades.
//
// Mientras se escribe, el mapa y la grilla se filtran EN VIVO; con Enter (o Buscar) se va
// al catálogo completo con esa búsqueda ya aplicada, donde están todos los filtros.

export type PuntoBuscable = PuntoMapa & DatosBuscables;

/** Cuántas propiedades muestra la grilla (las demás, en el catálogo). */
const EN_GRILLA = 6;

export function PropiedadesConMapa({
  puntos,
  destacadas,
}: {
  /** Todas las propiedades geolocalizadas, con lo justo para el pin y para filtrar. */
  puntos: PuntoBuscable[];
  /** Las que se muestran sin búsqueda, ya ordenadas por vidriera. */
  destacadas: Propiedad[];
}) {
  const router = useRouter();
  const [frase, setFrase] = useState("");
  // El filtrado (y re-encuadrar el mapa) va un paso atrás del teclado: escribir nunca se traba.
  const fraseDiferida = useDeferredValue(frase);
  const busqueda = useMemo(() => interpretarBusqueda(fraseDiferida), [fraseDiferida]);
  const hayBusqueda = !!(busqueda.operacion || busqueda.tipo || busqueda.texto);

  const visibles = useMemo(
    () => (hayBusqueda ? new Set(puntos.filter((p) => coincideBusqueda(busqueda, p)).map((p) => p.id)) : null),
    [hayBusqueda, busqueda, puntos],
  );

  // Para la grilla hacen falta las propiedades COMPLETAS (foto, specs, precio). Se bajan
  // recién cuando alguien empieza a buscar, del mismo endpoint cacheado que usan los
  // favoritos — la home no carga el catálogo entero de entrada.
  const [catalogo, setCatalogo] = useState<Propiedad[] | null>(null);
  const pedido = useRef(false);
  const traerCatalogo = () => {
    if (pedido.current) return;
    pedido.current = true;
    fetch("/api/propiedades")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: unknown) => setCatalogo(Array.isArray(d) ? (d as Propiedad[]) : []))
      .catch(() => setCatalogo([]));
  };

  const resultados = useMemo(() => {
    if (!hayBusqueda) return destacadas;
    if (!catalogo) return null; // todavía bajando
    return catalogo
      .filter((p) => coincideBusqueda(busqueda, datosBuscables(p)))
      .sort((a, b) => scoreVidriera(b) - scoreVidriera(a));
  }, [hayBusqueda, busqueda, catalogo, destacadas]);

  const destinoCatalogo = frase.trim() ? `/propiedades?q=${encodeURIComponent(frase.trim())}` : "/propiedades";

  const buscar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(destinoCatalogo);
  };

  const hayCards = !!resultados && resultados.length > 0;

  return (
    <section id="propiedades" aria-labelledby="titulo-propiedades">
      {/* ARRIBA EN BLANCO, con letras negras (Nacho, 09/10): el video del hero termina con el
          piso fundido al blanco de la página y esto sigue sin corte. Se probó una banda roja
          con degradé desde el blanco y quedaba feo. */}
      <div className="px-4 pb-8 pt-12 text-center sm:pb-10 sm:pt-16">
        <h2 id="titulo-propiedades" className="text-3xl font-semibold text-foreground sm:text-4xl">
          Nuestras propiedades
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
          Escribí qué buscás y dónde: el mapa y la lista se actualizan al instante.
        </p>

        <form
          action="/propiedades"
          method="get"
          onSubmit={buscar}
          role="search"
          className="mx-auto mt-7 flex max-w-2xl items-center gap-2 rounded-full border border-foreground/15 bg-white p-1.5 shadow-[0_18px_44px_-24px_rgba(60,45,20,0.45)] transition focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/15"
        >
          <Search className="ml-3 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            // El placeholder muestra un EJEMPLO COMBINADO a propósito: la frase se
            // interpreta (tipo + operación + zona), y si no se sugiere nadie lo descubre solo.
            name="q"
            type="search"
            value={frase}
            onChange={(e) => setFrase(e.target.value)}
            onFocus={traerCatalogo}
            placeholder="Ej: casa en venta en Moreno"
            aria-label="Buscar propiedades"
            autoComplete="off"
            className="h-11 w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-110 active:scale-[0.98] sm:px-7"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* rounded-[20px]: pedido del cliente en la v3 — el mapa con más curva que las cards. */}
        <div className="overflow-hidden rounded-[20px] border border-foreground/12 bg-white shadow-[0_24px_56px_-32px_rgba(60,45,20,0.45)]">
          <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-3">
            <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
            <p className="text-sm font-semibold text-foreground">Explorá por el mapa</p>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground" aria-live="polite">
              {visibles ? visibles.size : puntos.length} en el mapa
            </span>
          </div>
          <MapaPropiedades puntos={puntos} visibles={visibles} />
        </div>
      </div>

      {/* BANDA ROJA FINITA, de punta a punta, con el título de los resultados (Nacho, 09/10:
          el rojo grande detrás del mapa y de la primera propiedad no gustó; lo que queda de
          rojo es esta línea, como separador entre el mapa y la lista). Rojo PROFUNDO
          (--brand-text): blanco encima da 5.7:1 → AA. */}
      <div className="mt-10 bg-brand-text sm:mt-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
          <h3 className="text-base font-semibold text-white sm:text-lg" aria-live="polite">
            {!hayBusqueda
              ? "Propiedades destacadas"
              : resultados === null
                ? "Buscando…"
                : resultados.length === 0
                  ? "No encontramos propiedades con esa búsqueda"
                  : `${resultados.length} ${resultados.length === 1 ? "propiedad" : "propiedades"} para “${frase.trim()}”`}
          </h3>
          <Link
            href={hayBusqueda ? destinoCatalogo : "/propiedades"}
            className="text-sm font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"
          >
            {hayBusqueda ? "Ver en el catálogo →" : "Ver catálogo →"}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8">
        {hayCards && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.slice(0, EN_GRILLA).map((p) => (
              <PropertyCard key={p.id} propiedad={p} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href={hayBusqueda ? destinoCatalogo : "/propiedades"}
            className="group inline-flex h-12 items-center gap-2 rounded-md border border-brand/50 px-8 text-sm font-semibold uppercase tracking-wide text-brand-text transition hover:bg-brand hover:text-brand-foreground"
          >
            {hayBusqueda && resultados && resultados.length > EN_GRILLA
              ? `Ver las ${resultados.length}`
              : "Ver todas las propiedades"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
