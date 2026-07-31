"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

// Easing canónico de la marca (mismo que process-section / hero).
const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right";

// Variantes de entrada: fade + desplazamiento.
//
// IMPORTANTE: estas variantes son IDÉNTICAS en servidor y cliente — no dependen
// de `useReducedMotion()`. Ramificarlas provocaba un hydration mismatch (el
// servidor pintaba opacity:0 y un cliente con reduced-motion pintaba opacity:1),
// y ante un mismatch React descarta el HTML del servidor y re-renderiza todo.
// De la preferencia del usuario se ocupa `<MotionConfig reducedMotion="user">`
// en el layout: cancela el desplazamiento y deja pasar sólo el fade.
//
// SIN blur-in: el filtro dependía de que la animación corriera para quitarse, y
// con prefers-reduced-motion el navegador NO lo animaba → el contenido quedaba
// BORROSO de forma permanente. Fade + slide es robusto y siempre legible.
function buildVariants(
  direction: Direction,
  distance: number,
  blur: number,
): Variants {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "right" || direction === "down" ? 1 : -1;
  void blur;
  return {
    hidden: { opacity: 0, [axis]: distance * sign },
    visible: { opacity: 1, x: 0, y: 0 },
  };
}

/**
 * Scroll-reveal premium reutilizable: el contenido aparece al entrar en viewport
 * con fade + desplazamiento + blur-in. API retrocompatible (`delay`, `y`,
 * `className`) más opciones nuevas (`direction`, `blur`, `amount`, `once`).
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  direction = "up",
  blur = 8,
  amount = 0.2,
  once = true,
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** Distancia de desplazamiento (compat: era el offset vertical). */
  y?: number;
  direction?: Direction;
  /** Intensidad del blur-in en px. `0` lo desactiva. */
  blur?: number;
  amount?: number;
  once?: boolean;
  className?: string;
}) {
  const variants = buildVariants(direction, y, blur);

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Contenedor que orquesta un stagger entre sus hijos `<RevealItem>`. Ideal para
 * grids/listas: los items entran en cascada elegante sin calcular delays a mano.
 * Usá `RevealGroup` en el wrapper y `RevealItem` en cada hijo.
 */
export function RevealGroup({
  children,
  stagger = 0.09,
  delayChildren = 0,
  amount = 0.15,
  once = true,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
  once?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Hijo de `RevealGroup`: hereda el timing del stagger del contenedor. */
export function RevealItem({
  children,
  y = 28,
  direction = "up",
  blur = 8,
  className,
}: {
  children: ReactNode;
  y?: number;
  direction?: Direction;
  blur?: number;
  className?: string;
}) {
  const variants = buildVariants(direction, y, blur);
  return (
    <motion.div
      className={className}
      variants={variants}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
