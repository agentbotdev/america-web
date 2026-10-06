"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, ShieldCheck, ArrowRight, MapPin, Award, Handshake, ChevronDown,
} from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

// VERSIÓN 2 — iteración según las webs de REFERENCIA que eligió la
// inmobiliaria (matiasszpira.com.ar, marascoquirogaprop.com.ar):
// hero con video de fondo + un BUSCADOR PANEL protagonista al estilo portal clásico:
// tabs de operación (Venta / Alquiler), select de tipo, select de ubicación
// y botón grande BUSCAR. Los selects se alimentan del stock real (props).

const TRUST = [
  { icon: Award, value: `+${AGENCIA.anios_experiencia} años`, label: "de experiencia" },
  { icon: MapPin, value: "Todo el país", label: "operamos en toda Argentina" },
  { icon: Handshake, value: "Asesoría real", label: "te acompañamos de punta a punta" },
];

// El video llega al final cuando se bajó la MITAD del alto del hero: así la
// puerta abierta se ve con medio hero todavía en pantalla (con 0,7 se probó y el
// final quedaba en una franja finita arriba), y no se agrega scroll extra antes de
// las propiedades (pedido explícito de la iteración anterior).
const RECORRIDO_DEL_VIDEO = 0.5;
// Qué fracción de la distancia al cuadro pedido se recorre en cada repintado.
const SUAVIZADO = 0.2;

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
        className="h-12 w-full appearance-none rounded-md border border-foreground/15 bg-white pl-3.5 pr-9 text-sm text-foreground outline-none transition focus:border-brand"
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

