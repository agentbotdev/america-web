"use client";

import { motion } from "motion/react";
import { ArrowUpRight, BedDouble, Ruler } from "lucide-react";
import { PropertyImage } from "../propiedades/property-image";
import { formatPrecio, formatM2 } from "@/lib/format";
import type { Propiedad } from "@/types";

/* ------------------------------------------------------------------ */
/*  Miniatura de propiedad recomendada DENTRO del chat.               */
/*  Clickeable: avisa al padre (que navega + minimiza a PIP).         */
/* ------------------------------------------------------------------ */

function precioMini(p: Propiedad): string {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

export function MiniPropiedad({
  p,
  onSeleccionar,
  index = 0,
}: {
  p: Propiedad;
  onSeleccionar: (p: Propiedad) => void;
  index?: number;
}) {
  const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
  const ubicacion = [p.barrio, p.ciudad].filter(Boolean).join(", ");
  const m2 = formatM2(p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSeleccionar(p)}
      aria-label={`Ver ${p.titulo}`}
      className="group flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-2 text-left transition hover:border-brand/45 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-white/10 to-transparent">
        <PropertyImage
          foto={portada}
          titulo={p.titulo}
          tipo={p.tipo_propiedad}
          sizes="64px"
          className="transition-transform duration-500 group-hover:scale-110"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">
          {p.tipo_propiedad}
          {p.dormitorios ? ` · ${p.dormitorios} dorm.` : ""}
        </span>
        {ubicacion && (
          <span className="mt-0.5 block truncate text-[11px] text-slate-400">{ubicacion}</span>
        )}
        <span className="mt-1 flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-white">{precioMini(p)}</span>
          {m2 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-medium text-electric">
              <Ruler className="size-2.5" />
              {m2}
            </span>
          )}
          {!m2 && p.dormitorios ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-medium text-electric">
              <BedDouble className="size-2.5" />
              {p.dormitorios}
            </span>
          ) : null}
        </span>
      </span>

      <ArrowUpRight className="size-4 shrink-0 text-slate-500 transition group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.button>
  );
}
