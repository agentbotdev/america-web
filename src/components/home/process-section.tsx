"use client";

import { motion } from "motion/react";
import { Search, MapPin, FileSignature, KeyRound, BadgeCheck } from "lucide-react";

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
    <section id="proceso" className="section-dark relative overflow-hidden border-y border-white/5">
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            <span className="size-1.5 rounded-full bg-brand" /> Cómo trabajamos
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            De la búsqueda a las llaves,
            <br className="hidden sm:block" /> en 4 pasos sin fricción.
          </h2>
          <p className="mt-4 text-balance text-lg text-slate-300">
            Cada etapa pensada y acompañada. Esto es lo que cambia operar con nosotros.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Línea conectora (se dibuja al entrar en viewport) */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px lg:block">
            <div className="h-full w-full bg-white/10" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: 0 }}
              className="absolute inset-0 h-full bg-gradient-to-r from-brand via-brand to-transparent"
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PASOS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                {/* Nodo de la timeline */}
                <div className="relative z-10 mb-5 flex items-center gap-4 lg:block">
                  <motion.span
                    whileHover={{ scale: 1.08 }}
                    className="glow-brand relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-white"
                  >
                    <p.icon className="size-6" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-white/15 bg-[#0a0e1a] font-mono text-xs font-semibold text-brand">
                      {i + 1}
                    </span>
                  </motion.span>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand/40 group-hover:bg-white/[0.07] group-hover:shadow-2xl group-hover:shadow-brand/25">
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2.5 py-1 text-[11px] font-medium text-brand">
                    <BadgeCheck className="size-3" /> {p.chip}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
