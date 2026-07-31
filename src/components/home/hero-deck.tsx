"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import { PropertyImage } from "@/components/propiedades/property-image";
import type { DeckItem } from "@/lib/deck";

// Deck del hero: las destacadas como BARAJA ABANICADA. La carta del frente se
// "reparte" sola cada X segundos (sale por la izquierda y se tuca al fondo del
// mazo). Interacción completa:
//   · la carta del FRENTE navega a la ficha (click) y se puede ARRASTRAR
//     (swipe horizontal → pasa a la siguiente),
//   · las cartas de ATRÁS se traen al frente con un click,
//   · dots para saltar directo,
//   · pausa al hover/focus.
//
// HYDRATION-SAFE: cero ramas por preferencia/entorno en el render — el estado
// inicial (front=0) pinta idéntico en servidor y cliente, y las cards NO llevan
// `initial` (SSR ya las emite en su posición final).

const EASE = [0.22, 1, 0.36, 1] as const;
const INTERVALO_MS = 5000;

// Posiciones del abanico (pos 0 = frente). Las de atrás corren a la derecha y
// HACIA ARRIBA: lo que asoma es el techo de sus fotos — no el pie de la card
// (antes se filtraban pedazos de precio rotados por abajo y quedaba sucio).
// Máx 3 visibles; el resto espera invisible detrás de la última.
// EN PORCENTAJE (transform % = relativo a la propia carta): el abanico escala
// solo — misma proporción en la card de 150px del mobile y en la de 400px.
// Equivalencias a 400px: 10% ≈ 40px, -5% ≈ -20px, 19.5% ≈ 78px, -10.5% ≈ -42px.
const POSICIONES = [
  { x: "0%", y: "0%", rotate: 0, scale: 1, opacity: 1 },
  { x: "10%", y: "-5%", rotate: 4, scale: 0.94, opacity: 1 },
  { x: "19.5%", y: "-10.5%", rotate: 8, scale: 0.885, opacity: 0.95 },
];
const POS_OCULTA = { x: "19.5%", y: "-10.5%", rotate: 8, scale: 0.85, opacity: 0 };
// z-index por posición (NO se anima: el swap lo disimula el fade del vuelo).
const Z = [40, 30, 20];

