"use client";

import Link from "next/link";
import {
  Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake,
  Tag, Landmark, Calculator,
} from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { HeroMapa, type PuntoMapa } from "@/components/home/hero-mapa";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

// VERSIÓN 3: como la 2 (crema cálido, tipografía Geist) pero el lugar del
// viejo deck de cartas lo ocupa un MAPA interactivo con todas las propiedades
// geolocalizadas — se explora y se busca desde el propio hero, como en el CRM.
// En mobile el mapa aparece entre el texto y el buscador (es el diferencial).

const QUICK_FILTERS = [
  { label: "En venta", href: "/propiedades?operacion=venta" },
  { label: "En alquiler", href: "/propiedades?operacion=alquiler" },
  { label: "Casas", href: "/propiedades?tipo=Casa" },
  { label: "Departamentos", href: "/propiedades?tipo=Departamento" },
  { label: "Terrenos", href: "/propiedades?tipo=Terreno" },
];

const QUICK_LINKS = [
  { label: "Vendé tu propiedad", href: "/vende-tu-propiedad", icon: Tag },
  { label: "Financiamos", href: "/credito-hipotecario", icon: Landmark },
  { label: "Calculadora de alquiler", href: "/calculadora-alquiler", icon: Calculator },
];

const TRUST = [
  { icon: Award, value: `+${AGENCIA.anios_experiencia} años`, label: "de experiencia" },
  { icon: MapPin, value: "Todo el país", label: "operamos en toda Argentina" },
  { icon: Handshake, value: "Asesoría real", label: "te acompañamos de punta a punta" },
];

export function Hero({ puntos = [] }: { puntos?: PuntoMapa[] }) {
  const a = AGENCIA;
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl gap-x-12 gap-y-8 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24 lg:pt-14">
        {/* Texto: eyebrow + título + bajada */}
        <div className="max-w-2xl">
          <div className="hero-in" style={{ "--i": 0 } as React.CSSProperties}>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-brand" />
              <span className="text-foreground">+{a.anios_experiencia} años</span>
              <span aria-hidden className="text-brand">·</span>
              Operamos en todo el país
            </span>
          </div>

          <h1
            className="hero-in mt-4 text-balance text-4xl font-semibold leading-[1.06] text-foreground min-[440px]:text-5xl lg:text-5xl xl:text-6xl"
           style={{ "--i": 1 } as React.CSSProperties}>
            Tu próxima propiedad
            <br />
            te está esperando
          </h1>

          <p
            className="hero-in mt-4 max-w-lg text-balance text-base text-muted-foreground sm:text-lg"
           style={{ "--i": 2 } as React.CSSProperties}>
            Casas, departamentos, terrenos y locales en venta y alquiler en toda
            Argentina. Tasaciones en 48 hs, visitas coordinadas y asesoría real.
            A un WhatsApp de distancia.
          </p>
        </div>

        {/* El MAPA: columna derecha en desktop (ocupa las dos filas); en mobile
            queda entre la bajada y el buscador. */}
        <div
          className="hero-zoom lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <HeroMapa puntos={puntos} />
        </div>

        {/* Resto: buscador, accesos, CTAs y confianza */}
        <div className="max-w-2xl lg:col-start-1">
          <form
            action="/propiedades" method="get"
            className="hero-in flex max-w-xl items-center gap-2 rounded-lg border border-foreground/15 bg-white p-2 shadow-[0_14px_36px_-26px_rgba(60,50,25,0.45)] focus-within:border-brand/60"
           style={{ "--i": 3 } as React.CSSProperties}>
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <input
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

          <div
            className="hero-in mt-3 hidden flex-wrap items-center gap-2 md:flex"
           style={{ "--i": 5 } as React.CSSProperties}>
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group/link inline-flex items-center gap-1.5 rounded-md border border-brand/35 px-3.5 py-1.5 text-xs font-semibold text-brand-text transition hover:border-brand hover:bg-brand hover:text-brand-foreground"
              >
                <l.icon className="size-3.5" aria-hidden />
                {l.label}
                <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </div>

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
      </div>
    </section>
  );
}
