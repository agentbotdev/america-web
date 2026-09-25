"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake,
  Tag, Landmark, Calculator,
} from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { HeroDeck } from "@/components/home/hero-deck";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";
import type { DeckItem } from "@/lib/deck";

// La entrada en cascada del hero ahora vive en CSS (`.hero-in` en globals.css):
// cada bloque declara su turno con `--i` y el delay sale de ahí. Antes eran
// variantes de motion; se migró para sacar la librería del camino crítico.

// Tags rápidos del hero: deep-link a /propiedades con filtros por OPERACIÓN / TIPO.
// Nada geo-específico (mensaje nacional): NO barrios.
const QUICK_FILTERS = [
  { label: "En venta", href: "/propiedades?operacion=venta" },
  { label: "En alquiler", href: "/propiedades?operacion=alquiler" },
  { label: "Casas", href: "/propiedades?tipo=Casa" },
  { label: "Departamentos", href: "/propiedades?tipo=Departamento" },
  { label: "Terrenos", href: "/propiedades?tipo=Terreno" },
];

// Accesos a SECCIONES (no son filtros del catálogo) → van con ícono y en su
// propia fila, para que se lean como navegación y no como un filtro más.
const QUICK_LINKS = [
  { label: "Vendé tu propiedad", href: "/vende-tu-propiedad", icon: Tag },
  { label: "Financiamos", href: "/credito-hipotecario", icon: Landmark },
  { label: "Calculadora de alquiler", href: "/calculadora-alquiler", icon: Calculator },
];

// Señales de confianza (mensaje amplio y nacional, sin geo-específico).
const TRUST = [
  { icon: Award, value: `+${AGENCIA.anios_experiencia} años`, label: "de experiencia" },
  { icon: MapPin, value: "Todo el país", label: "operamos en toda Argentina" },
  { icon: Handshake, value: "Asesoría real", label: "te acompañamos de punta a punta" },
];

// Fallback del visual si no hay destacadas para el deck (WEBP transparente).
const HERO_CASA = "/hero-casa-moderna.webp";

