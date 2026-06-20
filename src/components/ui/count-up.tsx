"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "motion/react";

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
  const motionValue = useMotionValue(from);
  const [display, setDisplay] = useState(() => format(from, decimals));

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(format(to, decimals));
      return;
    }
    const controls = animate(motionValue, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(v, decimals)),
    });
    return () => controls.stop();
  }, [inView, reduced, to, duration, decimals, motionValue]);

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
