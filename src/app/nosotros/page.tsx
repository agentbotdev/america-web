import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  KeyRound,
  Ruler,
  Scale,
  MapPin,
  ArrowRight,
  Mail,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Inmobiliaria América Cardozo: venta, alquiler, tasaciones y asesoría en GBA Zona Oeste. Conocé cómo trabajamos.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros | América Cardozo",
    description:
      "Venta, alquiler, tasaciones y asesoría legal en GBA Zona Oeste. Conocé cómo trabajamos.",
    url: "/nosotros",
  },
};

const SERVICIOS = [
  {
    icon: Home,
    title: "Venta",
    desc: "Comercializamos casas, departamentos, terrenos y locales con difusión real y acompañamiento en cada etapa.",
  },
  {
    icon: KeyRound,
    title: "Alquiler",
    desc: "Gestionamos alquileres residenciales y comerciales: contratos claros, garantías y seguimiento.",
  },
  {
    icon: Ruler,
    title: "Tasaciones",
    desc: "Valuamos tu propiedad con criterio de mercado para que tomes la mejor decisión, sin cargo.",
  },
  {
    icon: Scale,
    title: "Asesoría legal",
    desc: "Te acompañamos en la documentación y los aspectos legales de cada operación.",
  },
];

// Pilares de trabajo: por qué elegirnos (genérico sólido, sin inventar métricas).
const VALORES = [
  {
    icon: ShieldCheck,
    title: "Transparencia",
    desc: "Información clara en cada operación: precios, condiciones y documentación sin letra chica.",
  },
  {
    icon: HeartHandshake,
    title: "Trato cercano",
    desc: "Un asesor que te acompaña de principio a fin, atento a lo que realmente necesitás.",
  },
  {
    icon: Sparkles,
    title: "Conocimiento de la zona",
    desc: "Conocemos el mercado de Zona Oeste barrio por barrio para asesorarte con datos reales.",
  },
];

// Zona de trabajo declarada (GBA Zona Oeste). No es dato de contacto: es cobertura.
const ZONAS = [
  "Moreno",
  "Paso del Rey",
  "General Rodríguez",
  "Pilar",
  "La Reja",
  "Francisco Álvarez",
  "Ituzaingó",
  "Merlo",
];

export default function NosotrosPage() {
  const a = AGENCIA;

  return (
    <div>
      {/* Hero */}
      <section className="section-dark relative overflow-hidden">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <span className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-200">
              <MapPin className="size-3.5 text-electric" />
              {a.zona_operacion}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {a.nombre}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-slate-300">
              {a.tagline}. Compra, venta y alquiler de propiedades con
              asesoramiento real y cercano.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Quiénes somos
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-5 space-y-4 text-balance text-muted-foreground">
            <p>
              En {a.nombre} ayudamos a las familias y a los inversores de{" "}
              {a.zona_operacion} a encontrar la propiedad indicada y a concretar
              cada operación con tranquilidad. Trabajamos con un trato directo,
              honesto y orientado a resultados.
            </p>
            <p>
              Conocemos la zona, su mercado y sus barrios. Esa cercanía nos
              permite tasar con criterio, asesorar con datos reales y acompañar
              cada compra, venta o alquiler de principio a fin. Sin vueltas y a
              un mensaje de distancia.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Valores / por qué elegirnos */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALORES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="card-premium flex h-full items-start gap-4 rounded-2xl p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <v.icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Nuestros servicios
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICIOS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="card-premium h-full rounded-2xl p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Zona de trabajo */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="panel-glass rounded-3xl p-6 sm:p-8">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              <MapPin className="size-6 text-brand" /> Dónde trabajamos
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 text-muted-foreground">
              Operamos en toda la {a.zona_operacion}, con foco en estas
              localidades:
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {ZONAS.map((z) => (
                <li
                  key={z}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 text-sm font-medium"
                >
                  <MapPin className="size-3.5 text-brand" /> {z}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 pb-20 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-14 text-center sm:px-12 sm:py-16"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--brand) 78%, black 6%) 0%, color-mix(in oklch, var(--brand) 28%, black 40%) 100%)",
          }}
        >
          <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-25" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hablemos de tu próxima operación
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-slate-200">
              Comprá, vendé o alquilá con un equipo que conoce {a.zona_operacion}.
              Escribinos y te asesoramos sin compromiso.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <WhatsappButton
                numero={a.whatsapp}
                mensaje={mensajeGeneral(a)}
                label="Hablar con un asesor"
                size="lg"
              />
              <Link
                href="/propiedades"
                className="glass-dark inline-flex h-13 items-center gap-1.5 rounded-full px-7 text-base font-medium text-white transition hover:bg-white/10"
              >
                Ver propiedades <ArrowRight className="size-4" />
              </Link>
            </div>
            {a.email && (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-200">
                <Mail className="size-4" />
                <a href={`mailto:${a.email}`} className="hover:underline">
                  {a.email}
                </a>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
