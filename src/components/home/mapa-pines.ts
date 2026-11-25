// Lo que comparten el mapa de Google y el de OpenStreetMap de la home (24/11): el tipo de
// punto, los íconos por tipo de propiedad y el encuadre. Sin Leaflet ni Google acá, así cada
// mapa baja solo su librería.
import { normalizar } from "@/lib/buscador";

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

/**
 * Qué ícono lleva cada `tipo_propiedad`. Llega normalizado (sin tildes, minúsculas: ver
 * `datosBuscables` en lib/buscador.ts) — antes se comparaba exacto y los 3 cargados como
 * "departamento" en minúscula salían con el ícono de casa.
 */
export function iconoDelTipo(tipo: string | undefined): string {
  switch (normalizar(tipo)) {
    case "departamento":
    case "ph":
    case "monoambiente":
    case "edificio comercial":
      return "edificio";
    case "terreno":
      return "lote";
    case "local":
      return "local";
    case "galpon":
      return "galpon";
    case "oficina":
      return "oficina";
    case "quinta":
    case "campo":
      return "campo";
    case "cochera":
      return "cochera";
    default:
      return "casa";
  }
}

export const TAMANO_PIN = 28;

/**
 * Tamaño del pin según el zoom: con el mapa alejado van chicos (Nacho, 09/10: "hacelos
 * más chicos cuando estén deszoomeados") y crecen al acercarse. Con 135 pins en el GBA
 * oeste, a tamaño completo y zoom lejano se tapaban unos a otros. Zoom 10 → 60%;
 * 14 o más → completo. Se aplica como `--escala-pin` en el contenedor del mapa: el
 * `<svg>` de cada pin la lee, así no hay que regenerar los 135 íconos en cada zoom.
 */
export const escalaPin = (zoom: number) => Math.min(1, Math.max(0.6, 0.6 + (zoom - 10) * 0.1));

export function svgDelPin(clave: string) {
  const trazos = TRAZOS[clave] ?? TRAZOS.casa;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TAMANO_PIN}" height="${TAMANO_PIN}" viewBox="-2 -2 28 28" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));transform:scale(var(--escala-pin,1));transition:transform .2s ease-out">` +
    `<g stroke="#fff" fill="#fff" stroke-width="5.5">${trazos}</g>` +
    `<g stroke="#c41f0d" fill="#c41f0d" fill-opacity=".22" stroke-width="2.25">${trazos}</g>` +
    `</svg>`
  );
}

/** Radio (en grados, ~10 km) para contar cuántos pins tiene cerca cada pin. */
const RADIO_VECINOS = 0.09;
/** Qué parte de los pins entra en el encuadre inicial: los más cercanos al centro. */
const PARTE_ENCUADRADA = 0.75;

export type Encuadre = { sur: number; oeste: number; norte: number; este: number; padding: number; maxZoom: number };

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
export function calcularEncuadre(puntos: PuntoMapa[]): Encuadre | null {
  if (puntos.length === 0) return null;
  if (puntos.length <= 8) {
    const lats = puntos.map((p) => p.lat);
    const lngs = puntos.map((p) => p.lng);
    return { sur: Math.min(...lats), norte: Math.max(...lats), oeste: Math.min(...lngs), este: Math.max(...lngs), padding: 28, maxZoom: 15 };
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
  return { sur: lat - alto, norte: lat + alto, oeste: lng - ancho, este: lng + ancho, padding: 14, maxZoom: 14 };
}
