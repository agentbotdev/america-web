"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake,
  Tag, Landmark, Calculator,
} from "lucide-react";
import { motion } from "motion/react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { HeroDeck } from "@/components/home/hero-deck";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";
import type { DeckItem } from "@/lib/deck";

// Reduced-motion: el contenido arranca VISIBLE (opacity 1, sin desplazamiento) →
// nunca queda invisible si la animación no corre. Normal: fade + subida en cascada.
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

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
  { label: "Crédito hipotecario", href: "/credito-hipotecario", icon: Landmark },
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
      <div className="relative mx-auto grid max-w-7xl grid-cols-[1.1fr_0.9fr] items-center gap-x-4 gap-y-8 px-4 pb-16 pt-6 sm:gap-x-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-12 lg:px-8 lg:pb-20 lg:pt-10">
        {/* Título (+badge): SIEMPRE junto al deck */}
        <div className="col-start-1 row-start-1 max-w-2xl self-center">
          <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
            {/* En columnas angostas el badge no entra: aparece desde sm. */}
            <span className="glass hidden items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              <ShieldCheck className="size-3.5 text-brand" />
              <span className="font-semibold text-foreground">+{a.anios_experiencia} años</span>
              <span aria-hidden className="text-muted-foreground">·</span>
              Operamos en todo el país
            </span>
          </motion.div>

          <motion.h1
            initial="hidden" animate="show" custom={1} variants={fadeUp}
            // Escala CONTENIDA y fluida: en mobile convive con la card al lado.
            className="text-balance text-2xl font-semibold leading-[1.1] tracking-tight text-foreground min-[440px]:text-3xl sm:mt-5 sm:text-4xl sm:leading-[1.06] lg:text-5xl xl:text-6xl"
          >
            Tu próxima propiedad
            <br />
            <span className="relative inline-block">
              te está esperando
              {/* Subrayado rojo de marca como firma visual del titular */}
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[4px] w-full rounded-full sm:h-[5px]"
                style={{ background: "var(--brand)", boxShadow: "0 0 22px -4px var(--brand)" }}
              />
            </span>
          </motion.h1>
        </div>

        {/* Resto del contenido: a lo ancho bajo el par título/deck en mobile;
            en lg vuelve a la columna izquierda (bajo el título). */}
        <div className="col-span-2 row-start-2 max-w-2xl lg:col-span-1 lg:col-start-1">
          <motion.p
            initial="hidden" animate="show" custom={2} variants={fadeUp}
            className="max-w-lg text-balance text-base text-muted-foreground sm:text-lg"
          >
            Casas, departamentos, terrenos y locales en venta y alquiler en toda
            Argentina. Tasaciones sin cargo, visitas coordinadas y asesoría real.
            A un WhatsApp de distancia.
          </motion.p>

          {/* Buscador prominente */}
          <motion.form
            action="/propiedades" method="get"
            initial="hidden" animate="show" custom={3} variants={fadeUp}
            className="glass mt-9 flex max-w-xl items-center gap-2 rounded-full p-2 shadow-[0_18px_44px_-26px_rgba(60,50,25,0.5)] focus-within:border-brand/60"
          >
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <input
              name="q" type="search" placeholder="¿Qué estás buscando? Tipo, operación, ciudad…"
              aria-label="Buscar propiedades"
              className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="glow-brand inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition hover:brightness-110 active:scale-[0.98]"
            >
              Buscar
            </button>
          </motion.form>

          {/* Quick-filters por operación / tipo */}
          <motion.div
            initial="hidden" animate="show" custom={4} variants={fadeUp}
            className="mt-5 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs font-medium text-muted-foreground">Accesos rápidos:</span>
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="glass inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-brand/60 hover:text-brand-text"
              >
                {f.label}
              </Link>
            ))}
          </motion.div>

          {/* Accesos a secciones (herramientas y servicios) */}
          <motion.div
            initial="hidden" animate="show" custom={5} variants={fadeUp}
            className="mt-3 flex flex-wrap items-center gap-2"
          >
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                // SIN relleno de fondo: un tinte rojo sobre la banda crema da un
                // durazno (#f9d4b0) que baja el contraste del texto a 4.24 (< AA).
                // Sobre el crema limpio, `brand-text` da 4.74 y pasa.
                className="group/link inline-flex items-center gap-1.5 rounded-full border border-brand/35 px-3.5 py-1.5 text-xs font-semibold text-brand-text transition hover:border-brand hover:bg-brand hover:text-brand-foreground"
              >
                <l.icon className="size-3.5" aria-hidden />
                {l.label}
                <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial="hidden" animate="show" custom={6} variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <WhatsappButton numero={a.whatsapp} mensaje={mensajeGeneral(a)} label="Asesoría por WhatsApp" size="lg" />
            <Link
              href="/propiedades"
              className="glass inline-flex h-13 items-center gap-1.5 rounded-full px-7 text-base font-medium text-foreground transition hover:border-brand/50 hover:text-brand-text"
            >
              Ver propiedades <ArrowRight className="size-4" />
            </Link>
          </motion.div>

          {/* Banda de confianza */}
          <motion.dl
            initial="hidden" animate="show" custom={7} variants={fadeUp}
            className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-7"
          >
            {TRUST.map((t) => (
              <div key={t.value} className="flex flex-col gap-1.5">
                <t.icon className="size-5 text-brand" aria-hidden />
                <dt className="text-sm font-semibold text-foreground">{t.value}</dt>
                <dd className="text-xs leading-snug text-muted-foreground">{t.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual: el DECK de destacadas (baraja abanicada que rota sola) sobre
            el spotlight rojo de marca. Si no hay destacadas, cae a la casa. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative col-start-2 row-start-1 self-center lg:row-span-2"
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
        </motion.div>
      </div>
    </section>
  );
}
