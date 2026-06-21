"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

// Reduced-motion: el contenido arranca VISIBLE (opacity 1, sin desplazamiento) →
// nunca queda invisible si la animación no corre. Normal: fade + subida en cascada.
const makeFadeUp = (reduced: boolean) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
});

// Tags rápidos del hero: deep-link a /propiedades con filtros por OPERACIÓN / TIPO.
// Nada geo-específico (mensaje nacional): NO barrios.
const QUICK_FILTERS = [
  { label: "En venta", href: "/propiedades?operacion=venta" },
  { label: "En alquiler", href: "/propiedades?operacion=alquiler" },
  { label: "Casas", href: "/propiedades?tipo=Casa" },
  { label: "Departamentos", href: "/propiedades?tipo=Departamento" },
  { label: "Terrenos", href: "/propiedades?tipo=Terreno" },
];

// Señales de confianza (mensaje amplio y nacional, sin geo-específico).
const TRUST = [
  { icon: Award, value: `+${AGENCIA.anios_experiencia} años`, label: "de experiencia" },
  { icon: MapPin, value: "Todo el país", label: "operamos en toda Argentina" },
  { icon: Handshake, value: "Asesoría real", label: "te acompañamos de punta a punta" },
];

// La casa del hero (WEBP transparente) vive en public/ → se sirve y deploya con la web.
const HERO_CASA = "/hero-casa-moderna.webp";

// Glow de marca reutilizable (radial sutil, color del tenant via CSS var).
const glow = (alpha: number) =>
  `radial-gradient(circle, color-mix(in oklch, var(--brand) ${Math.round(
    alpha * 100,
  )}%, transparent), transparent 70%)`;

export function Hero() {
  const a = AGENCIA;
  const reduced = useReducedMotion() ?? false;
  const fadeUp = makeFadeUp(reduced);
  return (
    <section className="section-dark relative overflow-hidden">
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50" />

      {/* Fondo: degradé de marca en MOVIMIENTO (sutil). Anima transform/opacity → GPU,
          no repinta, no afecta la performance. Se apaga con prefers-reduced-motion. */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-aurora absolute -left-[12%] top-[2%] size-[58vw] max-w-[700px] rounded-full blur-3xl"
          style={{ background: glow(0.32) }}
        />
        <div
          className="animate-aurora absolute -right-[10%] bottom-[-14%] size-[52vw] max-w-[640px] rounded-full blur-3xl"
          style={{ background: glow(0.24), animationDelay: "-9s", animationDuration: "26s" }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        {/* Texto */}
        <div className="max-w-2xl">
          <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
            <span className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-100">
              <ShieldCheck className="size-3.5 text-brand" />
              <span className="font-semibold text-white">+{a.anios_experiencia} años</span>
              <span className="text-slate-400">·</span>
              Operamos en todo el país
            </span>
          </motion.div>

          <motion.h1
            initial="hidden" animate="show" custom={1} variants={fadeUp}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Tu próxima propiedad
            <br />
            <span className="relative inline-block">
              te está esperando
              {/* Subrayado rojo de marca como firma visual del titular */}
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[5px] w-full rounded-full"
                style={{ background: "var(--brand)", boxShadow: "0 0 22px -4px var(--brand)" }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="show" custom={2} variants={fadeUp}
            className="mt-7 max-w-lg text-balance text-lg text-slate-300"
          >
            Casas, departamentos, terrenos y locales en venta y alquiler en toda
            Argentina. Tasaciones sin cargo, visitas coordinadas y asesoría real.
            A un WhatsApp de distancia.
          </motion.p>

          {/* Buscador prominente */}
          <motion.form
            action="/propiedades" method="get"
            initial="hidden" animate="show" custom={3} variants={fadeUp}
            className="glass-dark mt-9 flex max-w-xl items-center gap-2 rounded-full p-2 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] focus-within:border-brand/60"
          >
            <Search className="ml-3 size-5 shrink-0 text-slate-400" />
            <input
              name="q" type="search" placeholder="¿Qué estás buscando? Tipo, operación, ciudad…"
              aria-label="Buscar propiedades"
              className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
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
            <span className="text-xs font-medium text-slate-500">Accesos rápidos:</span>
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="glass-dark inline-flex items-center rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-brand/60 hover:text-white"
              >
                {f.label}
              </Link>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial="hidden" animate="show" custom={5} variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <WhatsappButton numero={a.whatsapp} mensaje={mensajeGeneral(a)} label="Asesoría por WhatsApp" size="lg" />
            <Link
              href="/propiedades"
              className="glass-dark inline-flex h-13 items-center gap-1.5 rounded-full px-7 text-base font-medium text-white transition hover:bg-white/10"
            >
              Ver propiedades <ArrowRight className="size-4" />
            </Link>
          </motion.div>

          {/* Banda de confianza */}
          <motion.dl
            initial="hidden" animate="show" custom={6} variants={fadeUp}
            className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-7"
          >
            {TRUST.map((t) => (
              <div key={t.value} className="flex flex-col gap-1.5">
                <t.icon className="size-5 text-brand" aria-hidden />
                <dt className="text-sm font-semibold text-white">{t.value}</dt>
                <dd className="text-xs leading-snug text-slate-400">{t.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual: la casa de América sobre un spotlight rojo de marca. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          {/* Spotlight rojo difuso detrás de la casa */}
          <div className="hero-spotlight pointer-events-none absolute left-1/2 top-1/2 size-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
          <div className="animate-float relative mx-auto aspect-square w-full max-w-lg">
            <Image
              src={HERO_CASA}
              alt="Propiedades en venta y alquiler en toda Argentina — América Cardozo"
              fill
              priority
              sizes="(max-width: 1024px) 0px, 32rem"
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Chip flotante de cobertura nacional (microdetalle premium) */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-dark absolute bottom-6 left-2 inline-flex items-center gap-2.5 rounded-2xl px-4 py-3"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <MapPin className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-white">Cobertura nacional</span>
              <span className="block text-xs text-slate-400">Operamos en toda Argentina</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
