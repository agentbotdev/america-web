"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, MapPin, MessageCircle, Search, SearchX } from "lucide-react";
import PropertyCard from "@/components/propiedades/property-card";
import { MapaPropiedades, type PuntoMapa } from "./mapa-propiedades";
import {
  coincideBusqueda,
  datosBuscables,
  interpretarBusqueda,
  type BusquedaInterpretada,
  type DatosBuscables,
} from "@/lib/buscador";
import { scoreVidriera } from "@/lib/vidriera";
import { waLink } from "@/lib/whatsapp";
import { AGENCIA } from "@/data/agencia";
import type { Propiedad } from "@/types";

// PROPIEDADES, justo debajo del hero (pedido de Nacho, 08/10): el video termina adentro
// de una casa y acá se "aterriza" en las propiedades. Arriba el título y una BARRA de
// búsqueda (la de la versión 1: una sola frase, "casa en venta en Moreno"), debajo el MAPA
// (el de la versión 3), una banda roja finita con el título de lo que se muestra y abajo
// las propiedades.
//
// Mientras se escribe, el mapa y la grilla se filtran EN VIVO; con Enter (o Buscar) se va
// al catálogo completo con esa búsqueda ya aplicada, donde están todos los filtros.

export type PuntoBuscable = PuntoMapa & DatosBuscables;

/** Cuántas propiedades muestra la grilla (las demás, en el catálogo). */
const EN_GRILLA = 6;

const ordenar = (lista: Propiedad[]) => [...lista].sort((a, b) => scoreVidriera(b) - scoreVidriera(a));

