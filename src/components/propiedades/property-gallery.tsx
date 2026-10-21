"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Video, Map, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { PropertyImage } from "./property-image";
import { cn } from "@/lib/utils";
import type { FotoPropiedad } from "@/types";

// Galería de la ficha: foto activa grande + thumbnails navegables + flechas
// prev/next y contador. Reutiliza PropertyImage (fallback a ícono si una foto
// falla). Marca los planos con un badge. Si NO hay fotos, muestra un placeholder
// lindo con el ícono del tipo y un mensaje claro.

interface PropertyGalleryProps {
  fotos: FotoPropiedad[];
  titulo: string;
  tipo?: string;
  tieneVideo?: boolean;
  /** Hay videos para mostrar más abajo (#videos): la etiqueta lleva hasta ahí. */
  hayVideos?: boolean;
}

export function PropertyGallery({ fotos, titulo, tipo, tieneVideo, hayVideos }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const tira = useRef<HTMLDivElement>(null);
  const toqueX = useRef<number | null>(null);

  const hasFotos = fotos.length > 0;
  // Siempre hay al menos un slot (aunque sea el fallback con ícono).
  const items: FotoPropiedad[] = hasFotos ? fotos : [{ url: "", alt: titulo, es_portada: true }];
  const total = items.length;

  const idx = Math.min(active, total - 1);
  const current = items[idx];

  const go = useCallback(
    (dir: 1 | -1) => setActive((prev) => (prev + dir + total) % total),
    [total],
  );

  // La miniatura activa se mantiene centrada en la tira (que se desliza de costado).
  useEffect(() => {
    const t = tira.current;
    const el = t?.children[active] as HTMLElement | undefined;
    if (!t || !el) return;
    t.scrollTo({ left: el.offsetLeft - t.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div className="min-w-0 max-w-full">
      <div
        // Deslizar con el dedo pasa de foto (touch-pan-y deja scrollear la página hacia abajo).
        onTouchStart={(e) => { toqueX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (toqueX.current == null) return;
          const dx = e.changedTouches[0].clientX - toqueX.current;
          toqueX.current = null;
          if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        }}
        className="group relative aspect-[4/3] touch-pan-y overflow-hidden rounded-xl border border-border bg-muted"
      >
        <PropertyImage
          foto={current}
          titulo={titulo}
          tipo={tipo}
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />

        {/* Flechas de navegación (solo si hay más de una foto real). */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur-md transition-all hover:bg-black/65 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur-md transition-all hover:bg-black/65 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            {/* Contador de fotos */}
            <span className="absolute right-3 top-3 z-10 rounded-sm bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {idx + 1} / {total}
            </span>
          </>
        )}

        {/* Estado sin fotos: mensaje claro (el ícono del tipo lo pone PropertyImage). */}
        {!hasFotos && (
          <span className="absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-sm bg-black/45 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <ImageOff className="size-4" aria-hidden="true" /> Sin fotos disponibles
          </span>
        )}

        {current?.es_plano && (
          <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-sm bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
            <Map className="size-4" aria-hidden="true" /> Plano
          </span>
        )}
        {tieneVideo && (
          <a
            href={hayVideos ? "#videos" : undefined}
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-sm bg-black/70 px-3 py-1.5 text-xs font-medium text-white"
          >
            <Video className="size-4" aria-hidden="true" /> {hayVideos ? "Ver video" : "Video disponible"}
          </a>
        )}
      </div>

      {total > 1 && (
        <div ref={tira} className="mt-3 flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:thin]">
          {items.map((f, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === idx}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-[72px] shrink-0 overflow-hidden rounded-lg border bg-muted transition sm:size-24",
                i === idx
                  ? "border-brand ring-2 ring-brand/40"
                  : "border-border hover:border-brand/50",
              )}
            >
              <PropertyImage
                foto={f}
                src={f.thumbnail ?? f.url}
                titulo={titulo}
                tipo={tipo}
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyGallery;
