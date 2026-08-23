"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Scroll-reveal en CSS PURO + un IntersectionObserver compartido.
//
// POR QUÉ SE REESCRIBIÓ (venía de motion/react):
// `Reveal` sólo hace fade + desplazamiento, y se usa en 26 lugares. Cada uno era
// un `<motion.div>` con su propio ciclo de animación en JS. El cliente reportó
// el sitio lento y motion pesa ~160 KB en el bundle; esto es la misma animación
// con cero JS de animación — el navegador la corre en el compositor.
//
// UN SOLO OBSERVER para todos los elementos, no uno por componente: crear 26
// IntersectionObserver es 26 veces el trabajo de cálculo de intersección en cada
// scroll. Es la misma idea que deduplicar listeners globales.
//
// SEGURIDAD ANTE FALLO DE JS — importante, porque este proyecto YA tuvo el bug
// de contenido invisible: el CSS que oculta vive detrás de la clase
// `.js-reveal`, que agrega este módulo al montar. Si el JS no corre, no se
// descarga o falla, `.js-reveal` nunca aparece y TODO se ve. Nunca se puede
// quedar contenido en opacity:0.

let observer: IntersectionObserver | null = null;
const pendientes = new Set<Element>();

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
  if (observer) return observer;

  // Marca el documento: recién ahora el CSS puede ocultar (ver globals.css).
  document.documentElement.classList.add("js-reveal");

  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visible");
        // `once`: una vez visible ya no interesa seguir observándolo.
        observer?.unobserve(e.target);
        pendientes.delete(e.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
  );
  return observer;
}

function useReveal(delayMs: number) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = getObserver();
    // Sin soporte de IntersectionObserver: se muestra y listo.
    if (!obs) {
      el.classList.add("is-visible");
      return;
    }
    if (delayMs) el.style.transitionDelay = `${delayMs}ms`;
    obs.observe(el);
    pendientes.add(el);
    return () => {
      obs.unobserve(el);
      pendientes.delete(el);
    };
  }, [delayMs]);

  return ref;
}

type Direction = "up" | "down" | "left" | "right";

/** Aparición al entrar en viewport: fade + desplazamiento. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  direction = "up",
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** Distancia de desplazamiento en px. */
  y?: number;
  direction?: Direction;
  /** @deprecated el blur-in se quitó: dejaba texto borroso con reduced-motion. */
  blur?: number;
  amount?: number;
  once?: boolean;
  className?: string;
}) {
  const ref = useReveal(delay * 1000);
  return (
    <div
      ref={ref}
      className={`reveal ${className ?? ""}`}
      style={desplazamiento(direction, y)}
    >
      {children}
    </div>
  );
}

/** Contenedor que escalona la entrada de sus `<RevealItem>`. */
export function RevealGroup({
  children,
  stagger = 0.09,
  delayChildren = 0,
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
    <div
      className={className}
      // El escalonado se resuelve en CSS: cada hijo lee su índice de una
      // custom property y calcula su propio delay. Sin orquestador en JS.
      style={
        {
          "--reveal-stagger": `${stagger}s`,
          "--reveal-delay-base": `${delayChildren}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** Hijo de `RevealGroup`: hereda el timing del escalonado. */
export function RevealItem({
  children,
  y = 28,
  direction = "up",
  className,
}: {
  children: ReactNode;
  y?: number;
  direction?: Direction;
  blur?: number;
  className?: string;
}) {
  const ref = useReveal(0);
  return (
    <div
      ref={ref}
      className={`reveal reveal-item ${className ?? ""}`}
      style={desplazamiento(direction, y)}
    >
      {children}
    </div>
  );
}

/** Traduce dirección + distancia al par de custom properties que usa el CSS. */
function desplazamiento(direction: Direction, distancia: number): React.CSSProperties {
  const eje = direction === "left" || direction === "right" ? "X" : "Y";
  const signo = direction === "right" || direction === "down" ? 1 : -1;
  return {
    "--reveal-x": eje === "X" ? `${distancia * signo}px` : "0px",
    "--reveal-y": eje === "Y" ? `${distancia * signo}px` : "0px",
  } as React.CSSProperties;
}
