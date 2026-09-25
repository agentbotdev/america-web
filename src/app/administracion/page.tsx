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
  Award,
  UserCheck,
  FileText,
  Banknote,
  CalendarCheck,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

// Reunión 18/09 (Moria): la sección pasa de "Nosotros" a "Administración" —
// el servicio de administración de alquileres al frente, y "de paso la gente
// lee todo lo nuestro" (quiénes somos, valores, servicios). /nosotros redirige
// acá (next.config.ts).
export const metadata: Metadata = {
  title: "Administración",
  description:
    "Administración de alquileres y estudio inmobiliario integral: contratos, cobranza y seguimiento de tu propiedad. Más de 20 años de experiencia en todo el país.",
  alternates: { canonical: "/administracion" },
  openGraph: {
    title: "Administración | América Cardozo",
    description:
      "Administramos tu propiedad en alquiler de principio a fin. Más de 20 años en el mercado inmobiliario.",
    url: "/administracion",
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

// Cómo administramos (reunión 18/09): el servicio que da nombre a la solapa.
// Solo lo que la inmobiliaria HACE — sin métricas ni promesas inventadas.
const ADMINISTRACION = [
  {
    icon: UserCheck,
    title: "Publicación y selección",
    desc: "Difundimos tu propiedad, coordinamos visitas y verificamos garantías e ingresos para elegir bien al inquilino.",
  },
  {
    icon: FileText,
    title: "Contratos claros",
    desc: "Redacción y renovación de contratos con respaldo legal: condiciones, ajustes y garantías sin letra chica.",
  },
  {
    icon: Banknote,
    title: "Cobranza y liquidación",
    desc: "Seguimos los pagos mes a mes y te liquidamos el alquiler: vos cobrás, nosotros nos ocupamos del resto.",
  },
  {
    icon: CalendarCheck,
    title: "Seguimiento del inmueble",
    desc: "Vencimientos, ajustes del contrato y estado de la propiedad, con comunicación directa con vos y el inquilino.",
  },
];

// Pilares de trabajo: por qué elegirnos (sólido, sin inventar métricas).
const VALORES = [
  {
    icon: Award,
    title: "+20 años de experiencia",
    desc: "Dos décadas en el mercado inmobiliario nos avalan para asesorarte con criterio y datos reales.",
  },
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
];

export default function NosotrosPage() {
  const a = AGENCIA;

  return (
    <div>
      {/* Hero */}
      <section className="section-band relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Award className="size-3.5 text-brand" />
              +{a.anios_experiencia} años · Operamos en todo el país
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
              {a.nombre}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
              {a.tagline}. Compra, venta y alquiler de propiedades en todo el
              país, con asesoramiento real y cercano.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Administración de alquileres — el servicio que da nombre a la solapa
          (reunión 18/09). Quien entra por "Administración" busca ESTO; lo
          institucional queda a un scroll de distancia. */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="administracion">
        <Reveal>
          <h2 id="administracion" className="text-2xl font-semibold sm:text-3xl">
            Administración de alquileres
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-2xl text-balance text-muted-foreground">
            Administramos tu propiedad de principio a fin: inquilino verificado,
            contrato en regla, cobranza al día y seguimiento del inmueble. Vos
            cobrás tu alquiler; nosotros nos ocupamos del resto.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADMINISTRACION.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="card-premium h-full rounded-lg p-5">
                <span className="flex size-11 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-6">
            <WhatsappButton
              numero={AGENCIA.whatsapp}
              mensaje="¡Hola América Cardozo! 👋 Tengo una propiedad y quiero que me cuenten cómo trabajan la administración de alquileres."
              label="Quiero que administren mi propiedad"
            />
          </div>
        </Reveal>
      </section>

      {/* Quiénes somos */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Quiénes somos
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-5 space-y-4 text-balance text-muted-foreground">
            <p>
              {a.nombre} es un estudio inmobiliario integral con más de{" "}
              {a.anios_experiencia} años en el mercado de venta, alquiler y
              administración de propiedades. Ayudamos a familias e inversores de
              todo el país a encontrar la propiedad indicada y a concretar cada
              operación con tranquilidad.
            </p>
            <p>
              Trabajamos con un trato directo, honesto y orientado a resultados.
              Esa experiencia nos permite tasar con criterio, asesorar con datos
              reales y acompañar cada compra, venta o alquiler de principio a
              fin. Sin vueltas y a un mensaje de distancia.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Valores / por qué elegirnos */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALORES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="card-premium flex h-full items-start gap-4 rounded-lg p-5">
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
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Nuestros servicios
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICIOS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="card-premium h-full rounded-lg p-5">
                <span className="flex size-11 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cobertura */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="panel-glass rounded-lg p-6 sm:p-8">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
              <MapPin className="size-6 text-brand" /> Dónde trabajamos
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Operamos en <strong className="text-foreground">toda la Argentina</strong>.
              Vendas o busques donde sea, te asesoramos a distancia con la misma
              cercanía. Nuestra oficina central está en{" "}
              <strong className="text-foreground">{a.direccion}</strong>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 pb-20 sm:px-6 lg:px-8">
        {/* Banda charcoal (misma receta que la home): el negro del logo con la
            raya roja de firma — el rojo a bloque completo quedó atrás. */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--ink)] px-6 py-14 text-center shadow-[0_28px_70px_-40px_rgba(20,16,10,0.75)] sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="relative mx-auto max-w-2xl">
            <span aria-hidden className="mx-auto block h-[3px] w-12 bg-brand" />
            <h2 className="mt-6 text-balance text-3xl font-semibold text-white sm:text-4xl">
              Hablemos de tu próxima operación
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-white/85">
              Comprá, vendé o alquilá con un equipo con más de {a.anios_experiencia}{" "}
              años de experiencia. Escribinos y te asesoramos sin compromiso.
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
                className="inline-flex h-13 items-center gap-1.5 rounded-md border border-white/30 px-7 text-base font-medium text-white transition hover:border-white hover:bg-white/10"
              >
                Ver propiedades <ArrowRight className="size-4" />
              </Link>
            </div>
            {a.email && (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white">
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
