"use client";

import { useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { Search, ShieldCheck, ChevronDown } from "lucide-react";
import { AGENCIA } from "@/data/agencia";

// HERO "EL BUSCADOR ES EL CARTEL" (concepto A + C, decidido con Nacho el 08/10).
//
// Arriba de todo hay una foto de un cartel de América Cardozo clavado frente a una
// casa, con el logo arriba y el cuerpo VACÍO: el buscador va impreso ahí, en HTML real.
// Al scrollear, el hero queda fijo (estilo Apple) y pasa esto:
//   1. el título y el buscador se desvanecen y la cámara se acerca al logo del cartel;
//   2. el logo se FUNDE con la placa del llavero, que tiene el mismo logo en el mismo
//      lugar y del mismo tamaño (un "match cut" de cine);
//   3. corre el video: la llave entra en la cerradura, la puerta se abre y se entra al
//      living.
// (La "C" —el llavero que cae como un pin en el mapa de abajo— espera al mapa, W2 de
// la reunión del 06/10.)
//
// Por qué la transformación NO la hace el video: se le pidió a Veo que el cartel se
// convirtiera en el llavero en la misma toma y en las dos versiones salió mal (en la
// horizontal le escribió un segundo "VENDE" al cartel; en la vertical la transición
// quedó rara). Hacerla con un fundido controlado por el scroll sale perfecta siempre.

/**
 * Lo que hace falta saber de cada encuadre para calzar el HTML encima de la imagen.
 * Todas las medidas son fracciones de la imagen (0 a 1), medidas sobre los archivos
 * generados en Flow el 08/10.
 */
interface Encuadre {
  ancho: number;
  alto: number;
  cartel: string;
  /** Primer cuadro del video: lo que se ve mientras el video todavía no cargó. */
  llavero: string;
  video: string;
  /** Borde de arriba del cartel: el título va por encima. */
  techo: number;
  /** El cuerpo vacío del cartel, donde va el buscador. */
  cuerpo: { x: number; y: number; w: number; h: number };
  /**
   * Centro y tamaño del logo (de "AMERICA" a "VENDE"). Es la referencia del fundido: en
   * el cartel y en el primer cuadro del video tienen que coincidir.
   */
  logoCartel: { cx: number; cy: number; w: number; h: number };
  logoVideo: { cx: number; cy: number; w: number; h: number };
}

const HORIZONTAL: Encuadre = {
  ancho: 2752,
  alto: 1536,
  cartel: "/hero/cartel-horizontal.webp",
  llavero: "/hero/llavero-horizontal.webp",
  video: "/hero/llave-horizontal.mp4",
  techo: 0.361,
  cuerpo: { x: 0.301, y: 0.575, w: 0.4, h: 0.251 },
  logoCartel: { cx: 0.5007, cy: 0.4684, w: 0.1672, h: 0.1751 },
  logoVideo: { cx: 0.4982, cy: 0.5202, w: 0.2362, h: 0.2695 },
};

const VERTICAL: Encuadre = {
  ancho: 1536,
  alto: 2752,
  cartel: "/hero/cartel-vertical.webp",
  llavero: "/hero/llavero-vertical.webp",
  video: "/hero/llave-vertical.mp4",
  techo: 0.334,
  cuerpo: { x: 0.09, y: 0.525, w: 0.83, h: 0.318 },
  logoCartel: { cx: 0.5033, cy: 0.4386, w: 0.3815, h: 0.1417 },
  logoVideo: { cx: 0.4974, cy: 0.5117, w: 0.4401, h: 0.1554 },
};

// Pantallas más angostas que 4:5 usan el encuadre vertical. Con el horizontal el cartel
// ocupa el 40% del ancho de la imagen y en una pantalla así queda recortado. La MISMA
// consulta elige la foto (<source media>), el video (JS) y las medidas (CSS): si no
// coincidieran, el buscador quedaría corrido del cartel.
const MEDIA_VERTICAL = "(max-aspect-ratio: 4/5)";

// Qué parte del recorrido ocupa cada tramo (0 = el hero recién se fija, 1 = se suelta).
const FASES = {
  textos: [0.01, 0.1],
  zoom: [0, 0.3],
  fundido: [0.2, 0.3],
  video: [0.3, 0.94],
} as const;
// Qué fracción de la distancia al punto pedido se recorre en cada repintado.
const SUAVIZADO = 0.2;

const tramo = (p: number, [desde, hasta]: readonly [number, number]) =>
  Math.min(1, Math.max(0, (p - desde) / (hasta - desde)));
const suave = (t: number) => t * t * (3 - 2 * t);

const OPERACIONES = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "all", label: "Todas" },
] as const;

