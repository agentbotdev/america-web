"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// VERSIÓN 3: el hero lleva un MAPA interactivo con todas las propiedades
// geolocalizadas (como el del CRM) — se navega, se hace zoom y cada pin abre
// una mini-card con foto, precio y link a la ficha.
//
// Leaflet se importa DINÁMICO dentro de useEffect: la librería toca `window`
// al cargarse, así que un import estático rompería el render en el servidor.
// Los pins son `divIcon` (un span estilizado): el marker PNG clásico de
// Leaflet se pierde bajo bundlers y además el punto rojo de marca queda
// más elegante que el pin azul de stock.

export type PuntoMapa = {
  id: string;
  slug: string;
  titulo: string;
  precio: string;
  lat: number;
  lng: number;
  fotoUrl?: string;
};

// Escapa lo mínimo para inyectar texto de la DB en el HTML del popup.
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function popupHtml(p: PuntoMapa) {
  const foto = p.fotoUrl
    ? `<img src="${esc(p.fotoUrl)}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:4px;display:block" loading="lazy" />`
    : "";
  return (
    `<a href="/propiedad/${esc(p.slug)}" style="display:block;width:200px;text-decoration:none;color:#1a1a1a;font-family:var(--font-sans),system-ui">` +
    foto +
    `<p style="margin:8px 0 0;font-size:13px;font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(p.titulo)}</p>` +
    `<p style="margin:6px 0 0;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums">${esc(p.precio)}</p>` +
    `<p style="margin:6px 0 2px;font-size:12px;font-weight:600;color:#c41f0d">Ver ficha →</p>` +
    `</a>`
  );
}

export function HeroMapa({ puntos }: { puntos: PuntoMapa[] }) {
  const contRef = useRef<HTMLDivElement>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let mapa: LeafletMap | undefined;
    let cancelado = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelado || !contRef.current || puntos.length === 0) return;

      mapa = L.map(contRef.current, {
        scrollWheelZoom: false, // la rueda scrollea la página, no el mapa (se activa al click)
        zoomControl: true,
      });
      mapa.on("click", () => mapa?.scrollWheelZoom.enable());

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);

      const icono = L.divIcon({
        className: "", // sin estilos default de Leaflet
        html:
          '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#f02e19;border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.4)"></span>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -8],
      });

      L.featureGroup(
        puntos.map((p) =>
          L.marker([p.lat, p.lng], { icon: icono, title: p.titulo }).bindPopup(popupHtml(p), {
            closeButton: false,
            maxWidth: 220,
          }),
        ),
      ).addTo(mapa);

      // VISTA INICIAL: el CLUSTER PRINCIPAL, no el país entero. Con fitBounds
      // sobre TODOS los pins (GBA oeste + Mar del Plata + Miramar + Pilar) el
      // mapa arrancaba en zoom 6 —media Argentina— y el 90% de los pins caía
      // apilado en una bolita ilegible (feedback del cliente: "horrible").
      // Ahora: mediana de lat/lng = el corazón de la cartera, y se encuadran
      // solo los pins a menos de ~25 km (0.22°) de ahí → arranca en el GBA
      // oeste con las casas bien distribuidas. Alejando el zoom aparecen las
      // plazas de la costa. Bonus: un área chica pide pocos tiles → carga
      // rápida de entrada.
      const lats = puntos.map((p) => p.lat).sort((a, b) => a - b);
      const lngs = puntos.map((p) => p.lng).sort((a, b) => a - b);
      const medLat = lats[Math.floor(lats.length / 2)];
      const medLng = lngs[Math.floor(lngs.length / 2)];
      const cluster = puntos.filter(
        (p) => Math.abs(p.lat - medLat) < 0.22 && Math.abs(p.lng - medLng) < 0.22,
      );
      const base = cluster.length >= 3 ? cluster : puntos;
      mapa.fitBounds(L.latLngBounds(base.map((p) => [p.lat, p.lng] as [number, number])), {
        padding: [36, 36],
        maxZoom: 13,
      });
      setListo(true);
    })();

    return () => {
      cancelado = true;
      mapa?.remove();
    };
    // `puntos` llega del server render y no cambia en la vida del componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (puntos.length === 0) return null;

  return (
    // rounded-[20px]: pedido explícito del cliente — el mapa con más curva
    // que el resto de las cards.
    <div className="overflow-hidden rounded-[20px] border border-foreground/12 bg-white shadow-[0_24px_56px_-32px_rgba(60,45,20,0.4)]">
      {/* React 19 eleva este link al <head>: el handshake con el servidor de
          tiles arranca antes de que Leaflet pida el primer PNG. */}
      <link rel="preconnect" href="https://tile.openstreetmap.org" />
      <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-3">
        <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Explorá por el mapa</p>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {puntos.length} propiedades
        </span>
      </div>
      {/* Altura EXPLÍCITA: Leaflet no mide nada si el contenedor no la tiene.
          bg-muted de base para que mientras llegan los tiles se vea una
          superficie, no un hueco blanco. */}
      <div
        ref={contRef}
        aria-label="Mapa de propiedades disponibles"
        className={`h-[340px] w-full bg-muted transition-opacity duration-300 sm:h-[420px] lg:h-[500px] ${listo ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export default HeroMapa;
