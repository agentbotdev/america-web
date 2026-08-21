"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "motion/react";
import { useMounted } from "@/lib/use-client-hooks";

// Count-up al entrar en viewport. Reescrito desde el patrón de 21st/Magic pero
// limpio: usa motion/react nativo (useMotionValue + animate), respeta
// reduced-motion (muestra el valor final sin animar) y formatea con separador
// de miles en es-AR. Server-safe: es "use client" y solo anima en el browser.
export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion() ?? false;
  const mounted = useMounted();
  const motionValue = useMotionValue(from);
  const [animado, setAnimado] = useState(() => format(from, decimals));

  useEffect(() => {
    // Sin animación que arrancar si el usuario pidió reduced-motion o el
    // contador todavía no entró en viewport.
    if (reduced || !inView) return;
    const controls = animate(motionValue, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      // setState desde un callback del animador NO es "setState en el cuerpo
      // del effect": es una suscripción a un sistema externo, que es
      // exactamente para lo que sirve useEffect.
      onUpdate: (v) => setAnimado(format(v, decimals)),
    });
    return () => controls.stop();
  }, [inView, reduced, to, duration, decimals, motionValue]);

  // Reduced-motion: el valor final se DERIVA durante el render, no se sincroniza
  // con un effect (antes era `setDisplay(...)` en el cuerpo del effect → render
  // en cascada).
  //
  // El `mounted &&` NO es decorativo: sin él esto rompe la hidratación.
  // `useReducedMotion()` lee una media query, así que devuelve `false` en el
  // servidor y el valor REAL en el cliente. Derivar directo de `reduced` hacía
  // que el server pintara "0" y el cliente "20" en el mismo nodo → hydration
  // mismatch (verificado en consola), y ante un mismatch React descarta el HTML
  // del servidor y re-renderiza todo el árbol.
  // Con `useMounted()` el server y el PRIMER render del cliente coinciden
  // siempre (ambos `false` → muestran `animado`); recién después de hidratar
  // aparece el valor final. Mismo hook que ya usa el resto del proyecto.
  const display = mounted && reduced ? format(to, decimals) : animado;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function format(value: number, decimals: number): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