function SelectPanel({
  name, aria, placeholder, opciones,
}: {
  name: string;
  aria: string;
  placeholder: string;
  opciones: string[];
}) {
  // Select NATIVO estilizado: cero JS, funciona igual en iOS/Android, y el
  // form lo serializa solo. El chevron propio tapa la flecha del sistema.
  return (
    <label className="relative block">
      <span className="sr-only">{aria}</span>
      <select
        name={name}
        defaultValue=""
        aria-label={aria}
        className="h-11 w-full appearance-none rounded-md border border-foreground/15 bg-white pl-3.5 pr-9 text-sm text-foreground outline-none transition focus:border-brand"
      >
        <option value="">{placeholder}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </label>
  );
}

/** Las medidas de los dos encuadres como variables de CSS (globals.css elige cuál usar). */
function variablesEncuadre(): React.CSSProperties {
  const vars: Record<string, number> = {};
  for (const [prefijo, e] of [["h", HORIZONTAL], ["v", VERTICAL]] as const) {
    vars[`--${prefijo}-ar`] = e.ancho / e.alto;
    vars[`--${prefijo}-techo`] = e.techo;
    vars[`--${prefijo}-cuerpo-x`] = e.cuerpo.x;
    vars[`--${prefijo}-cuerpo-y`] = e.cuerpo.y;
    vars[`--${prefijo}-cuerpo-w`] = e.cuerpo.w;
    vars[`--${prefijo}-cuerpo-h`] = e.cuerpo.h;
  }
  return vars as React.CSSProperties;
}