export function Hero({ deck = [] }: { deck?: DeckItem[] }) {
  const a = AGENCIA;
  return (
    // SIN blobs de aurora ni glows animados: eran dos elementos de ~700px con
    // blur re-componiéndose en CADA frame (la mayor carga de GPU de la página,
    // el usuario la sentía "inusable") y además sus halos morían en el borde
    // recto de la sección → el famoso "fondo cortado". Fondo liso = fluido.
    <section className="relative overflow-hidden">

      {/* py corto arriba: el título queda pegado al header (pedido del cliente).
          LAYOUT: título y deck van LADO A LADO en TODOS los tamaños (pedido del
          cliente) — en pantallas chicas ambos se achican pero no se apilan.
          Grid de 2 filas: fila 1 = [título | deck]; fila 2 = el resto del
          contenido a lo ancho. En lg el resto vuelve a la columna izquierda y
          el deck se centra abarcando las dos filas (mismo look de siempre). */}
      {/* items-START en mobile: el título arranca arriba, pegado al header
          (antes items-center lo hundía al medio de la fila del deck). En lg se
          re-centra. pt mínimo en mobile por lo mismo. */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-[1.1fr_0.9fr] items-start gap-x-4 gap-y-6 px-4 pb-16 pt-2 sm:gap-x-8 sm:px-6 sm:pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-x-12 lg:px-8 lg:pb-20 lg:pt-6">
        {/* Título (+badge): SIEMPRE junto al deck. self-start: arriba de todo
            en mobile (pedido del cliente); centrado recién en lg. */}
        <div className="col-start-1 row-start-1 max-w-2xl self-start pt-2 lg:self-center lg:pt-0">
          <div className="hero-in" style={{ "--i": 0 } as React.CSSProperties}>
            {/* Eyebrow editorial (sin caja): mayúsculas espaciadas + ícono rojo.
                En columnas angostas no entra: aparece desde sm. */}
            <span className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:inline-flex">
              <ShieldCheck className="size-3.5 text-brand" />
              <span className="text-foreground">+{a.anios_experiencia} años</span>
              <span aria-hidden className="text-brand">·</span>
              Operamos en todo el país
            </span>
          </div>

          <h1
            // Título MÁS GRANDE en mobile: la columna tenía aire de sobra
            // (feedback del cliente marcando el espacio desaprovechado).
            className="hero-in text-balance text-3xl font-semibold leading-[1.12] text-foreground min-[440px]:text-4xl sm:mt-5 sm:leading-[1.1] lg:text-5xl xl:text-6xl"
           style={{ "--i": 1 } as React.CSSProperties}>
            Tu próxima propiedad
            <br />
            <span className="relative inline-block">
              te está esperando
              {/* Raya roja plana: la firma del logo (sin glow ni redondeo). */}
              <span
                aria-hidden
                className="absolute -bottom-1.5 left-0 h-[3px] w-full"
                style={{ background: "var(--brand)" }}
              />
            </span>
          </h1>

          {/* La descripción ARRANCA acá, en el hueco al lado del deck (el
              cliente lo marcó con un círculo: quedaba crema vacío bajo el
              título mientras la descripción esperaba abajo del deck). */}
          <p
            className="hero-in mt-3 max-w-lg text-balance text-sm text-muted-foreground min-[440px]:text-base sm:mt-5 sm:text-lg"
           style={{ "--i": 2 } as React.CSSProperties}>
            Casas, departamentos, terrenos y locales en venta y alquiler en toda
            Argentina. Tasaciones en 48 hs, visitas coordinadas y asesoría real.
            A un WhatsApp de distancia.
          </p>
        </div>

        {/* Resto del contenido: a lo ancho bajo el par título/deck en mobile;
            en lg vuelve a la columna izquierda (bajo el título). */}
        <div className="col-span-2 row-start-2 max-w-2xl lg:col-span-1 lg:col-start-1">
          {/* Buscador prominente */}
          <form
            action="/propiedades" method="get"
            // Sin mt: la separación la da el gap del grid (la descripción ya
            // no vive arriba de este bloque — se mudó a la columna del título).
            className="hero-in flex max-w-xl items-center gap-2 rounded-lg border border-foreground/15 bg-white p-2 shadow-[0_14px_36px_-26px_rgba(60,50,25,0.45)] focus-within:border-brand/60"
           style={{ "--i": 3 } as React.CSSProperties}>
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <input
              // El placeholder muestra un EJEMPLO COMBINADO a propósito: ahora
              // la frase se interpreta (tipo + operación + zona van a filtros
              // distintos), y si no se sugiere nadie lo descubre solo.
              name="q" type="search" placeholder="Ej: casa en venta en Moreno"
              aria-label="Buscar propiedades"
              className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground transition hover:brightness-110 active:scale-[0.98]"
            >
              Buscar
            </button>
          </form>

          {/* Quick-filters por operación / tipo */}
          <div
            className="hero-in mt-5 flex flex-wrap items-center gap-2"
           style={{ "--i": 4 } as React.CSSProperties}>
            <span className="text-xs font-medium text-muted-foreground">Accesos rápidos:</span>
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="inline-flex items-center rounded-md border border-foreground/15 bg-white px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-brand/60 hover:text-brand-text"
              >
                {f.label}
              </Link>
            ))}
          </div>

          {/* Accesos a secciones (herramientas y servicios). En mobile viven
              FIJOS en el top bar (SiteHeader) → acá solo desde md. */}
          <div
            className="hero-in mt-3 hidden flex-wrap items-center gap-2 md:flex"
           style={{ "--i": 5 } as React.CSSProperties}>
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                // SIN relleno de fondo: un tinte rojo sobre la banda crema da un
                // durazno (#f9d4b0) que baja el contraste del texto a 4.24 (< AA).
                // Sobre el crema limpio, `brand-text` da 4.74 y pasa.
                className="group/link inline-flex items-center gap-1.5 rounded-md border border-brand/35 px-3.5 py-1.5 text-xs font-semibold text-brand-text transition hover:border-brand hover:bg-brand hover:text-brand-foreground"
              >
                <l.icon className="size-3.5" aria-hidden />
                {l.label}
                <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="hero-in mt-8 flex flex-wrap items-center gap-3"
           style={{ "--i": 6 } as React.CSSProperties}>
            <WhatsappButton numero={a.whatsapp} mensaje={mensajeGeneral(a)} label="Asesoría por WhatsApp" size="lg" />
            <Link
              href="/propiedades"
              className="inline-flex h-13 items-center gap-1.5 rounded-md border border-foreground/20 bg-white px-7 text-base font-medium text-foreground transition hover:border-brand/60 hover:text-brand-text"
            >
              Ver propiedades <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Banda de confianza */}
          <dl
            className="hero-in mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-7"
           style={{ "--i": 7 } as React.CSSProperties}>
            {TRUST.map((t) => (
              <div key={t.value} className="flex flex-col gap-1.5">
                <t.icon className="size-5 text-brand" aria-hidden />
                <dt className="text-sm font-semibold text-foreground">{t.value}</dt>
                <dd className="text-xs leading-snug text-muted-foreground">{t.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual: el DECK de destacadas (baraja abanicada que rota sola) sobre
            el spotlight rojo de marca. Si no hay destacadas, cae a la casa. */}
        <div
          // Entrada del deck en CSS (`hero-zoom`, globals.css). Era el último
          // `motion.div` del hero: sacarlo deja la portada entera sin la
          // librería de animación.
          // self-start: el deck ARRIBA en todos los tamaños (en compu estaba
          // centrado y quedaba hundido — pedido del cliente: "subir las cards").
          className="hero-zoom relative col-start-2 row-start-1 self-start lg:row-span-2"
        >
          {deck.length > 0 ? (
            <HeroDeck items={deck} />
          ) : (
            <div className="animate-float relative mx-auto aspect-square w-full max-w-lg">
              <Image
                src={HERO_CASA}
                alt="Propiedades en venta y alquiler en toda Argentina — América Cardozo"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 32rem"
                className="object-contain drop-shadow-2xl"
              />
            </div>
          )}

          {/* (El chip de "Cobertura nacional" se quitó: quedaba superpuesto a
              las cartas del deck, y el dato ya vive en el badge y en TRUST.) */}
        </div>
      </div>
    </section>
  );
}
