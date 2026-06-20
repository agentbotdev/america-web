"use client";

import { useState } from "react";
import { Video, Map } from "lucide-react";
import { PropertyImage } from "./property-image";
import { cn } from "@/lib/utils";
import type { FotoPropiedad } from "@/types";

// Galería de la ficha: foto activa grande + thumbnails navegables.
// Reutiliza PropertyImage (fallback a ícono si una foto falla). Marca los
// planos con un badge para que el usuario los reconozca.

interface PropertyGalleryProps {
  fotos: FotoPropiedad[];
  titulo: string;
  tipo?: string;
  tieneVideo?: boolean;
}

export function PropertyGallery({ fotos, titulo, tipo, tieneVideo }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);

  // Siempre hay al menos un slot (aunque sea el fallback con ícono).
  const items: FotoPropiedad[] = fotos.length
    ? fotos
    : [{ url: "", alt: titulo, es_portada: true }];

  const current = items[Math.min(active, items.length - 1)];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
        <PropertyImage
          foto={current}
          titulo={titulo}
          tipo={tipo}
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
        {current?.es_plano && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
            <Map className="size-4" /> Plano
          </span>
        )}
        {tieneVideo && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
            <Video className="size-4" /> Video disponible
          </span>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {items.map((f, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border bg-muted transition",
                i === active ? "border-brand ring-2 ring-brand/40" : "border-border hover:border-brand/50",
              )}
            >
              <PropertyImage
                foto={f}
                src={f.thumbnail ?? f.url}
                titulo={titulo}
                tipo={tipo}
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyGallery;
