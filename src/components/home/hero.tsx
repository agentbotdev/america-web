"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake,
  Tag, Landmark, Calculator,
} from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

// VERSIÓN 2 ("Apple" + foto): hero centrado sobre una FOTO de propiedad a
// pantalla completa (pedido del cliente). El texto pasa a blanco sobre un
// velo oscuro degradado — más fuerte abajo, donde vive la banda de confianza.
// La foto es local (public/hero-fondo.jpg, casa al atardecer, licencia
// Unsplash) y la optimiza next/image por viewport.

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

export function Hero() {
  const a = AGENCIA;
  return (
    <section className="relative overflow-hidden">
      {/* Foto de fondo + velo. El velo crece hacia abajo: arriba deja ver la
          casa, abajo garantiza la lectura de la banda de confianza. */}
      <Image
        src="/hero-fondo.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/35" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-14 pt-12 text-center sm:px-6 sm:pt-16 lg:pb-20 lg:pt-24">
        <div className="hero-in" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            <ShieldCheck className="size-3.5 text-accent-warm" />
            <span className="text-white">+{a.anios_experiencia} años</span>
            <span aria-hidden className="text-accent-warm">·</span>
            Operamos en todo el país
          </span>
        </div>

        <h1
          className="hero-in mt-5 text-balance text-4xl font-semibold leading-[1.06] text-white min-[440px]:text-5xl sm:text-6xl lg:text-7xl"
         style={{ "--i": 1 } as React.CSSProperties}>
          Tu próxima propiedad
          <br />
          te está esperando
        </h1>

        <p
          className="hero-in mt-5 max-w-xl text-balance text-base text-white/85 sm:text-lg"
         style={{ "--i": 2 } as React.CSSProperties}>
          Casas, departamentos, terrenos y locales en venta y alquiler en toda
          Argentina. Tasaciones en 48 hs, visitas coordinadas y asesoría real.
          A un WhatsApp de distancia.
        </p>

        {/* Buscador: la única superficie clara sobre la foto — el foco. */}
        <form
          action="/propiedades" method="get"
          className="hero-in mt-8 flex w-full max-w-xl items-center gap-2 rounded-lg border border-white/20 bg-white p-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)] focus-within:border-brand/60"
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
          className="hero-in mt-5 flex flex-wrap items-center justify-center gap-2"
         style={{ "--i": 4 } as React.CSSProperties}>
          {QUICK_FILTERS.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className="inline-flex items-center rounded-md border border-white/35 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:border-white hover:bg-white/20"
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div
          className="hero-in mt-3 hidden flex-wrap items-center justify-center gap-2 md:flex"
         style={{ "--i": 5 } as React.CSSProperties}>
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group/link inline-flex items-center gap-1.5 rounded-md border border-white/25 px-3.5 py-1.5 text-xs font-semibold text-white/90 transition hover:border-white hover:bg-white hover:text-foreground"
            >
              <l.icon className="size-3.5" aria-hidden />
              {l.label}
              <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
            </Link>
          ))}
        </div>

        <div
          className="hero-in mt-8 flex flex-wrap items-center justify-center gap-3"
         style={{ "--i": 6 } as React.CSSProperties}>
          <WhatsappButton numero={a.whatsapp} mensaje={mensajeGeneral(a)} label="Asesoría por WhatsApp" size="lg" />
          <Link
            href="/propiedades"
            className="inline-flex h-13 items-center gap-1.5 rounded-md border border-white/40 px-7 text-base font-medium text-white transition hover:border-white hover:bg-white/15"
          >
            Ver propiedades <ArrowRight className="size-4" />
          </Link>
        </div>

        <dl
          className="hero-in mt-12 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-white/20 pt-7"
         style={{ "--i": 7 } as React.CSSProperties}>
          {TRUST.map((t) => (
            <div key={t.value} className="flex flex-col items-center gap-1.5">
              <t.icon className="size-5 text-accent-warm" aria-hidden />
              <dt className="text-sm font-semibold text-white">{t.value}</dt>
              <dd className="text-xs leading-snug text-white/75">{t.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
