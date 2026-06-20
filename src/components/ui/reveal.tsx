"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

// Easing canónico de la marca (mismo que process-section / hero).
const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right";

// Variantes de entrada: fade + desplazamiento + blur-in. El blur le da el toque
// "premium" (el contenido enfoca al entrar). Reduced-motion → sin blur ni shift,
// solo un fade discreto (accesible y sin jank).
function buildVariants(
  direction: Direction,
  distance: number,
  blur: number,
  reduced: boolean,
): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    };
  }
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "right" || direction === "down" ? 1 : -1;
  return {
    hidden: { opacity: 0, filter: `blur(${blur}px)`, [axis]: distance * sign },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
    },
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
  const reduced = useReducedMotion() ?? false;
  const variants = buildVariants(direction, y, blur, reduced);

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
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delayChildren,
          },
        },
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
  const reduced = useReducedMotion() ?? false;
  const variants = buildVariants(direction, y, blur, reduced);
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
