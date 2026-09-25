"use client";

import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Propiedad } from "@/types";

// Botón "Cómo llegar" — abre la app de mapas del DISPOSITIVO, no una web.
//
// CÓMO SE LOGRA SIN DETECTAR EL SISTEMA OPERATIVO:
// `https://maps.google.com/?q=...` es un link universal. En Android lo captura
// Google Maps, en iPhone lo toma Google Maps si está instalado y si no abre en
// el navegador, y en escritorio abre la web. Sniffear el user-agent para elegir
// entre `geo:`, `maps://` y `comgooglemaps://` es frágil (los esquemas cambian,
// y si la app no está instalada el link muere en la nada).
//
// COORDENADAS PRIMERO, DIRECCIÓN DESPUÉS: si la propiedad tiene lat/lng, se usa
// eso — cae en el punto exacto. Si no, se manda la dirección como texto y que
// la resuelva el buscador de mapas. Nunca se manda la dirección exacta si el
// dato no es público: se usa `direccion_publica`, que es la que la inmobiliaria
// decidió mostrar.

/** Arma el link de mapas más preciso que permitan los datos de la propiedad. */
export function linkMapa(p: Propiedad): string | null {
  const lat = p.coordenadas_lat;
  const lng = p.coordenadas_lng;
  if (lat != null && lng != null) {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }
  const texto = [p.direccion_publica, p.barrio, p.ciudad, p.provincia]
    .filter(Boolean)
    .join(", ");
  if (!texto) return null;
  return `https://maps.google.com/?q=${encodeURIComponent(texto)}`;
}

export function MapsButton({
  propiedad: p,
  variant = "solid",
  fullWidth,
  className,
}: {
  propiedad: Propiedad;
  variant?: "solid" | "outline";
  fullWidth?: boolean;
  className?: string;
}) {
  const href = linkMapa(p);
  // Sin ubicación no se muestra un botón que no lleva a ningún lado.
  if (!href) return null;

  const exacta = p.coordenadas_lat != null && p.coordenadas_lng != null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver la ubicación de ${p.titulo} en el mapa`}
      className={cn(
        "inline-flex h-13 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all active:scale-[0.98]",
        variant === "solid" &&
          "bg-foreground text-background hover:brightness-125",
        variant === "outline" &&
          "border border-foreground/25 text-foreground hover:border-foreground/50 hover:bg-foreground/5",
        fullWidth && "w-full",
        className,
      )}
    >
      {exacta ? (
        <Navigation className="size-4 shrink-0" aria-hidden />
      ) : (
        <MapPin className="size-4 shrink-0" aria-hidden />
      )}
      Cómo llegar
    </a>
  );
}
