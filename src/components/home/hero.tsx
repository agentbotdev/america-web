"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getImageProps } from "next/image";
import { Search, ShieldCheck, ChevronDown } from "lucide-react";
import { AGENCIA } from "@/data/agencia";

// HERO "EL BUSCADOR ES EL CARTEL" (concepto decidido con Nacho el 08/10).
//
// Arriba de todo hay una foto de un cartel de América Cardozo clavado frente a una
// casa, con el logo arriba y el cuerpo VACÍO: el buscador va impreso ahí, en HTML real.
// Al scrollear, el hero queda fijo (estilo Apple) y corre UN video que arranca en esa
// misma foto: el cartel se desclava, se achica hasta ser un llavero, la llave abre la
// puerta y la cámara entra a un living de piso blanco. Abajo, ese piso se funde con el
// fondo de la página, que sigue en blanco.
//
// El video se generó en Flow (Omni, 4 s) con la foto del cartel como PRIMER cuadro y el
// living como ÚLTIMO, así que el paso de la foto al video no se nota: el primer cuadro
// del video ES la foto (comprobado pegando mitad y mitad, 08/10). Reemplaza al "match
// cut" anterior (zoom al logo del cartel + fundido con el logo de un llavero).

/**
 * Lo que hace falta saber de cada encuadre para calzar el HTML encima de la foto.
 * Las medidas son fracciones de la foto (0 a 1), medidas sobre los archivos generados
 * en Flow el 08/10.
 */
interface Encuadre {
  ancho: number;
  alto: number;
  cartel: string;
  video: string;
  /** Borde de arriba del cartel: el título va por encima. */
  techo: number;
  /** El cuerpo vacío del cartel, donde va el buscador. */
  cuerpo: { x: number; y: number; w: number; h: number };
}

const HORIZONTAL: Encuadre = {
  ancho: 2752,
  alto: 1536,
  cartel: "/hero/cartel-horizontal.webp",
  video: "/hero/recorrido-horizontal.mp4",
  techo: 0.361,
  cuerpo: { x: 0.301, y: 0.575, w: 0.4, h: 0.251 },
};

const VERTICAL: Encuadre = {
  ancho: 1536,
  alto: 2752,
  cartel: "/hero/cartel-vertical.webp",
  video: "/hero/recorrido-vertical.mp4",
  techo: 0.334,
  cuerpo: { x: 0.09, y: 0.525, w: 0.83, h: 0.318 },
};

// Pantallas más angostas que 4:5 usan el encuadre vertical. Con el horizontal el cartel
// ocupa el 40% del ancho de la imagen y en una pantalla así queda recortado. La MISMA
// consulta elige la foto (<source media>), el video (JS) y las medidas (CSS): si no
// coincidieran, el buscador quedaría corrido del cartel.
const MEDIA_VERTICAL = "(max-aspect-ratio: 4/5)";

