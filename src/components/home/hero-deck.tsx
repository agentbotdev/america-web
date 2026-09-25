"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

// ARRANQUE CON PUNCH (pedido del cliente): las 2 primeras rotaciones salen casi
// enseguida para que, apenas entrás, el deck se muestre vivo y se entienda que
// las cartas se pueden pasar. Después baja al ritmo de lectura normal — a 900ms
// permanentes no daría tiempo de leer ni el título.
const MS_ARRANQUE = 900;
const MS_CRUCERO = 5000;
const ROTACIONES_RAPIDAS = 2;

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
  // Punto donde empezó el gesto. Va acá arriba con el resto de los hooks: más
  // abajo hay un `return` temprano y declararlo después haría que el hook se
  // llame de forma condicional.
  const inicioX = useRef(0);
  const n = items.length;

  // Cuántas veces rotó sola. Sirve para acelerar el arranque y después soltar.
  const [rotaciones, setRotaciones] = useState(0);

  // setTimeout y no setInterval: el intervalo CAMBIA (900ms las dos primeras,
  // 5s el resto), y un setInterval quedaría clavado en el valor del primer
  // render. Al depender de `rotaciones`, el effect se reprograma cada vuelta.
  useEffect(() => {
    if (pausado || n < 2) return;
    const ms = rotaciones < ROTACIONES_RAPIDAS ? MS_ARRANQUE : MS_CRUCERO;
    const t = setTimeout(() => {
      setEstado((s) => ({ front: (s.front + 1) % n, prev: s.front }));
      setRotaciones((r) => r + 1);
    }, ms);
    return () => clearTimeout(t);
  }, [pausado, n, rotaciones]);

  if (n === 0) return null;

  const avanzar = () =>
    setEstado((s) => ({ front: (s.front + 1) % n, prev: s.front }));

  // SWIPE con Pointer Events nativos (antes lo hacía el `drag` de motion).
  // Sólo interesa el punto de inicio y el de fin: si el dedo recorrió más de
  // 50px en horizontal, se pasa de carta. No hace falta seguir el dedo en vivo
  // —ni mover la carta mientras arrastra— y por eso no hay un listener de
  // pointermove disparando en cada píxel del gesto, que era parte del costo.
  const onPointerDown = (e: React.PointerEvent) => {
    inicioX.current = e.clientX;
    arrastrando.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - inicioX.current;
    if (Math.abs(dx) > 50) {
      // Marca que hubo arrastre para que el <Link> no navegue al soltar.
      arrastrando.current = true;
      avanzar();
      // El click fantasma llega en este mismo tick: se libera en el próximo.
      setTimeout(() => {
        arrastrando.current = false;
      }, 0);
    }
  };

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
            <article
              key={item.id}
              // ANIMACIÓN EN CSS PURO, sin motion. El cliente reportó el deck
              // "re laggeado": eran 4 elementos animándose por JS, cada uno
              // recalculando su transform en cada frame desde el hilo principal
              // — que además compite con la hidratación de la home.
              // Una transición CSS de transform+opacity la corre el COMPOSITOR,
              // fuera del hilo principal: aunque el JS esté ocupado, el deck se
              // mueve fluido. Es la misma animación, sin el costo.
              // La carta que sale del frente usa una animación con keyframes
              // (`animate-deck-vuela`, en globals.css) para el arco de reparto.
              className={`absolute inset-0 ${vuela ? "animate-deck-vuela" : ""}`}
              style={{
                zIndex: Z[pos] ?? 10,
                transformOrigin: "50% 80%",
                transform: `translate(${destino.x}, ${destino.y}) rotate(${destino.rotate}deg) scale(${destino.scale})`,
                opacity: destino.opacity,
                transition: vuela
                  ? "none"
                  : "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s cubic-bezier(0.22,1,0.36,1)",
                // Sólo las 3 cartas visibles piden capa propia. Marcar las 4 (o
                // las que haya) dejaría capas de GPU vivas de gusto.
                willChange: pos < 3 ? "transform, opacity" : undefined,
              }}
              // SWIPE con Pointer Events nativos, sin la capa de drag de motion.
              onPointerDown={alFrente && n > 1 ? onPointerDown : undefined}
              onPointerUp={alFrente && n > 1 ? onPointerUp : undefined}
              onPointerCancel={alFrente && n > 1 ? onPointerUp : undefined}
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
                // BLANCO SÓLIDO a propósito — decisión explícita del cliente:
                // el resto del sitio es cristal, pero estas cartas NO.
                // Y tiene lógica: son las únicas que se apilan UNA SOBRE OTRA.
                // Translúcidas, el precio y el título de la carta de atrás se
                // transparentaban a través de la de adelante (dos precios
                // superpuestos = ilegible). El blanco corta eso de raíz y además
                // hace que el deck resalte como el foco del hero.
                // NO usa `.card-premium`: esa clase ahora lleva blur y velo.
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[rgba(60,50,25,0.12)] bg-white shadow-[0_24px_56px_-32px_rgba(60,45,20,0.4)] transition-shadow hover:shadow-[0_28px_64px_-32px_rgba(60,45,20,0.5)]"
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
                  <span className="glass absolute left-2 top-2 rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
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
                    <p className="whitespace-nowrap text-xs font-semibold tabular-nums tracking-tight sm:text-lg">
                      {item.precio}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
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
