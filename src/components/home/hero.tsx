"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake, ChevronDown,
} from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { HeroMapa, type PuntoMapa } from "@/components/home/hero-mapa";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

// VERSIÓN 3 — iteración según las webs de REFERENCIA que eligió la
// inmobiliaria (matiasszpira.com.ar, marascoquirogaprop.com.ar): el mismo
// buscador PANEL protagonista de la v2 (tabs de operación + selects) en la
// columna izquierda, y el MAPA interactivo de propiedades a la derecha.

const TRUST = [
  { icon: Award, value: `+${AGENCIA.anios_experiencia} años`, label: "de experiencia" },
  { icon: MapPin, value: "Todo el país", label: "operamos en toda Argentina" },
  { icon: Handshake, value: "Asesoría real", label: "te acompañamos de punta a punta" },
];

const OPERACIONES = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "all", label: "Todas" },
] as const;

function SelectPanel({
  name, aria, placeholder, opciones,
}: {
  name: string;
  aria: string;
  placeholder: string;
  opciones: string[];
}) {
  // Select NATIVO estilizado: cero JS, funciona igual en iOS/Android, y el
  // form lo serializa solo. El chevron propio tapa la flecha del sistema.
  return (
    <label className="relative block">
      <span className="sr-only">{aria}</span>
      <select
        name={name}
        defaultValue=""
        aria-label={aria}
        className="h-12 w-full appearance-none rounded-md border border-foreground/15 bg-white pl-3.5 pr-9 text-sm text-foreground outline-none transition focus:border-brand"
      >
        <option value="">{placeholder}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </label>
  );
}

export function Hero({
  puntos = [],
  tipos = [],
  ciudades = [],
}: {
  puntos?: PuntoMapa[];
  tipos?: string[];
  ciudades?: string[];
}) {
  const a = AGENCIA;
  const [operacion, setOperacion] = useState<string>("venta");

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
            className="hero-in mt-4 text-balance text-4xl font-semibold leading-[1.06] text-foreground min-[440px]:text-5xl xl:text-6xl"
           style={{ "--i": 1 } as React.CSSProperties}>
            Tu próxima propiedad
            <br />
            te está esperando
          </h1>

          <p
            className="hero-in mt-4 max-w-lg text-balance text-base text-muted-foreground sm:text-lg"
           style={{ "--i": 2 } as React.CSSProperties}>
            Casas, departamentos, terrenos y locales en venta y alquiler en toda
            Argentina. Tasaciones en 48 hs y asesoría real por WhatsApp.
          </p>
        </div>

        {/* El MAPA: columna derecha en desktop (ocupa las dos filas); en mobile
            queda entre la bajada y el buscador. */}
        <div className="hero-zoom lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroMapa puntos={puntos} />
        </div>

        {/* BUSCADOR PANEL (como en las referencias) + CTAs + confianza */}
        <div className="max-w-2xl lg:col-start-1">
          <form
            action="/propiedades" method="get"
            className="hero-in w-full max-w-xl rounded-lg border border-foreground/10 bg-white p-3 shadow-[0_18px_44px_-28px_rgba(60,50,25,0.5)] sm:p-4"
           style={{ "--i": 3 } as React.CSSProperties}>
            <div role="tablist" aria-label="Tipo de operación" className="flex flex-wrap gap-1.5">
              {OPERACIONES.map((op) => {
                const activa = operacion === op.value;
                return (
                  <button
                    key={op.value}
                    type="button"
                    role="tab"
                    aria-selected={activa}
                    onClick={() => setOperacion(op.value)}
                    className={
                      "h-10 rounded-md border px-5 text-sm font-semibold transition " +
                      (activa
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-foreground/15 bg-white text-muted-foreground hover:border-brand/50 hover:text-foreground")
                    }
                  >
                    {op.label}
                  </button>
                );
              })}
            </div>
            {operacion !== "all" && <input type="hidden" name="operacion" value={operacion} />}

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <SelectPanel name="tipo" aria="Tipo de propiedad" placeholder="Tipo de propiedad" opciones={tipos} />
              {/* La ubicación viaja como `q`: el catálogo interpreta la frase
                  y matchea barrio/ciudad — mismo camino que el buscador libre. */}
              <SelectPanel name="q" aria="Ubicación" placeholder="Ubicación" opciones={ciudades} />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-110 active:scale-[0.98]"
              >
                <Search className="size-4" aria-hidden />
                Buscar
              </button>
            </div>
          </form>

          <div
            className="hero-in mt-7 flex flex-wrap items-center gap-3"
           style={{ "--i": 4 } as React.CSSProperties}>
            <WhatsappButton numero={a.whatsapp} mensaje={mensajeGeneral(a)} label="Asesoría por WhatsApp" size="md" />
            <Link
              href="/vende-tu-propiedad"
              className="inline-flex min-h-13 items-center gap-1.5 rounded-md border border-foreground/20 bg-white px-6 text-sm font-medium text-foreground transition hover:border-brand/60 hover:text-brand-text"
            >
              Vendé tu propiedad <ArrowRight className="size-4" />
            </Link>
          </div>

          <dl
            className="hero-in mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6"
           style={{ "--i": 5 } as React.CSSProperties}>
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
