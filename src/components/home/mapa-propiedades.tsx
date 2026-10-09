"use client";

import { useEffect, useRef, useState } from "react";
import { Hand } from "lucide-react";
import type { Map as LeafletMap, LayerGroup, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

// MAPA de todas las propiedades geolocalizadas (traído de la versión 3, rama
// `version-3-mapa`, a pedido de Nacho el 08/10). Se navega, se hace zoom y cada pin abre
// una mini-card con foto, precio y link a la ficha. `visibles` filtra los pins en vivo
// mientras se escribe en la barra de búsqueda de la sección.
//
// Leaflet se importa DINÁMICO dentro de useEffect: la librería toca `window` al cargarse,
// así que un import estático rompería el render en el servidor.

export type PuntoMapa = {
  id: string;
  slug: string;
  titulo: string;
  precio: string;
  lat: number;
  lng: number;
  fotoUrl?: string;
  /** `tipo_propiedad`: elige el ícono del pin. */
  tipo?: string;
};

// PINES CON EL ÍCONO DEL TIPO de propiedad, sin fondo (Nacho, 09/10: "en vez de puntos,
// íconos de propiedades: si es casa una casa, un edificio, un lote"). Son los trazos de
// lucide, los mismos íconos del resto de la web. Para que se lean sobre cualquier parte
// del mapa, cada ícono se dibuja dos veces: primero en blanco y grueso (un contorno) y
// encima en el rojo de la marca.
const TRAZOS: Record<string, string> = {
  casa:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  edificio:
    '<path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
  lote:
    '<path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/>',
  local:
    '<path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>',
  galpon:
    '<path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/>',
  oficina:
    '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  campo:
    '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
  cochera:
    '<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>',
};

/** Qué ícono lleva cada `tipo_propiedad` (valores reales de la base, ver lib/buscador.ts). */
function iconoDelTipo(tipo: string | undefined): string {
  switch (tipo) {
    case "Departamento":
    case "PH":
    case "Monoambiente":
    case "Edificio Comercial":
      return "edificio";
    case "Terreno":
      return "lote";
    case "Local":
      return "local";
    case "Galpón":
      return "galpon";
    case "Oficina":
      return "oficina";
    case "Quinta":
    case "Campo":
      return "campo";
    case "Cochera":
      return "cochera";
    default:
      return "casa";
  }
}

const TAMANO_PIN = 28;

/**
 * Tamaño del pin según el zoom: con el mapa alejado van chicos (Nacho, 09/10: "hacelos
 * más chicos cuando estén deszoomeados") y crecen al acercarse. Con 135 pins en el GBA
 * oeste, a tamaño completo y zoom lejano se tapaban unos a otros. Zoom 10 → 60%;
 * 14 o más → completo. Se aplica como `--escala-pin` en el contenedor del mapa: el
 * `<svg>` de cada pin la lee, así no hay que regenerar los 135 íconos en cada zoom.
 */
const escalaPin = (zoom: number) => Math.min(1, Math.max(0.6, 0.6 + (zoom - 10) * 0.1));

function svgDelPin(clave: string) {
  const trazos = TRAZOS[clave] ?? TRAZOS.casa;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TAMANO_PIN}" height="${TAMANO_PIN}" viewBox="-2 -2 28 28" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));transform:scale(var(--escala-pin,1));transition:transform .2s ease-out">` +
    `<g stroke="#fff" fill="#fff" stroke-width="5.5">${trazos}</g>` +
    `<g stroke="#c41f0d" fill="#c41f0d" fill-opacity=".22" stroke-width="2.25">${trazos}</g>` +
    `</svg>`
  );
}

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

type Leaflet = typeof import("leaflet");

/** Radio (en grados, ~10 km) para contar cuántos pins tiene cerca cada pin. */
const RADIO_VECINOS = 0.09;
/** Qué parte de los pins entra en el encuadre inicial: los más cercanos al centro. */
const PARTE_ENCUADRADA = 0.75;

/**
 * Encuadre de un conjunto de pins: donde se CONCENTRAN, no todos. Con todos (GBA oeste +
 * Mar del Plata + Pinamar) el mapa arrancaba lejísimos y con mucho espacio vacío (Nacho,
 * 09/10: "que arranque con un poco más de zoom"). Percentiles por eje tampoco sirven: las
 * propiedades de la costa tiran la longitud al este y Moreno —la mitad de la cartera—
 * quedaba cortada contra el borde izquierdo.
 *
 * Entonces: el CENTRO es el promedio de la zona más densa (el pin con más vecinos y sus
 * vecinos), y el zoom abarca el 75% de los pins más cercanos a ese centro, simétrico
 * alrededor de él. Los sueltos lejos aparecen al alejar. Con pocos pins (una búsqueda)
 * se ven todos.
 */
function encuadrar(L: Leaflet, mapa: LeafletMap, puntos: PuntoMapa[]) {
  if (puntos.length === 0) return;
  if (puntos.length <= 8) {
    mapa.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng] as [number, number])), {
      padding: [28, 28],
      maxZoom: 15,
    });
    return;
  }
  const cerca = (a: PuntoMapa, b: PuntoMapa) =>
    Math.abs(a.lat - b.lat) < RADIO_VECINOS && Math.abs(a.lng - b.lng) < RADIO_VECINOS;
  let vecinosDelMasDenso: PuntoMapa[] = [];
  for (const a of puntos) {
    const vecinos = puntos.filter((b) => cerca(a, b));
    if (vecinos.length > vecinosDelMasDenso.length) vecinosDelMasDenso = vecinos;
  }
  const lat = vecinosDelMasDenso.reduce((s, p) => s + p.lat, 0) / vecinosDelMasDenso.length;
  const lng = vecinosDelMasDenso.reduce((s, p) => s + p.lng, 0) / vecinosDelMasDenso.length;

  const distancia = (p: PuntoMapa) => Math.hypot(p.lat - lat, p.lng - lng);
  const encuadrados = [...puntos]
    .sort((a, b) => distancia(a) - distancia(b))
    .slice(0, Math.ceil(puntos.length * PARTE_ENCUADRADA));
  const alto = Math.max(...encuadrados.map((p) => Math.abs(p.lat - lat)));
  const ancho = Math.max(...encuadrados.map((p) => Math.abs(p.lng - lng)));
  mapa.fitBounds(
    L.latLngBounds([lat - alto, lng - ancho], [lat + alto, lng + ancho]),
    { padding: [14, 14], maxZoom: 14 },
  );
}

export function MapaPropiedades({
  puntos,
  visibles,
}: {
  puntos: PuntoMapa[];
  /** Ids de los pins a mostrar; `null` = todos. */
  visibles: Set<string> | null;
}) {
  const contRef = useRef<HTMLDivElement>(null);
  // Lo que el efecto de filtrado necesita del mapa ya armado.
  const armado = useRef<{ L: Leaflet; mapa: LeafletMap; capa: LayerGroup; marcadores: Map<string, Marker> } | null>(null);
  const visiblesRef = useRef(visibles);
  // EN EL CELULAR el mapa arranca "dormido": no agarra el dedo. Ocupa casi todo el ancho
  // de la pantalla y, despierto, al pasar el dedo por encima movía el mapa en vez de bajar
  // la página (Nacho, 09/10: "se traba para scrollear"). Se despierta con un toque y se
  // vuelve a dormir cuando sale de la pantalla.
  const [dormido, setDormido] = useState(false);

  const filtrar = () => {
    const a = armado.current;
    if (!a) return;
    const filtro = visiblesRef.current;
    const mostrados = filtro ? puntos.filter((p) => filtro.has(p.id)) : puntos;
    a.capa.clearLayers();
    for (const p of mostrados) {
      const m = a.marcadores.get(p.id);
      if (m) a.capa.addLayer(m);
    }
    encuadrar(a.L, a.mapa, mostrados);
  };

  const despertar = () => {
    const a = armado.current;
    if (!a) return;
    a.mapa.dragging.enable();
    a.mapa.touchZoom.enable();
    setDormido(false);
  };

  useEffect(() => {
    let mapa: LeafletMap | undefined;
    let observador: IntersectionObserver | undefined;
    let cancelado = false;

    (async () => {
      const L = await import("leaflet");
      const cont = contRef.current;
      if (cancelado || !cont || puntos.length === 0) return;

      // Pantalla táctil sin mouse: celulares y tablets.
      const tactil = window.matchMedia("(pointer: coarse)").matches;
      mapa = L.map(cont, {
        scrollWheelZoom: false, // la rueda scrollea la página, no el mapa (se activa al click)
        zoomControl: true,
        dragging: !tactil,
        touchZoom: !tactil,
      });
      const m = mapa;
      m.on("click", () => m.scrollWheelZoom.enable());
      const escalar = () => cont.style.setProperty("--escala-pin", String(escalaPin(m.getZoom())));
      m.on("zoomend", escalar);

      // MISMA RECETA QUE EL MAPA DEL CRM (que carga bien): `{s}` rota los subdominios
      // a/b/c → el navegador limita conexiones POR HOST, así que un solo host baja ~6
      // tiles a la vez y con tres hosts bajan ~18 en paralelo. `keepBuffer` retiene tiles
      // vecinos: panear no vuelve a mostrar blanco.
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: "abc",
        maxZoom: 19,
        keepBuffer: 4,
        updateWhenIdle: false,
      }).addTo(m);

      const iconos = new Map<string, ReturnType<typeof L.divIcon>>();
      const iconoPara = (tipo: string | undefined) => {
        const clave = iconoDelTipo(tipo);
        let icono = iconos.get(clave);
        if (!icono) {
          icono = L.divIcon({
            className: "", // sin estilos default de Leaflet (ni el cuadrado blanco)
            html: svgDelPin(clave),
            iconSize: [TAMANO_PIN, TAMANO_PIN],
            iconAnchor: [TAMANO_PIN / 2, TAMANO_PIN / 2],
            popupAnchor: [0, -TAMANO_PIN / 2],
          });
          iconos.set(clave, icono);
        }
        return icono;
      };

      const marcadores = new Map<string, Marker>();
      for (const p of puntos) {
        marcadores.set(
          p.id,
          L.marker([p.lat, p.lng], { icon: iconoPara(p.tipo), title: p.titulo }).bindPopup(popupHtml(p), {
            closeButton: false,
            maxWidth: 220,
          }),
        );
      }
      const capa = L.layerGroup().addTo(m);
      armado.current = { L, mapa: m, capa, marcadores };
      filtrar();
      escalar();

      if (tactil) {
        setDormido(true);
        // Cuando el mapa sale de la pantalla se vuelve a dormir: al volver, la página
        // se scrollea sin que el mapa agarre el dedo.
        observador = new IntersectionObserver(([entrada]) => {
          if (entrada && !entrada.isIntersecting) {
            m.dragging.disable();
            m.touchZoom.disable();
            setDormido(true);
          }
        });
        observador.observe(cont);
      }
    })();

    return () => {
      cancelado = true;
      observador?.disconnect();
      armado.current = null;
      mapa?.remove();
    };
    // `puntos` llega del server render y no cambia en la vida del componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cada vez que cambia la búsqueda se vuelven a poner los pins y se re-encuadra.
  useEffect(() => {
    visiblesRef.current = visibles;
    filtrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibles]);

  if (puntos.length === 0) return null;

  return (
    <div className="relative">
      {/* React 19 eleva estos links al <head>: el handshake con los TRES subdominios de
          tiles arranca antes de que Leaflet pida el primer PNG. */}
      <link rel="preconnect" href="https://a.tile.openstreetmap.org" />
      <link rel="preconnect" href="https://b.tile.openstreetmap.org" />
      <link rel="preconnect" href="https://c.tile.openstreetmap.org" />
      {/* Altura EXPLÍCITA: Leaflet no mide nada si el contenedor no la tiene. `bg-muted`
          de base para que mientras llegan los tiles se vea una superficie, no un hueco. */}
      <div
        ref={contRef}
        aria-label="Mapa de propiedades"
        className="relative z-0 h-[340px] w-full bg-muted sm:h-[420px] lg:h-[480px]"
      />
      {dormido && (
        // Tapa el mapa dormido: deja pasar el scroll vertical (`touch-action: pan-y`) y con
        // un toque lo despierta.
        <button
          type="button"
          onClick={despertar}
          style={{ touchAction: "pan-y" }}
          className="absolute inset-0 z-10 flex items-end justify-center bg-transparent pb-4"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/80 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
            <Hand className="size-3.5" aria-hidden />
            Tocá para mover el mapa
          </span>
        </button>
      )}
    </div>
  );
}
