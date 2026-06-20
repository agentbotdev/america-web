"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Search, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

const Hero3DScene = dynamic(() => import("./hero-3d-scene"), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

// Tags rápidos del hero: deep-link a /propiedades con filtros (operación / tipo / dormitorios).
const QUICK_FILTERS = [
  { label: "En venta", href: "/propiedades?operacion=venta" },
  { label: "En alquiler", href: "/propiedades?operacion=alquiler" },
  { label: "Casas", href: "/propiedades?tipo=Casa" },
  { label: "Departamentos", href: "/propiedades?tipo=Departamento" },
  { label: "Terrenos", href: "/propiedades?tipo=Terreno" },
  { label: "2 dormitorios", href: "/propiedades?dormitorios=2" },
  { label: "3 dormitorios", href: "/propiedades?dormitorios=3" },
];

// La casa del hero (WEBP transparente) vive en public/ → se sirve y deploya con la web.
const HERO_CASA = "/hero-casa.webp";

// Glow de marca reutilizable (radial sutil, color del tenant via CSS var).
const glow = (alpha: number) =>
  `radial-gradient(circle, color-mix(in oklch, var(--brand) ${Math.round(
    alpha * 100,
  )}%, transparent), transparent 70%)`;

export function Hero() {
  const a = AGENCIA;
  return (
    <section className="section-dark relative overflow-hidden">
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50" />

      {/* Fondo: degradé de marca en MOVIMIENTO (sutil). Anima transform/opacity → GPU,
          no repinta, no afecta la performance. Se apaga con prefers-reduced-motion. */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-aurora absolute -left-[12%] top-[2%] size-[58vw] max-w-[700px] rounded-full blur-3xl"
          style={{ background: glow(0.3) }}
        />
        <div
          className="animate-aurora absolute -right-[10%] bottom-[-14%] size-[52vw] max-w-[640px] rounded-full blur-3xl"
          style={{ background: glow(0.22), animationDelay: "-9s", animationDuration: "26s" }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-70">
        <Hero3DScene />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        {/* Texto */}
        <div>
          <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
            <span className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-200">
              <ShieldCheck className="size-3.5 text-electric" />
              {a.tagline} · {a.zona_operacion}
            </span>
          </motion.div>

          <motion.h1
            initial="hidden" animate="show" custom={1} variants={fadeUp}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Encontrá tu próximo
            <br />
            <span className="text-gradient">hogar en Zona Oeste</span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="show" custom={2} variants={fadeUp}
            className="mt-6 max-w-md text-balance text-lg text-slate-300"
          >
            Casas, departamentos, terrenos y locales en venta y alquiler.
            Con tasaciones sin cargo, visitas coordinadas y asesoría real.
            A un WhatsApp de distancia.
          </motion.p>

          <motion.form
            action="/propiedades" method="get"
            initial="hidden" animate="show" custom={3} variants={fadeUp}
            className="glass-dark mt-8 flex max-w-md items-center gap-2 rounded-full p-1.5"
          >
            <Search className="ml-3 size-5 shrink-0 text-slate-400" />
            <input
              name="q" type="search" placeholder="Barrio, tipo de propiedad..."
              aria-label="Buscar propiedades"
              className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="glow-brand h-10 shrink-0 rounded-full bg-brand px-5 text-sm font-medium text-white transition hover:brightness-110">
              Buscar
            </button>
          </motion.form>

          <motion.div
            initial="hidden" animate="show" custom={4} variants={fadeUp}
            className="mt-4 flex flex-wrap gap-2"
          >
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="glass-dark inline-flex items-center rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-brand/60 hover:text-white"
              >
                {f.label}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial="hidden" animate="show" custom={5} variants={fadeUp}
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            <WhatsappButton numero={a.whatsapp} mensaje={mensajeGeneral(a)} label="Asesoría por WhatsApp" size="lg" />
            <Link href="/propiedades" className="glass-dark inline-flex h-13 items-center gap-1.5 rounded-full px-7 text-base font-medium text-white transition hover:bg-white/10">
              Ver propiedades <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>

        {/* Visual: la casa de América, montada en una tarjeta clara que se ve
            prolija con cualquier PNG (fondo blanco o transparente), sobre el glow. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          {/* Glow de marca detrás de la casa */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: glow(0.42) }}
          />
          <div className="animate-float relative mx-auto aspect-square w-full max-w-lg">
            <Image
              src={HERO_CASA}
              alt="Propiedades en venta y alquiler en GBA Zona Oeste — América Cardozo"
              fill
              priority
              sizes="(max-width: 1024px) 0px, 32rem"
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