export function Hero({ tipos = [], ciudades = [] }: { tipos?: string[]; ciudades?: string[] }) {
  const a = AGENCIA;
  const [operacion, setOperacion] = useState<string>("venta");
  const seccionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoListo, setVideoListo] = useState(false);

  // VIDEO MANEJADO POR EL SCROLL: no se reproduce solo, avanza a medida que se
  // baja y retrocede al subir. Arranca quieto en el primer cuadro (la puerta
  // cerrada) y termina en la puerta abierta.
  //
  // - Se carga desde acá y no con atributos en el HTML: React no escribe `muted`
  //   como atributo en el HTML del servidor, y así tampoco se descarga para quien
  //   activó el ahorro de datos (se queda con la foto, que es el primer cuadro).
  // - `prefers-reduced-motion` NO se usa como corte a propósito: en Windows lo
  //   prende el ajuste de rendimiento "mostrar animaciones" (apagado), no solo una
  //   elección de accesibilidad. Medido el 06/10 en una PC con Windows: estaba en
  //   `reduce`, y con ese corte el video no se veía nunca.
  // - El archivo está codificado con un cuadro clave cada pocos cuadros: saltar a
  //   cualquier momento es instantáneo. Con la codificación normal (1 cuadro clave
  //   en 8 s, medido) cada salto decodificaba desde el principio y se trababa.
  useEffect(() => {
    const video = videoRef.current;
    const seccion = seccionRef.current;
    if (!video || !seccion) return;
    const ahorroDeDatos = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (ahorroDeDatos) return;

    video.muted = true;
    video.preload = "auto";
    video.load();
    // iOS no baja los datos de un video solo con `preload`: hace falta darle play
    // (permitido sin tocar la pantalla porque está mudo) y pausarlo enseguida.
    video.play().then(() => video.pause()).catch(() => {});

    let objetivo = 0;
    let mostrado = 0;
    let cuadro = 0;

    const leerScroll = () => {
      const duracion = video.duration;
      if (!Number.isFinite(duracion) || duracion <= 0) return;
      const finDelHero = seccion.getBoundingClientRect().bottom + window.scrollY;
      const recorrido = Math.max(1, finDelHero * RECORRIDO_DEL_VIDEO);
      const progreso = Math.min(1, Math.max(0, window.scrollY / recorrido));
      objetivo = progreso * (duracion - 0.05);
    };

    // Cada cuadro de pantalla se acerca un poco al momento que pide el scroll: así
    // el video se desliza en vez de saltar cuando la rueda del mouse va de a pasos.
    const animar = () => {
      cuadro = 0;
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) return;
      mostrado += (objetivo - mostrado) * SUAVIZADO;
      if (Math.abs(objetivo - mostrado) < 0.005) mostrado = objetivo;
      // Mientras el navegador está buscando un cuadro no se le pide otro: se
      // amontonarían los saltos y el video quedaría atrasado respecto del scroll.
      if (!video.seeking && Math.abs(video.currentTime - mostrado) > 0.001) {
        if (!video.paused) video.pause();
        video.currentTime = mostrado;
      }
      if (mostrado !== objetivo || Math.abs(video.currentTime - mostrado) > 0.001) {
        cuadro = requestAnimationFrame(animar);
      }
    };

    const alScrollear = () => {
      leerScroll();
      if (!cuadro) cuadro = requestAnimationFrame(animar);
    };

    video.addEventListener("loadedmetadata", alScrollear);
    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    alScrollear();
    return () => {
      video.removeEventListener("loadedmetadata", alScrollear);
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <section ref={seccionRef} className="relative overflow-hidden">
      {/* La foto va siempre debajo: es lo primero que se pinta (LCP) y el video
          aparece encima con un fundido recién cuando ya tiene su primer cuadro.
          Como la foto ES ese primer cuadro, el cambio no se nota. */}
      <Image
        src="/hero-video-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden
        tabIndex={-1}
        onLoadedData={() => setVideoListo(true)}
        className={
          "absolute inset-0 size-full object-cover object-center transition-opacity duration-500 " +
          (videoListo ? "opacity-100" : "opacity-0")
        }
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/35" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-12 text-center sm:px-6 sm:pt-16 lg:pb-24 lg:pt-24">
        <div className="hero-in" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            <ShieldCheck className="size-3.5 text-accent-warm" />
            <span className="text-white">+{a.anios_experiencia} años</span>
            <span aria-hidden className="text-accent-warm">·</span>
            Operamos en todo el país
          </span>
        </div>

        <h1
          className="hero-in mt-5 text-balance text-4xl font-semibold leading-[1.06] text-white min-[440px]:text-5xl sm:text-6xl"
         style={{ "--i": 1 } as React.CSSProperties}>
          Tu próxima propiedad
          <br />
          te está esperando
        </h1>

        <p
          className="hero-in mt-4 max-w-xl text-balance text-base text-white/85 sm:text-lg"
         style={{ "--i": 2 } as React.CSSProperties}>
          Casas, departamentos, terrenos y locales en venta y alquiler en toda
          Argentina. Tasaciones en 48 hs y asesoría real por WhatsApp.
        </p>

        {/* BUSCADOR PANEL (la pieza central, como en las referencias):
            tabs de operación + tipo + ubicación + BUSCAR. */}
        <form
          action="/propiedades" method="get"
          className="hero-in mt-9 w-full max-w-2xl rounded-lg bg-white p-3 text-left shadow-[0_28px_70px_-28px_rgba(0,0,0,0.8)] sm:p-4"
         style={{ "--i": 3 } as React.CSSProperties}>
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
                    "h-10 rounded-md border px-5 text-sm font-semibold transition " +
                    (activa
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-foreground/15 bg-white text-muted-foreground hover:border-brand/50 hover:text-foreground")
                  }
                >
                  {op.label}
                </button>
              );
            })}
          </div>
          {operacion !== "all" && <input type="hidden" name="operacion" value={operacion} />}

          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <SelectPanel name="tipo" aria="Tipo de propiedad" placeholder="Tipo de propiedad" opciones={tipos} />
            {/* La ubicación viaja como `q`: el catálogo interpreta la frase y
                matchea barrio/ciudad — mismo camino que el buscador libre. */}
            <SelectPanel name="q" aria="Ubicación" placeholder="Ubicación" opciones={ciudades} />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-8 text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-110 active:scale-[0.98]"
            >
              <Search className="size-4" aria-hidden />
              Buscar
            </button>
          </div>
        </form>

        {/* CTAs secundarios */}
        <div
          className="hero-in mt-7 flex flex-wrap items-center justify-center gap-3"
         style={{ "--i": 4 } as React.CSSProperties}>
          <WhatsappButton numero={a.whatsapp} mensaje={mensajeGeneral(a)} label="Asesoría por WhatsApp" size="md" />
          <Link
            href="/vende-tu-propiedad"
            className="inline-flex min-h-13 items-center gap-1.5 rounded-md border border-white/40 px-6 text-sm font-medium text-white transition hover:border-white hover:bg-white/15"
          >
            Vendé tu propiedad <ArrowRight className="size-4" />
          </Link>
        </div>

        <dl
          className="hero-in mt-12 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-white/20 pt-7"
         style={{ "--i": 5 } as React.CSSProperties}>
          {TRUST.map((t) => (
            <div key={t.value} className="flex flex-col items-center gap-1.5">
              <t.icon className="size-5 text-accent-warm" aria-hidden />
              <dt className="text-sm font-semibold text-white">{t.value}</dt>
              <dd className="text-xs leading-snug text-white/75">{t.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
