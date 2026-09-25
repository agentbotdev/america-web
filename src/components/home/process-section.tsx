"use client";

import { Search, MapPin, FileSignature, KeyRound, BadgeCheck } from "lucide-react";
// Reveal/RevealItem son CSS puro + un IntersectionObserver compartido: la misma
// entrada al scrollear que hacía motion, sin la librería.
import { Reveal, RevealItem } from "@/components/ui/reveal";

// Proceso de compra/alquiler contado como roadmap: 4 etapas tangibles, conectadas y animadas.
const PASOS = [
  {
    icon: Search,
    title: "Buscás",
    desc: "Filtrá las propiedades por barrio, tipo, operación y precio. Cada unidad con ficha completa, fotos reales y ubicación.",
    chip: "Listado real",
  },
  {
    icon: MapPin,
    title: "Visitás",
    desc: "Coordinamos la visita según tu agenda. Te mostramos la propiedad y respondemos todo en el lugar, sin apuro.",
    chip: "Visitas coordinadas",
  },
  {
    icon: FileSignature,
    title: "Reservás",
    desc: "Definida la propiedad, dejás la reserva y nos ocupamos de los papeles. Asesoría legal incluida de punta a punta.",
    chip: "Asesoría legal",
  },
  {
    icon: KeyRound,
    title: "Firmás",
    desc: "Firma de boleto o contrato, todo en regla, y te llevás las llaves. Transparencia total, sin letra chica.",
    chip: "Llaves en mano",
  },
];

export function ProcessSection() {
  return (
    <section id="proceso" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:px-8">
        <Reveal className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-brand" /> Cómo trabajamos
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
            De la búsqueda a las llaves,
            <br className="hidden sm:block" /> en 4 pasos sin fricción.
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Cada etapa pensada y acompañada. Esto es lo que cambia operar con nosotros.
          </p>
        </Reveal>

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Línea conectora (se dibuja al entrar en viewport) */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px lg:block">
            <div className="h-full w-full bg-border" />
            <div className="linea-progreso absolute inset-0 h-full bg-gradient-to-r from-brand via-brand to-transparent" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PASOS.map((p, i) => (
              <RevealItem key={p.title} className="group relative"
              >
                {/* Nodo de la timeline */}
                <div className="relative z-10 mb-5 flex items-center gap-4 lg:block">
                  {/* Rojo TRANSLÚCIDO sobre la banda crema: el nodo respira y
                      deja pasar el fondo en vez de ser un bloque macizo. /85 es
                      el piso seguro — el ícono blanco queda en 3.56 y el umbral
                      WCAG para elementos gráficos es 3.0. Más transparencia que
                      esa y el ícono deja de leerse. */}
                  <span className="relative flex size-14 shrink-0 items-center justify-center rounded-md bg-brand text-white"
                  >
                    <p.icon className="size-6" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-card font-heading text-xs font-semibold text-brand-text">
                      {i + 1}
                    </span>
                  </span>
                </div>

                {/* Card */}
                <div className="card-premium rounded-lg p-5 transition-all duration-300 group-hover:-translate-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand-text">
                    <BadgeCheck className="size-3" /> {p.chip}
                  </span>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