/** "casa · en venta · “moreno”": lo que se entendió de la frase, para mostrarlo en la banda. */
function describir(b: BusquedaInterpretada): string {
  return [
    b.tipo,
    b.operacion ? `en ${b.operacion}` : null,
    b.texto ? `“${b.texto}”` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

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
    return ordenar(catalogo.filter((p) => coincideBusqueda(busqueda, datosBuscables(p))));
  }, [hayBusqueda, busqueda, catalogo, destacadas]);

  const sinResultados = hayBusqueda && resultados !== null && resultados.length === 0;

  // SIN RESULTADOS: en vez de una lista vacía, otras parecidas (Nacho, 09/10: "que te diga
  // en el cartel rojo che no hay, y abajo mirá otras"). Se afloja la búsqueda de a un
  // criterio: primero el mismo tipo en cualquier zona ("casa en venta" en otro barrio),
  // después la misma zona con cualquier tipo, después solo la operación. Si nada de eso
  // da, las destacadas.
  const sugeridas = useMemo(() => {
    if (!sinResultados || !catalogo) return null;
    const { operacion, tipo, texto } = busqueda;
    const intentos: BusquedaInterpretada[] = [
      { operacion, tipo, texto: "" },
      { operacion, texto },
      { operacion, texto: "" },
    ];
    for (const intento of intentos) {
      // Un intento sin ningún criterio traería todo: para eso están las destacadas.
      if (!(intento.operacion || intento.tipo || intento.texto)) continue;
      const parecidas = catalogo.filter((p) => coincideBusqueda(intento, datosBuscables(p)));
      if (parecidas.length > 0) return ordenar(parecidas);
    }
    return destacadas;
  }, [sinResultados, catalogo, busqueda, destacadas]);

  const lista = sinResultados ? sugeridas : resultados;

  // El mapa muestra lo mismo que la lista: las que coinciden o, si no hay, las sugeridas.
  const visibles = useMemo(() => {
    if (!hayBusqueda) return null;
    if (sugeridas) return new Set(sugeridas.map((p) => p.id));
    return new Set(puntos.filter((p) => coincideBusqueda(busqueda, p)).map((p) => p.id));
  }, [hayBusqueda, sugeridas, puntos, busqueda]);

  const destinoCatalogo = frase.trim() ? `/propiedades?q=${encodeURIComponent(frase.trim())}` : "/propiedades";

  const buscar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(destinoCatalogo);
  };

  // Lo que dice la banda roja según el momento: sin búsqueda, buscando, con resultados o
  // sin resultados (y en ese caso, la opción de que le avisen por WhatsApp: es un lead).
  const fraseLimpia = fraseDiferida.trim();
  const banda = !hayBusqueda
    ? {
        icono: Home,
        titulo: "Propiedades destacadas",
        detalle: "Las más completas de la cartera: con fotos, precio a la vista y ficha completa.",
        accion: { href: "/propiedades", texto: "Ver catálogo completo", externo: false },
      }
    : resultados === null
      ? { icono: Search, titulo: "Buscando…", detalle: "Un segundo, estamos revisando todas las propiedades.", accion: null }
      : sinResultados
        ? {
            icono: SearchX,
            titulo: `Por ahora no tenemos “${fraseLimpia}”`,
            detalle: "Abajo te mostramos otras parecidas. Si querés, te avisamos cuando entre una.",
            accion: {
              href: waLink(
                AGENCIA.whatsapp,
                `¡Hola! Estoy buscando ${fraseLimpia} y no encontré en la web. ¿Me avisan si entra alguna?`,
              ),
              texto: "Avisame cuando entre",
              externo: true,
            },
          }
        : {
            icono: Search,
            titulo: `${resultados.length} ${resultados.length === 1 ? "propiedad" : "propiedades"} para “${fraseLimpia}”`,
            detalle: `Filtramos por ${describir(busqueda)}. Tocá cualquiera para ver la ficha.`,
            accion: { href: destinoCatalogo, texto: "Ver en el catálogo", externo: false },
          };
  const IconoBanda = banda.icono;

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
            // Se pide al enfocar (así llega antes de la primera letra) y también al escribir:
            // un autocompletado o un pegado pueden cambiar el texto sin que haya foco.
            onChange={(e) => {
              traerCatalogo();
              setFrase(e.target.value);
            }}
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

      {/* BANDA ROJA FINITA, de punta a punta, con el título de lo que se muestra abajo (Nacho,
          09/10: el rojo grande detrás del mapa no gustó; queda esta franja como separador
          entre el mapa y la lista, con un renglón de detalle). Rojo PROFUNDO (--brand-text):
          blanco encima da 5.7:1 → AA. */}
      <div className="mt-10 bg-brand-text sm:mt-12">
        <div
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2.5 px-4 py-4 sm:flex-nowrap sm:px-6 sm:py-5 lg:px-8"
          aria-live="polite"
        >
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
            <IconoBanda className="size-5 text-white" aria-hidden />
          </span>
          <div className="w-full min-w-0 sm:w-auto sm:flex-1">
            <h3 className="text-lg font-semibold leading-snug text-white sm:text-xl">{banda.titulo}</h3>
            <p className="mt-0.5 text-sm text-white/80">{banda.detalle}</p>
          </div>
          {banda.accion &&
            (banda.accion.externo ? (
              <a
                href={banda.accion.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-white px-4 sm:h-10 sm:px-5 text-sm font-semibold text-brand-text transition hover:brightness-95"
              >
                <MessageCircle className="size-4" aria-hidden />
                {banda.accion.texto}
              </a>
            ) : (
              <Link
                href={banda.accion.href}
                className="group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/45 px-4 sm:h-10 sm:px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-brand-text"
              >
                {banda.accion.texto}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8">
        {lista && lista.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.slice(0, EN_GRILLA).map((p) => (
              <PropertyCard key={p.id} propiedad={p} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href={hayBusqueda && !sinResultados ? destinoCatalogo : "/propiedades"}
            className="group inline-flex h-12 items-center gap-2 rounded-md border border-brand/50 px-8 text-sm font-semibold uppercase tracking-wide text-brand-text transition hover:bg-brand hover:text-brand-foreground"
          >
            {hayBusqueda && !sinResultados && resultados && resultados.length > EN_GRILLA
              ? `Ver las ${resultados.length}`
              : "Ver todas las propiedades"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
