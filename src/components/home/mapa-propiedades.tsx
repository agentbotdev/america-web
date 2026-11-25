"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Hand } from "lucide-react";
import type { Map as LeafletMap, LayerGroup, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  calcularEncuadre,
  escalaPin,
  iconoDelTipo,
  svgDelPin,
  TAMANO_PIN,
  type PuntoMapa,
} from "./mapa-pines";

export type { PuntoMapa };

// MAPA de todas las propiedades geolocalizadas (traído de la versión 3, rama
// `version-3-mapa`, a pedido de Nacho el 08/10). Se navega, se hace zoom y cada pin abre
// una mini-card con foto, precio y link a la ficha. `visibles` filtra los pins en vivo
// mientras se escribe en la barra de búsqueda de la sección.
//
// Leaflet se importa DINÁMICO dentro de useEffect: la librería toca `window` al cargarse,
// así que un import estático rompería el render en el servidor.

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

function encuadrar(L: Leaflet, mapa: LeafletMap, puntos: PuntoMapa[]) {
  const e = calcularEncuadre(puntos);
  if (!e) return;
  mapa.fitBounds(L.latLngBounds([e.sur, e.oeste], [e.norte, e.este]), { padding: [e.padding, e.padding], maxZoom: e.maxZoom });
}

/** El mapa de OpenStreetMap (Leaflet): sin clave de Google, o de respaldo si Google falla. */
function MapaPropiedadesOSM({
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

// ── Qué mapa se muestra (24/11) ───────────────────────────────────────────────────────────
// Con NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY, el de Google; sin clave, o si Google falla, el de
// OpenStreetMap de siempre. Google se pide RECIÉN cuando la sección está por entrar en
// pantalla: se cobra por carga, y quien entra y se va sin bajar no gasta nada.
const CLAVE_GOOGLE = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY ?? "").trim();
const CLASE_MAPA = "relative z-0 h-[340px] w-full bg-muted sm:h-[420px] lg:h-[480px]";

const MapaGoogle = dynamic(() => import("./mapa-propiedades-google").then((m) => m.MapaPropiedadesGoogle), {
  ssr: false,
  loading: () => <div aria-label="Mapa de propiedades" className={CLASE_MAPA} />,
});

/**
 * Si algo del mapa de Google rompe al dibujar o al desmontarse, la home sigue entera: se avisa
 * y se pasa al mapa de OpenStreetMap en vez de mostrar "This page couldn't load".
 */
class BarreraMapaGoogle extends Component<{ onFallo: () => void; children: ReactNode }, { roto: boolean }> {
  state = { roto: false };
  static getDerivedStateFromError() {
    return { roto: true };
  }
  componentDidCatch() {
    this.props.onFallo();
  }
  render() {
    return this.state.roto ? null : this.props.children;
  }
}

export function MapaPropiedades({
  puntos,
  visibles,
}: {
  puntos: PuntoMapa[];
  /** Ids de los pins a mostrar; `null` = todos. */
  visibles: Set<string> | null;
}) {
  const [falloGoogle, setFalloGoogle] = useState(false);
  const [cerca, setCerca] = useState(false);
  const reservaRef = useRef<HTMLDivElement>(null);
  const alFallarGoogle = useCallback(() => setFalloGoogle(true), []);

  useEffect(() => {
    const el = reservaRef.current;
    if (!CLAVE_GOOGLE || cerca || !el) return;
    const vigia = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setCerca(true);
          vigia.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    vigia.observe(el);
    return () => vigia.disconnect();
  }, [cerca]);

  if (puntos.length === 0) return null;
  if (!CLAVE_GOOGLE || falloGoogle) return <MapaPropiedadesOSM puntos={puntos} visibles={visibles} />;
  // Mismo alto que el mapa: la página no salta cuando aparece.
  if (!cerca) return <div ref={reservaRef} aria-label="Mapa de propiedades" className={CLASE_MAPA} />;
  return (
    <BarreraMapaGoogle onFallo={alFallarGoogle}>
      <MapaGoogle puntos={puntos} visibles={visibles} clave={CLAVE_GOOGLE} onFallo={alFallarGoogle} />
    </BarreraMapaGoogle>
  );
}
