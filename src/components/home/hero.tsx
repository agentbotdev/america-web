"use client";

import Link from "next/link";
import {
  Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake,
  Tag, Landmark, Calculator,
} from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

// VERSIÓN 2 ("Apple"): hero CENTRADO de una sola columna, sin el deck de
// cartas. La tipografía hace todo el trabajo — título enorme en Geist con
// tracking apretado, mucho aire, y el buscador como única pieza de UI fuerte.
// La entrada en cascada sigue en CSS (`.hero-in`, globals.css).

// Tags rápidos del hero: deep-link a /propiedades con filtros por OPERACIÓN / TIPO.
const QUICK_FILTERS = [
  { label: "En venta", href: "/propiedades?operacion=venta" },
  { label: "En alquiler", href: "/propiedades?operacion=alquiler" },
  { label: "Casas", href: "/propiedades?tipo=Casa" },
  { label: "Departamentos", href: "/propiedades?tipo=Departamento" },
  { label: "Terrenos", href: "/propiedades?tipo=Terreno" },
];

// Accesos a SECCIONES (no son filtros del catálogo).
const QUICK_LINKS = [
  { label: "Vendé tu propiedad", href: "/vende-tu-propiedad", icon: Tag },
  { label: "Financiamos", href: "/credito-hipotecario", icon: Landmark },
  { label: "Calculadora de alquiler", href: "/calculadora-alquiler", icon: Calculator },
];

// Señales de confianza (mensaje amplio y nacional).
const TRUST = [
  { icon: Award, value: `+${AGENCIA.anios_experiencia} años`, label: "de experiencia" },
  { icon: MapPin, value: "Todo el país", label: "operamos en toda Argentina" },
  { icon: Handshake, value: "Asesoría real", label: "te acompañamos de punta a punta" },
];

export function Hero() {
  const a = AGENCIA;
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-10 text-center sm:px-6 sm:pt-14 lg:pb-24 lg:pt-20">
        <div className="hero-in" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-brand" />
            <span className="text-foreground">+{a.anios_experiencia} años</span>
            <span aria-hidden className="text-brand">·</span>
            Operamos en todo el país
          </span>
        </div>

        <h1
          className="hero-in mt-5 text-balance text-4xl font-semibold leading-[1.06] text-foreground min-[440px]:text-5xl sm:text-6xl lg:text-7xl"
         style={{ "--i": 1 } as React.CSSProperties}>
          Tu próxima propiedad
          <br />
          te está esperando
        </h1>

        <p
          className="hero-in mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
         style={{ "--i": 2 } as React.CSSProperties}>
          Casas, departamentos, terrenos y locales en venta y alquiler en toda
          Argentina. Tasaciones en 48 hs, visitas coordinadas y asesoría real.
          A un WhatsApp de distancia.
        </p>

        {/* Buscador prominente */}
        <form
          action="/propiedades" method="get"
          className="hero-in mt-8 flex w-full max-w-xl items-center gap-2 rounded-lg border border-foreground/15 bg-white p-2 shadow-[0_14px_36px_-26px_rgba(60,50,25,0.45)] focus-within:border-brand/60"
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

        {/* Quick-filters por operación / tipo */}
        <div
          className="hero-in mt-5 flex flex-wrap items-center justify-center gap-2"
         style={{ "--i": 4 } as React.CSSProperties}>
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

        {/* Accesos a secciones. En mobile viven FIJOS en el top bar. */}
        <div
          className="hero-in mt-3 hidden flex-wrap items-center justify-center gap-2 md:flex"
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

        {/* CTAs */}
        <div
          className="hero-in mt-8 flex flex-wrap items-center justify-center gap-3"
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
          className="hero-in mt-14 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-border pt-8"
         style={{ "--i": 7 } as React.CSSProperties}>
          {TRUST.map((t) => (
            <div key={t.value} className="flex flex-col items-center gap-1.5">
              <t.icon className="size-5 text-brand" aria-hidden />
              <dt className="text-sm font-semibold text-foreground">{t.value}</dt>
              <dd className="text-xs leading-snug text-muted-foreground">{t.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
