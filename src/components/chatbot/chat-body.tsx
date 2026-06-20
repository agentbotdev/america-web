"use client";

import { forwardRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MiniPropiedad } from "./mini-propiedad";
import { WaCierre } from "./wa-cierre";
import type { Respuestas } from "./flujo";
import type { Propiedad } from "@/types";

/* ------------------------------------------------------------------ */
/*  Cuerpo scrolleable del chat: burbujas + typing + recomendaciones  */
/*  + handoff. Aislado del orquestador para mantenerlo legible.       */
/* ------------------------------------------------------------------ */

export type Burbuja = { de: "bot" | "user"; texto: string };

type Props = {
  burbujas: Burbuja[];
  escribiendo: boolean;
  recomendados: Propiedad[];
  finalizado: boolean;
  respuestas: Respuestas;
  interesados: Propiedad[];
  onSeleccionar: (p: Propiedad) => void;
  onReiniciar: () => void;
};

export const ChatBody = forwardRef<HTMLDivElement, Props>(function ChatBody(
  { burbujas, escribiendo, recomendados, finalizado, respuestas, interesados, onSeleccionar, onReiniciar },
  ref,
) {
  return (
    <div ref={ref} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      <AnimatePresence initial={false}>
        {burbujas.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={b.de === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <span
              className={
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug " +
                (b.de === "user"
                  ? "rounded-br-md bg-brand text-white"
                  : "rounded-bl-md bg-white/10 text-slate-100")
              }
            >
              {b.texto}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {escribiendo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
          <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-3">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="size-1.5 rounded-full bg-slate-300"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
              />
            ))}
          </span>
        </motion.div>
      )}

      {/* Recomendaciones: miniaturas clickeables */}
      {recomendados.length > 0 && !escribiendo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-2 pt-1"
        >
          {recomendados.map((p, i) => (
            <MiniPropiedad key={p.id} p={p} index={i} onSeleccionar={onSeleccionar} />
          ))}
          <p className="px-1 pt-0.5 text-[11px] text-slate-400">
            Tocá una propiedad para ver la ficha completa 👆
          </p>
        </motion.div>
      )}

      {finalizado && (
        <WaCierre respuestas={respuestas} interesados={interesados} onReiniciar={onReiniciar} />
      )}
    </div>
  );
});
