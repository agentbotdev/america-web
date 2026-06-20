import { MapPin } from "lucide-react";
import type { Propiedad } from "@/types";

// Mapa de ubicación con iframe de OpenStreetMap embed (sin librerías, sin API key).
// Si la propiedad no tiene coordenadas, no renderiza nada. La ubicación textual
// (barrio / zona / ciudad) se muestra arriba del mapa. Server-compatible.

function bbox(lat: number, lng: number, delta = 0.01) {
  // OSM espera el orden: minLon, minLat, maxLon, maxLat.
  const minLon = lng - delta;
  const minLat = lat - delta;
  const maxLon = lng + delta;
  const maxLat = lat + delta;
  return `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
}

export function PropertyMap({ propiedad: p }: { propiedad: Propiedad }) {
  const lat = p.coordenadas_lat;
  const lng = p.coordenadas_lng;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const src =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bbox(lat, lng)}&layer=mapnik&marker=${lat}%2C${lng}`;

  const ubicacion =
    [p.barrio, p.zona, p.ciudad].filter(Boolean).join(", ") || "Ubicación de la propiedad";

  return (
    <section className="mt-14">
      <div className="mb-6">
        <span className="text-sm font-medium text-brand">Dónde está</span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Ubicación</h2>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
        style={{ borderTopColor: "rgba(255,255,255,0.16)" }}
      >
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3.5">
          <MapPin className="size-4 shrink-0 text-brand" />
          <p className="text-sm font-medium text-foreground">{ubicacion}</p>
        </div>
        <iframe
          src={src}
          title={`Mapa de ${ubicacion}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block aspect-[16/10] w-full border-0 grayscale-[0.15]"
        />
      </div>
    </section>
  );
}

export default PropertyMap;
