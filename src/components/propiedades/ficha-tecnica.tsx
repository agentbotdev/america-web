"use client";

import { motion } from "motion/react";
import {
  BedDouble, Ruler, ClipboardList, Sparkles, Check,
  type LucideIcon,
} from "lucide-react";
import { fichaTecnica, type FichaCategoria } from "@/lib/ficha-tecnica";
import type { Propiedad } from "@/types";

const ICONS: Record<FichaCategoria["icon"], LucideIcon> = {
  ambientes: BedDouble,
  superficies: Ruler,
  caracteristicas: ClipboardList,
  comodidades: Sparkles,
};

// Ficha técnica COMPLETA de la propiedad: todas las categorías desplegadas a la
// vez, en cards glass prolijas en grid. Cada card revela al hacer scroll.
// "Comodidades y servicios" se renderiza como chips (deriva de p.tags).
export function FichaTecnica({ propiedad }: { propiedad: Propiedad }) {
  const cats = fichaTecnica(propiedad);
  if (cats.length === 0) return null;

  return (
    <section id="ficha-tecnica" className="mt-14">
      <div className="mb-6">
        <span className="text-sm font-medium text-brand">Especificaciones</span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Ficha técnica
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Todos los detalles de la propiedad, apartado por apartado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cats.map((c, i) => {
          const Icon = ICONS[c.icon];
          const isChips = !!c.chips?.length;
          const count = isChips ? c.chips!.length : c.items.length;
          return (
            <motion.div
              key={c.titulo}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors duration-300 hover:border-brand/40"
              style={{ borderTopColor: "rgba(255,255,255,0.16)" }}
            >
              {/* Encabezado de la categoría */}
              <div className="flex items-center gap-3 border-b border-white/[0.07] bg-gradient-to-r from-brand/[0.12] to-transparent px-5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand ring-1 ring-brand/30">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-semibold">{c.titulo}</h3>
                <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {count}
                </span>
              </div>

              {/* Chips (comodidades) o pares label/value */}
              {isChips ? (
                <ul className="flex flex-wrap gap-2 px-5 py-4">
                  {c.chips!.map((chip) => (
                    <li
                      key={chip}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-foreground"
                    >
                      <Check className="size-3.5 shrink-0 text-brand" />
                      {chip}
                    </li>
                  ))}
                </ul>
              ) : (
                <dl className="divide-y divide-white/[0.06] px-5">
                  {c.items.map((it) => (
                    <div key={it.label} className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-sm text-muted-foreground">{it.label}</dt>
                      <dd className="text-right text-sm font-medium text-foreground">{it.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default FichaTecnica;
