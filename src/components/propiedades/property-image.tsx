"use client";

import Image from "next/image";
import { useState } from "react";
import { Home, Building2, Trees, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FotoPropiedad } from "@/types";

// Imagen de propiedad con fallback premium: si no hay url o la foto no carga,
// muestra un bloque con el color de marca + ícono según el tipo (nunca se ve
// "rota"). Replica el patrón de la web de autos, adaptado a inmobiliaria.

// Componente estable (fuera del render) → evita `react-hooks/static-components`.
function TipoIcon({ tipo, className }: { tipo?: string; className?: string }) {
  const t = (tipo ?? "").toLowerCase();
  if (t.includes("terreno") || t.includes("campo") || t.includes("quinta"))
    return <Trees className={className} />;
  if (t.includes("local") || t.includes("oficina") || t.includes("galp") || t.includes("comercial"))
    return <Store className={className} />;
  if (t.includes("departamento") || t.includes("ph") || t.includes("edificio"))
    return <Building2 className={className} />;
  return <Home className={className} />;
}

interface PropertyImageProps {
  foto?: FotoPropiedad;
  /** Override del src (ej. usar `thumbnail`). Por defecto usa `foto.url`. */
  src?: string;
  alt?: string;
  /** Texto del fallback (ej. el título de la propiedad). */
  titulo?: string;
  /** Tipo de propiedad → elige el ícono del fallback. */
  tipo?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function PropertyImage({
  foto,
  src,
  alt,
  titulo,
  tipo,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  className,
}: PropertyImageProps) {
  const [failed, setFailed] = useState(false);
  const url = src ?? foto?.url;
  const altText = alt ?? foto?.alt ?? titulo ?? "Propiedad";

  if (!url || failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-3",
          "bg-gradient-to-br from-brand/90 to-brand text-brand-foreground",
          className,
        )}
      >
        <TipoIcon tipo={tipo} className="size-12 opacity-90" />
        {titulo && (
          <span className="px-4 text-center text-sm font-medium opacity-90">
            {titulo}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={altText}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export default PropertyImage;