export function HeroDeck({ items }: { items: DeckItem[] }) {
  // `prev` identifica la carta que acaba de dejar el frente → es la que hace
  // la animación de "repartir" (keyframes) en vez del tween directo.
  const [estado, setEstado] = useState({ front: 0, prev: -1 });
  const [pausado, setPausado] = useState(false);
  // Un swipe NO debe disparar la navegación del Link al soltar.
  const arrastrando = useRef(false);
  const n = items.length;

  useEffect(() => {
    if (pausado || n < 2) return;
    const t = setInterval(
      () => setEstado((s) => ({ front: (s.front + 1) % n, prev: s.front })),
      INTERVALO_MS,
    );
    return () => clearInterval(t);
  }, [pausado, n]);

  if (n === 0) return null;

  const avanzar = () =>
    setEstado((s) => ({ front: (s.front + 1) % n, prev: s.front }));

  return (
    <div
      onPointerEnter={() => setPausado(true)}
      onPointerLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      {/* Margen derecho: deja aire para el corrimiento del abanico. */}
      {/* Mobile: card CHICA (no domina la pantalla); desktop: tamaño pleno.
          mt-11: las cartas de atrás suben hasta 42px sobre el contenedor —
          este margen es su espacio, así no pisan el contenido de arriba. */}
      <div
        className="relative mx-auto mt-5 aspect-[7/8] w-full max-w-[260px] sm:mt-8 sm:max-w-[320px] lg:mr-14 lg:mt-11 lg:max-w-[400px]"
        style={{ perspective: 1400 }}
      >
        {items.map((item, i) => {
          const pos = (i - estado.front + n) % n;
          const destino = POSICIONES[pos] ?? POS_OCULTA;
          const alFrente = pos === 0;
          // La carta que sale del frente vuela: izquierda + fade + aterriza
          // atrás. El dip de opacidad tapa el cambio instantáneo de z-index.
          const vuela = i === estado.prev && !alFrente;

          return (
            <motion.article
              key={item.id}
              className="absolute inset-0"
              style={{ zIndex: Z[pos] ?? 10, transformOrigin: "50% 80%" }}
              animate={
                vuela
                  ? {
                      // Todo en %, misma unidad que POSICIONES (mezclar px y %
                      // entre keyframes rompe la interpolación de motion).
                      x: ["0%", "-37%", destino.x],
                      y: ["0%", "3.5%", destino.y],
                      rotate: [0, -9, destino.rotate],
                      scale: [1, 0.96, destino.scale],
                      opacity: [1, 0.25, destino.opacity],
                    }
                  : destino
              }
              transition={
                vuela
                  ? { duration: 0.85, times: [0, 0.5, 1], ease: EASE }
                  : { duration: 0.7, ease: EASE }
              }
              // SWIPE en la carta del frente: soltar con arrastre horizontal
              // pasa a la siguiente. `dragSnapToOrigin` devuelve la carta si el
              // gesto no llegó al umbral.
              drag={alFrente && n > 1 ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragStart={() => {
                arrastrando.current = true;
              }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 500) {
                  avanzar();
                }
                // El click fantasma post-drag se dispara en este mismo tick →
                // liberamos el flag recién en el próximo.
                setTimeout(() => {
                  arrastrando.current = false;
                }, 0);
              }}
            >
              <Link
                href={`/propiedad/${item.slug}`}
                tabIndex={alFrente ? 0 : -1}
                aria-hidden={alFrente ? undefined : true}
                draggable={false}
                onClick={(e) => {
                  // Swipe ≠ click: si venimos de un arrastre, no navegar.
                  if (arrastrando.current) {
                    e.preventDefault();
                    return;
                  }
                  // Carta de atrás: un click la trae al frente (no navega).
                  if (!alFrente) {
                    e.preventDefault();
                    setEstado((s) => ({ front: i, prev: s.front }));
                  }
                }}
                // Cuerpo TRANSLÚCIDO (blanco 82% — sin backdrop-blur, que ya nos
                // costó performance): deja respirar el crema y se ve liviana.
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/[0.82] shadow-[0_30px_70px_-30px_rgba(60,45,20,0.45)] transition-shadow hover:shadow-[0_34px_80px_-30px_color-mix(in_oklch,var(--brand)_50%,transparent)]"
              >
                <div className="pointer-events-none relative aspect-[4/3] shrink-0 overflow-hidden bg-muted">
                  {/* TODAS las cartas con `priority`: son 4 imágenes above-the-fold
                      y las de atrás quedaban lazy → al rotar aparecían VACÍAS
                      mientras bajaba la foto. Precargadas, el swap es instantáneo. */}
                  <PropertyImage
                    src={item.fotoUrl}
                    alt={item.fotoAlt}
                    titulo={item.titulo}
                    tipo={item.tipo}
                    sizes="(max-width: 1023px) 45vw, 400px"
                    priority
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <span className="glass absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium text-foreground sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                    {item.operacion}
                  </span>
                </div>

                {/* Cuerpo COMPACTO en mobile (la carta mide ~150px al lado del
                    título): entran título y precio; ubicación y specs desde sm.
                    En las cartas de ATRÁS el cuerpo se OCULTA: el frente es
                    translúcido y su texto/precio se transparentaba encima del
                    de adelante (dos precios superpuestos = ilegible). De atrás
                    solo asoma la foto; el cuerpo aparece al llegar al frente. */}
                <div
                  className={`pointer-events-none flex flex-1 flex-col p-2.5 transition-opacity duration-300 sm:p-4 ${
                    alFrente ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <h3 className="font-heading line-clamp-1 text-xs font-semibold leading-snug sm:text-base">
                    {item.titulo}
                  </h3>
                  {item.ubicacion && (
                    <p className="mt-1 hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      <span className="line-clamp-1">{item.ubicacion}</span>
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-1.5 sm:pt-2">
                    <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:flex">
                      {item.dormitorios != null && item.dormitorios > 0 && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="size-3.5" aria-hidden /> {item.dormitorios}
                        </span>
                      )}
                      {item.banos != null && item.banos > 0 && (
                        <span className="flex items-center gap-1">
                          <Bath className="size-3.5" aria-hidden /> {item.banos}
                        </span>
                      )}
                      {item.m2 && (
                        <span className="flex items-center gap-1">
                          <Ruler className="size-3.5" aria-hidden /> {item.m2}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-nowrap font-mono text-xs font-semibold tracking-tight sm:text-lg">
                      {item.precio}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>

      {/* Dots: saltar a una carta puntual (y feedback de cuál está al frente). */}
      {n > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2 sm:mt-5 lg:mr-14">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setEstado((s) => (s.front === i ? s : { front: i, prev: s.front }))}
              aria-label={`Ver ${item.titulo}`}
              aria-current={estado.front === i ? "true" : undefined}
              className={
                estado.front === i
                  ? "h-2 w-6 rounded-full bg-brand transition-all"
                  : "size-2 rounded-full bg-foreground/20 transition-all hover:bg-foreground/40"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
