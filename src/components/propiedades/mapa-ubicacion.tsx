"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// MAPA DE LA FICHA CON GOOGLE (24/11, pedido de Nacho: el mapa de Google del CRM "también
// tiene que estar en la web").
//
// Es el iframe de Maps Embed API: GRATIS y sin límite de usos (a diferencia del mapa
// interactivo de JavaScript, que se cobra por carga). Por eso la web puede mostrarlo en cada
// ficha sin riesgo de factura. La clave es de navegador, restringida en Google Cloud a
// Maps Embed API y a los dominios de la web.
//
// Tres vistas: mapa con el pin, satélite y Street View. Street View pide la imagen más
// cercana al punto: en calles internas, barrios cerrados o campo Google puede no tenerla.

type Vista = "mapa" | "satelite" | "calle";

const VISTAS: { id: Vista; label: string }[] = [
  { id: "mapa", label: "Mapa" },
  { id: "satelite", label: "Satélite" },
  { id: "calle", label: "Street View" },
];

function srcGoogle(clave: string, lat: number, lng: number, vista: Vista): string {
  const base = "https://www.google.com/maps/embed/v1";
  const comun = `key=${encodeURIComponent(clave)}&language=es&region=AR`;
  if (vista === "calle") return `${base}/streetview?${comun}&location=${lat},${lng}&fov=80`;
  return `${base}/place?${comun}&q=${lat},${lng}&zoom=16&maptype=${vista === "satelite" ? "satellite" : "roadmap"}`;
}

export function MapaUbicacion({ lat, lng, titulo, clave }: { lat: number; lng: number; titulo: string; clave: string }) {
  const [vista, setVista] = useState<Vista>("mapa");
  return (
    <div>
      <div
        role="tablist"
        aria-label="Vista del mapa"
        className="flex gap-1 border-b border-border px-3 py-2"
      >
        {VISTAS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={vista === v.id}
            onClick={() => setVista(v.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              vista === v.id ? "bg-brand text-white" : "text-foreground hover:bg-muted",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <iframe
        key={vista}
        src={srcGoogle(clave, lat, lng, vista)}
        title={`${vista === "calle" ? "Street View" : "Mapa"} de ${titulo}`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="block aspect-[16/10] w-full border-0"
      />
    </div>
  );
}

export default MapaUbicacion;