export function Hero({ tipos = [], ciudades = [] }: { tipos?: string[]; ciudades?: string[] }) {
  const a = AGENCIA;
  const [operacion, setOperacion] = useState<string>("venta");
  const seccionRef = useRef<HTMLElement>(null);
  const fijoRef = useRef<HTMLDivElement>(null);
  const recorridoRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);
  const capaVideoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tituloRef = useRef<HTMLDivElement>(null);
  const buscadorRef = useRef<HTMLDivElement>(null);

  // Foto distinta según la pantalla ("art direction"): el navegador baja UNA sola.
  const comun = { alt: "", sizes: "100vw", quality: 80 };
  const {
    props: { srcSet: srcSetVertical },
  } = getImageProps({ ...comun, src: VERTICAL.cartel, width: VERTICAL.ancho, height: VERTICAL.alto });
  const { props: imgHorizontal } = getImageProps({
    ...comun,
    src: HORIZONTAL.cartel,
    width: HORIZONTAL.ancho,
    height: HORIZONTAL.alto,
    // Es lo primero que se pinta (LCP). `preload` no sirve con dos fotos: haría bajar las dos.
    fetchPriority: "high",
    loading: "eager",
  });

  // TODO LO QUE PASA AL SCROLLEAR sale de un único número, el progreso del recorrido
  // (0 a 1). Se aplica escribiendo estilos directo en el DOM, sin pasar por React:
  // son 60 cambios por segundo.
  //
  // - El video se carga desde acá y no con atributos en el HTML: así se baja UNO solo
  //   (el del encuadre de esta pantalla) y nada para quien activó el ahorro de datos.
  // - `prefers-reduced-motion` NO se usa como corte a propósito: en Windows lo prende
  //   el ajuste de rendimiento "mostrar animaciones" (apagado), no solo una elección de
  //   accesibilidad. Medido el 06/10: con ese corte el video no se veía nunca.
  // - Los videos están codificados con un cuadro clave cada 4 cuadros: saltar a
  //   cualquier momento es instantáneo. Con la codificación normal (1 cuadro clave en
  //   8 s, medido) cada salto decodificaba desde el principio y se trababa.
  useEffect(() => {
    const seccion = seccionRef.current;
    const fijo = fijoRef.current;
    const recorridoEl = recorridoRef.current;
    const lienzo = lienzoRef.current;
    const capaVideo = capaVideoRef.current;
    const video = videoRef.current;
    const titulo = tituloRef.current;
    const buscador = buscadorRef.current;
    if (!seccion || !fijo || !recorridoEl || !lienzo || !capaVideo || !video || !titulo || !buscador) return;

    const consulta = window.matchMedia(MEDIA_VERTICAL);
    let encuadre = consulta.matches ? VERTICAL : HORIZONTAL;
    let objetivo = 0;
    let mostrado = 0;
    let cuadro = 0;
    let alturaHeader = 0;

    const aplicar = (p: number) => {
      // 1. Título y buscador se van apenas se empieza a bajar.
      const visibles = 1 - suave(tramo(p, FASES.textos));
      titulo.style.opacity = String(visibles);
      buscador.style.opacity = String(visibles);
      // Invisible y todavía enfocable con Tab sería una trampa: se apaga del todo.
      buscador.inert = visibles < 0.05;

      // 2. La cámara se acerca al logo del cartel hasta dejarlo del tamaño y en el lugar
      //    del logo del llavero. El video viaja pegado al cartel con la transformación
      //    inversa: así los dos logos coinciden durante TODO el fundido, no solo al final.
      const { logoCartel: c, logoVideo: k } = encuadre;
      // La IA no dibujó el logo con las mismas proporciones en el cartel y en el llavero:
      // en el horizontal el del llavero es un 9% más alto, en el vertical un 5% más bajo. Con
      // una escala pareja los dos logos quedaban corridos y se leían dos veces. Por eso el
      // acercamiento es parejo (por el ancho) y, SOLO durante el fundido, el cartel se
      // estira de a poco en alto hasta igualar al llavero: cuando termina de estirarse ya
      // es invisible, y mientras tanto se lee como que el cartel se transforma.
      const anchoFinal = k.w / c.w;
      const altoFinal = k.h / c.h;
      const q = suave(tramo(p, FASES.zoom));
      const f = suave(tramo(p, FASES.fundido));
      const ex = 1 + (anchoFinal - 1) * q;
      const ey = ex * (1 + (altoFinal / anchoFinal - 1) * f);
      const cx = c.cx + (k.cx - c.cx) * q;
      const cy = c.cy + (k.cy - c.cy) * q;
      lienzo.style.transform =
        `translate(${(cx - ex * c.cx) * 100}%, ${(cy - ey * c.cy) * 100}%) scale(${ex}, ${ey})`;
      // El video, con la transformación que deja SU logo exactamente sobre el del cartel.
      const vx = (ex * c.w) / k.w;
      const vy = (ey * c.h) / k.h;
      capaVideo.style.transform =
        `translate(${(cx - vx * k.cx) * 100}%, ${(cy - vy * k.cy) * 100}%) scale(${vx}, ${vy})`;
      capaVideo.style.opacity = String(f);
    };

    const ahorroDeDatos = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // Sin video (ahorro de datos, o el archivo no cargó) no hay nada que contar al
    // scrollear: se saca el recorrido y queda el cartel quieto con el buscador.
    const sinVideo = () => {
      recorridoEl.style.height = "0px";
      objetivo = mostrado = 0;
      aplicar(0);
    };
    if (ahorroDeDatos) {
      sinVideo();
      return;
    }

    const cargarVideo = () => {
      recorridoEl.style.height = "";
      video.poster = encuadre.llavero;
      video.src = encuadre.video;
      video.muted = true;
      video.preload = "auto";
      video.load();
      // iOS no baja los datos de un video solo con `preload`: hace falta darle play
      // (permitido sin tocar la pantalla porque está mudo) y pausarlo enseguida.
      video.play().then(() => video.pause()).catch(() => {});
    };

    const medir = () => {
      alturaHeader = document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
      seccion.style.setProperty("--hero-header", `${alturaHeader}px`);
    };

    const leerScroll = () => {
      const recorrido = recorridoEl.offsetHeight;
      if (recorrido <= 0) {
        objetivo = 0;
        return;
      }
      const avance = alturaHeader - seccion.getBoundingClientRect().top;
      objetivo = Math.min(1, Math.max(0, avance / recorrido));
    };

    // Cada cuadro de pantalla se acerca un poco al punto que pide el scroll: así todo
    // se desliza en vez de saltar cuando la rueda del mouse va de a pasos.
    const animar = () => {
      cuadro = 0;
      mostrado += (objetivo - mostrado) * SUAVIZADO;
      if (Math.abs(objetivo - mostrado) < 0.0005) mostrado = objetivo;
      aplicar(mostrado);

      let videoAtrasado = false;
      const duracion = video.duration;
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA && Number.isFinite(duracion) && duracion > 0) {
        const momento = tramo(mostrado, FASES.video) * (duracion - 0.05);
        // Mientras el navegador está buscando un cuadro no se le pide otro: se
        // amontonarían los saltos y el video quedaría atrasado respecto del scroll.
        if (!video.seeking && Math.abs(video.currentTime - momento) > 0.001) {
          if (!video.paused) video.pause();
          video.currentTime = momento;
        }
        videoAtrasado = Math.abs(video.currentTime - momento) > 0.001;
      }
      if (mostrado !== objetivo || videoAtrasado) cuadro = requestAnimationFrame(animar);
    };

    const alScrollear = () => {
      leerScroll();
      if (!cuadro) cuadro = requestAnimationFrame(animar);
    };
    const alCambiarTamano = () => {
      medir();
      alScrollear();
    };
    // Girar el celular o achicar la ventana puede cambiar de encuadre: otro video.
    const alCambiarEncuadre = () => {
      encuadre = consulta.matches ? VERTICAL : HORIZONTAL;
      cargarVideo();
      alCambiarTamano();
    };

    video.addEventListener("error", sinVideo);
    video.addEventListener("loadedmetadata", alScrollear);
    consulta.addEventListener("change", alCambiarEncuadre);
    const observador = new ResizeObserver(alCambiarTamano);
    observador.observe(fijo);
    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alCambiarTamano);
    cargarVideo();
    alCambiarTamano();
    return () => {
      observador.disconnect();
      video.removeEventListener("error", sinVideo);
      video.removeEventListener("loadedmetadata", alScrollear);
      consulta.removeEventListener("change", alCambiarEncuadre);
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alCambiarTamano);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    // Sin `overflow-hidden` acá: un ancestro con overflow distinto de visible
    // rompe el `sticky` del hero. El recorte va en el bloque fijo.
    <section ref={seccionRef} className="relative">
      <div
        ref={fijoRef}
        className="hero-fijo sticky overflow-hidden bg-[#a8916b]"
        // El fondo es el color promedio de las fotos del cartel: es lo que se ve hasta que
        // la foto carga, y con un fondo oscuro el cambio a la foto (muy luminosa) se notaba.
        style={{
          top: "var(--hero-header, 0px)",
          // `lvh` y no `svh`: en el celular, cuando la barra del navegador se esconde al
          // scrollear, con `svh` quedaba una franja vacía abajo del hero. Con `lvh` lo que
          // queda tapado al principio es el pie del cartel (pasto y postes), no el buscador.
          height: "calc(100lvh - var(--hero-header, 0px))",
        }}
      >
        <div className="hero-capas" style={variablesEncuadre()}>
          <div className="hero-escena">
            {/* CARTEL + BUSCADOR: se mueven juntos (el buscador está "impreso" en el cartel). */}
            <div ref={lienzoRef} className="absolute inset-0 origin-top-left will-change-transform">
              <picture>
                <source media={MEDIA_VERTICAL} srcSet={srcSetVertical} sizes="100vw" />
                {/* <img> a mano y no next/image: next/image no maneja <picture> (dos fotos
                    según la pantalla). getImageProps arma igual el srcset optimizado. */}
                <img {...imgHorizontal} alt="" className="absolute inset-0 size-full object-cover" />
              </picture>

              <div ref={buscadorRef} className="hero-cuerpo">
                <form
                  action="/propiedades"
                  method="get"
                  className="hero-in hero-buscador flex size-full flex-col justify-center gap-2 p-[4%] text-left"
                  style={{ "--i": 2 } as React.CSSProperties}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-800">
                    Encontrá tu propiedad
                  </p>
                  <div role="tablist" aria-label="Tipo de operación" className="flex flex-wrap gap-1.5">
                    {OPERACIONES.map((op) => {
                      const activa = operacion === op.value;
                      return (
                        <button
                          key={op.value}
                          type="button"
                          role="tab"
                          aria-selected={activa}
                          onClick={() => setOperacion(op.value)}
                          className={
                            "h-9 rounded-md border px-4 text-sm font-semibold transition " +
                            (activa
                              ? "border-brand bg-brand text-brand-foreground"
                              : "border-foreground/15 bg-white/85 text-muted-foreground hover:border-brand/50 hover:text-foreground")
                          }
                        >
                          {op.label}
                        </button>
                      );
                    })}
                  </div>
                  {operacion !== "all" && <input type="hidden" name="operacion" value={operacion} />}

                  <div className="grid grid-cols-2 gap-2 @md:grid-cols-[1fr_1fr_auto]">
                    {/* "Inmueble" y no "Tipo de propiedad": en el celular el select mide media
                        tarjeta y el texto largo quedaba cortado ("Tipo de propie"). */}
                    <SelectPanel name="tipo" aria="Tipo de inmueble" placeholder="Inmueble" opciones={tipos} />
                    {/* La ubicación viaja como `q`: el catálogo interpreta la frase y
                        matchea barrio/ciudad — mismo camino que el buscador libre. */}
                    <SelectPanel name="q" aria="Ubicación" placeholder="Ubicación" opciones={ciudades} />
                    <button
                      type="submit"
                      className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-7 text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-110 active:scale-[0.98] @md:col-span-1"
                    >
                      <Search className="size-4" aria-hidden />
                      Buscar
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* VIDEO: invisible hasta el fundido. Su primer cuadro es el llavero. */}
            <div ref={capaVideoRef} className="absolute inset-0 origin-top-left opacity-0 will-change-transform">
              <video
                ref={videoRef}
                muted
                playsInline
                preload="none"
                disablePictureInPicture
                aria-hidden
                tabIndex={-1}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </div>

          {/* TÍTULO: en la franja de arriba del cartel (casa y cielo), con un velo oscuro
              para que se lea. Se va junto con el buscador. */}
          <div ref={tituloRef} className="hero-titulo pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-transparent" />
            <div className="relative flex h-full flex-col items-center justify-end px-4 pb-[3cqh] text-center">
              <span
                className="hero-in inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85"
                style={{ "--i": 0 } as React.CSSProperties}
              >
                <ShieldCheck className="size-3.5 text-accent-warm" />
                <span className="text-white">+{a.anios_experiencia} años</span>
                <span aria-hidden className="text-accent-warm">·</span>
                Operamos en todo el país
              </span>
              <h1
                className="hero-in mt-3 text-balance text-[min(3.75rem,7cqh,9cqw)] font-semibold leading-[1.06] text-white"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                Tu próxima propiedad
                <br />
                te está esperando
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* RECORRIDO: mientras se scrollea este espacio vacío el hero queda fijo arriba y
          pasa todo lo de arriba. Más largo que una pantalla para que el video no corra. */}
      <div ref={recorridoRef} aria-hidden className="h-[160svh]" />
    </section>
  );
}
