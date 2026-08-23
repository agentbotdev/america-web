"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/use-client-hooks";

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
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [animado, setAnimado] = useState(() => format(from, decimals));

  // Conteo con requestAnimationFrame, sin la librería de animación.
  // Un contador numérico no necesita un motor de animación: es interpolar un
  // número entre dos valores durante N milisegundos. La curva de easing son
  // tres líneas. Traer ~160 KB para esto era desproporcionado.
  //
  // El IntersectionObserver también es propio (reemplaza a `useInView`) y se
  // desconecta apenas dispara: el contador corre una sola vez.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Con reduced-motion no hay nada que animar: el valor final se DERIVA
    // abajo, durante el render. Sin observer ni rAF.
    if (reduced) return;

    let raf = 0;
    let inicio = 0;
    // easeOutExpo — misma sensación que el cubic-bezier que se usaba antes:
    // arranca rápido y frena suave al llegar al número final.
    const easing = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (ahora: number) => {
      if (!inicio) inicio = ahora;
      const avance = Math.min((ahora - inicio) / (duration * 1000), 1);
      setAnimado(format(from + (to - from) * easing(avance), decimals));
      if (avance < 1) raf = requestAnimationFrame(tick);
    };

    // Sin IntersectionObserver (navegador viejo) se anima de una: mejor eso
    // que dejar el número clavado en el valor inicial.
    if (!("IntersectionObserver" in window)) {
      raf = requestAnimationFrame(tick);
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, to, from, duration, decimals]);

  // Con reduced-motion el valor final se DERIVA durante el render, no se
  // sincroniza con un effect (eso disparaba un render en cascada y el linter lo
  // marca). `useMediaQuery` devuelve false en el servidor Y en el primer render
  // del cliente, así que no hay hydration mismatch — el bug que ya apareció una
  // vez acá cuando el server pintaba "0" y el cliente "20".
  const display = reduced ? format(to, decimals) : animado;

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
