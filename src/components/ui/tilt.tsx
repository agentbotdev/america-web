"use client";

import { useRef, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/use-client-hooks";

// Tilt 3D al mover el mouse, en CSS puro.
//
// POR QUÉ SIN motion: este componente envuelve CADA card del catálogo — hasta
// 140 en pantalla. Con la librería, cada instancia creaba 4 motion values y 2
// springs, o sea 140 motores de animación en JS vivos a la vez. Era una de las
// razones por las que el sitio se sentía pesado, y la librería completa pesa
// ~160 KB que había que descargar y parsear antes de poder interactuar.
//
// El ángulo se escribe en dos CSS custom properties y la suavidad la da una
// transición del navegador. Se pierde el rebote elástico del spring y se gana
// que la animación corra en el compositor: para un tilt de 6 grados la
// diferencia visual es nula.
//
// PERFORMANCE (se conserva lo que ya estaba bien):
//   · el rect se cachea en `enter` — nada de getBoundingClientRect por evento;
//   · el update se throttlea con requestAnimationFrame;
//   · se DESACTIVA en touch (`pointer: coarse`), donde no aporta nada;
//   · se escribe directo al style del nodo, sin pasar por el estado de React:
//     mover el mouse no dispara un solo re-render.

export function Tilt({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const raf = useRef<number | null>(null);
  const fine = useMediaQuery("(pointer: fine)");

  // En mobile/touch: render plano, sin listeners.
  if (!fine) return <div className={className}>{children}</div>;

  function enter() {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
  }

  function move(e: React.MouseEvent<HTMLDivElement>) {
    if (raf.current) return;
    const cx = e.clientX;
    const cy = e.clientY;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const r = rect.current;
      const el = ref.current;
      if (!r || !el) return;
      const px = (cx - r.left) / r.width - 0.5;
      const py = (cy - r.top) / r.height - 0.5;
      el.style.setProperty("--tilt-x", `${(-py * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${(px * max * 2).toFixed(2)}deg`);
    });
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <div
        ref={ref}
        onMouseEnter={enter}
        onMouseMove={move}
        onMouseLeave={reset}
        className="tilt-3d h-full"
      >
        {children}
      </div>
    </div>
  );
}