// Qué parte del recorrido ocupa cada tramo (0 = el hero recién se fija, 1 = se suelta).
const FASES = {
  /** Título y buscador se desvanecen. */
  textos: [0.01, 0.1],
  /** La foto le pasa la posta al video (muestran lo mismo: el cambio no se ve). */
  cruce: [0.01, 0.05],
  /** El video corre de punta a punta. */
  video: [0.03, 0.92],
  /** El piso del living se funde con el fondo de la página. */
  blanco: [0.7, 0.92],
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
  const router = useRouter();
  const [operacion, setOperacion] = useState<string>("venta");
  const seccionRef = useRef<HTMLElement>(null);
  const fijoRef = useRef<HTMLDivElement>(null);
  const recorridoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tituloRef = useRef<HTMLDivElement>(null);
  const buscadorRef = useRef<HTMLDivElement>(null);
  const blancoRef = useRef<HTMLDivElement>(null);

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

  // Los selects sin elegir NO viajan: con `tipo=` vacío el catálogo filtraba por "tipo
  // igual a nada" y el buscador del cartel devolvía cero propiedades (Nacho, 08/10:
  // "hay que hacer funcional la card"). El form igual tiene action/method: sin JS, anda.
  const buscar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [clave, valor] of new FormData(e.currentTarget)) {
      if (typeof valor === "string" && valor.trim()) params.set(clave, valor.trim());
    }
    const consulta = params.toString();
    router.push(consulta ? `/propiedades?${consulta}` : "/propiedades");
  };

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
    const video = videoRef.current;
    const titulo = tituloRef.current;
    const buscador = buscadorRef.current;
    const blanco = blancoRef.current;
    if (!seccion || !fijo || !recorridoEl || !video || !titulo || !buscador || !blanco) return;

    const consulta = window.matchMedia(MEDIA_VERTICAL);
    let encuadre = consulta.matches ? VERTICAL : HORIZONTAL;
    let objetivo = 0;
    let mostrado = 0;
    let cuadro = 0;
    // ¿El video ya tiene su primer cuadro? Una vez que sí, queda en true aunque después
    // `readyState` baje: baja a 1 CADA VEZ que se salta a otro momento (o sea, en cada
    // scroll), y mirarlo en cada repintado apagaba el video unos milisegundos y dejaba ver
    // la foto del cartel de abajo (Nacho, 09/10: "el cartel titila y reaparece"; medido:
    // 19 apagones en un scroll de prueba). Solo vuelve a false al cargar otro video.
    let primerCuadro = false;

    const aplicar = (p: number) => {
      // Título y buscador se van apenas se empieza a bajar.
      const visibles = 1 - suave(tramo(p, FASES.textos));
      titulo.style.opacity = String(visibles);
      buscador.style.opacity = String(visibles);
      // Invisible y todavía enfocable con Tab sería una trampa: se apaga del todo.
      buscador.inert = visibles < 0.05;
      // El video tapa la foto recién cuando tiene su primer cuadro: si el scroll llega
      // antes, se sigue viendo la foto (que es ese mismo cuadro) y no un hueco.
      video.style.opacity = primerCuadro ? String(tramo(p, FASES.cruce)) : "0";
      blanco.style.opacity = String(suave(tramo(p, FASES.blanco)));
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
      primerCuadro = false;
      video.style.opacity = "0";
      video.src = encuadre.video;
      video.muted = true;
      video.preload = "auto";
      video.load();
      // iOS no baja los datos de un video solo con `preload`: hace falta darle play
      // (permitido sin tocar la pantalla porque está mudo) y pausarlo enseguida.
      video.play().then(() => video.pause()).catch(() => {});
    };

    const medir = () => {
      const alturaHeader = document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
      seccion.style.setProperty("--hero-header", `${alturaHeader}px`);
    };

    const leerScroll = () => {
      const recorrido = recorridoEl.offsetHeight;
      if (recorrido <= 0) {
        objetivo = 0;
        return;
      }
      // El hero se fija en el borde de arriba (el header va encima, transparente).
      const avance = -seccion.getBoundingClientRect().top;
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
    // Recién con el primer cuadro el video puede tapar la foto (ver `aplicar`).
    const alTenerPrimerCuadro = () => {
      primerCuadro = true;
      alScrollear();
    };
    video.addEventListener("loadeddata", alTenerPrimerCuadro);
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
      video.removeEventListener("loadeddata", alTenerPrimerCuadro);
      consulta.removeEventListener("change", alCambiarEncuadre);
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alCambiarTamano);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    // Sin `overflow-hidden` acá: un ancestro con overflow distinto de visible
    // rompe el `sticky` del hero. El recorte va en el bloque fijo.
    // `data-hero`: el header lo mira para saber cuándo dejar de ser transparente.
    <section ref={seccionRef} data-hero className="relative">
      <div
        ref={fijoRef}
        className="hero-fijo sticky overflow-hidden bg-[#a8916b]"
        // El fondo es el color promedio de las fotos del cartel: es lo que se ve hasta que
        // la foto carga, y con un fondo oscuro el cambio a la foto (muy luminosa) se notaba.
        style={{
          top: 0,
          // Pantalla completa, de borde a borde: el header va ENCIMA, transparente (la
          // "barra blanca" que había arriba del hero se sacó a pedido de Nacho, 08/10).
          // `lvh` y no `svh`: en el celular, cuando la barra del navegador se esconde al
          // scrollear, con `svh` quedaba una franja vacía abajo del hero. Con `lvh` lo que
          // queda tapado al principio es el pie del cartel (pasto y postes), no el buscador.
          height: "100lvh",
        }}
      >
        <div className="hero-capas" style={variablesEncuadre()}>
          <div className="hero-escena">
            <picture>
              <source media={MEDIA_VERTICAL} srcSet={srcSetVertical} sizes="100vw" />
              {/* <img> a mano y no next/image: next/image no maneja <picture> (dos fotos
                  según la pantalla). getImageProps arma igual el srcset optimizado. */}
              <img {...imgHorizontal} alt="" className="absolute inset-0 size-full object-cover" />
            </picture>

            {/* VIDEO: arranca invisible y aparece sobre la foto, que es su primer cuadro. */}
            <video
              ref={videoRef}
              muted
              playsInline
              preload="none"
              disablePictureInPicture
              aria-hidden
              tabIndex={-1}
              className="absolute inset-0 size-full object-cover opacity-0 will-change-[opacity]"
            />

            {/* BUSCADOR "impreso" en el cuerpo del cartel, por encima del video. */}
            <div ref={buscadorRef} className="hero-cuerpo">
              <form
                action="/propiedades"
                method="get"
                onSubmit={buscar}
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

          {/* PISO BLANCO: al final del video, la parte de abajo se funde con el fondo de la
              página, que sigue debajo del hero. */}
          <div
            ref={blancoRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-background from-[12%] via-background/70 to-transparent opacity-0"
          />

          {/* Velo fijo arriba: el menú (blanco, transparente) se lee sobre la foto y sobre
              el video en todo el recorrido. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--hero-header,64px)+4rem)] bg-gradient-to-b from-black/45 to-transparent" />

          {/* TÍTULO: en la franja de arriba del cartel (casa y cielo), con un velo oscuro
              para que se lea. Se va junto con el buscador. Deja libre el alto del header. */}
          <div ref={tituloRef} className="hero-titulo pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-transparent" />
            <div className="relative flex h-full flex-col items-center justify-end px-4 pb-[2cqh] pt-[var(--hero-header,64px)] text-center">
              <span
                className="hero-in hero-ojo inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 [text-shadow:0_1px_8px_rgb(0_0_0/0.7)]"
                style={{ "--i": 0 } as React.CSSProperties}
              >
                <ShieldCheck className="size-3.5 text-accent-warm" />
                <span className="text-white">+{a.anios_experiencia} años</span>
                <span aria-hidden className="text-accent-warm">·</span>
                Operamos en todo el país
              </span>
              {/* En mayúsculas y con mucha sombra (Nacho, 08/10): dos sombras, una corta
                  que marca el borde de la letra y una larga y difusa que la despega del
                  cielo, que es claro. */}
              <h1
                className="hero-in mt-3 text-balance text-[min(3.5rem,6cqh,7.4cqw)] font-bold uppercase leading-[1.04] tracking-[0.01em] text-white [text-shadow:0_2px_3px_rgb(0_0_0/0.55),0_6px_28px_rgb(0_0_0/0.65)]"
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
          corre el video. Lo que tarda la animación lo define ESTE alto, no lo que dura el
          video (el video avanza con el scroll): para hacerla más ágil, se achica acá. */}
      <div ref={recorridoRef} aria-hidden className="h-[90svh]" />
    </section>
  );
}
