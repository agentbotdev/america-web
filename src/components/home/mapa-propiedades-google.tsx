"use client";

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  APIProvider,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { calcularEncuadre, escalaPin, iconoDelTipo, svgDelPin, TAMANO_PIN, type PuntoMapa } from "./mapa-pines";

// MAPA DE LA HOME CON GOOGLE (Nacho, 24/11: "que sean todos el nuevo"). Mismos pines con el
// ícono del tipo, misma mini-card y mismo encuadre que el de OpenStreetMap (mapa-pines.ts),
// más satélite y Street View. Lo carga `MapaPropiedades` recién cuando la sección está por
// entrar en pantalla: el mapa JavaScript de Google se cobra por carga (10.000 gratis por mes).
//
// Si Google no anda —clave rechazada, cupo diario agotado, script caído— se avisa con
// `onFallo` y la home vuelve sola al mapa de OpenStreetMap.

const MAP_ID = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "").trim() || "DEMO_MAP_ID";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

/** Encuadra el mapa en la zona más densa de los pines mostrados, como el de OpenStreetMap. */
function Encuadre({ puntos }: { puntos: PuntoMapa[] }) {
  const mapa = useMap();
  useEffect(() => {
    const e = calcularEncuadre(puntos);
    if (!mapa || !e) return;
    mapa.fitBounds({ south: e.sur, west: e.oeste, north: e.norte, east: e.este }, e.padding);
    // fitBounds no tiene zoom máximo: con un solo pin se iría al nivel de la vereda.
    const escucha = google.maps.event.addListenerOnce(mapa, "idle", () => {
      const zoom = mapa.getZoom();
      if (zoom != null && zoom > e.maxZoom) mapa.setZoom(e.maxZoom);
    });
    return () => escucha.remove();
  }, [mapa, puntos]);
  return null;
}

/** Pin con el ícono del tipo. Memo: elegir una mini-card no redibuja los 160 pines. */
const Pin = memo(function Pin({ p, onElegir }: { p: PuntoMapa; onElegir: (p: PuntoMapa) => void }) {
  const icono = useMemo(() => ({ __html: svgDelPin(iconoDelTipo(p.tipo)) }), [p.tipo]);
  return (
    <AdvancedMarker
      position={{ lat: p.lat, lng: p.lng }}
      title={p.titulo}
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
      onClick={() => onElegir(p)}
    >
      <div dangerouslySetInnerHTML={icono} style={{ cursor: "pointer" }} />
    </AdvancedMarker>
  );
});

export function MapaPropiedadesGoogle({
  puntos,
  visibles,
  clave,
  onFallo,
}: {
  puntos: PuntoMapa[];
  /** Ids de los pins a mostrar; `null` = todos. */
  visibles: Set<string> | null;
  clave: string;
  onFallo: () => void;
}) {
  const contRef = useRef<HTMLDivElement>(null);
  const [elegido, setElegido] = useState<PuntoMapa | null>(null);
  const [escala, setEscala] = useState(1);
  // Los pines se ponen recién cuando el mapa cargó sus imágenes: eso prueba que Google aceptó la
  // clave y había cupo. Si los pines ya estaban y Google fallaba, al desmontarlos para pasar a
  // OpenStreetMap cada uno tiraba un error y React tiraba abajo la home entera (probado 25/11).
  const [listo, setListo] = useState(false);

  const mostrados = useMemo(
    () => (visibles ? puntos.filter((p) => visibles.has(p.id)) : puntos),
    [puntos, visibles],
  );
  // Si la búsqueda saca del mapa la propiedad de la mini-card abierta, la mini-card se cierra.
  const elegidoVisible = elegido && mostrados.some((p) => p.id === elegido.id) ? elegido : null;

  const inicial = useMemo(() => calcularEncuadre(puntos), [puntos]);

  useEffect(() => {
    // Google llama a gm_authFailure cuando rechaza la clave (dominio no autorizado, API
    // apagada). Con el cupo diario agotado NO la llama: dibuja su cartel de error adentro del
    // mapa (.gm-err-container), y eso se detecta mirando el contenedor.
    const previo = window.gm_authFailure;
    window.gm_authFailure = () => {
      previo?.();
      onFallo();
    };
    const cont = contRef.current;
    const vigia = new MutationObserver(() => {
      if (cont?.querySelector(".gm-err-container")) onFallo();
    });
    if (cont) vigia.observe(cont, { childList: true, subtree: true });
    return () => {
      window.gm_authFailure = previo;
      vigia.disconnect();
    };
  }, [onFallo]);

  return (
    <div
      ref={contRef}
      aria-label="Mapa de propiedades"
      className="relative z-0 h-[340px] w-full bg-muted sm:h-[420px] lg:h-[480px]"
      // Los pines leen --escala-pin: chicos con el mapa alejado, completos de cerca.
      style={{ "--escala-pin": String(escala) } as CSSProperties}
    >
      <APIProvider apiKey={clave} language="es" region="AR" onError={onFallo}>
        <Map
          mapId={MAP_ID}
          style={{ width: "100%", height: "100%" }}
          defaultBounds={
            inicial
              ? { south: inicial.sur, west: inicial.oeste, north: inicial.norte, east: inicial.este, padding: inicial.padding }
              : undefined
          }
          // "cooperative": en el celu el mapa se mueve con DOS dedos (con uno se scrollea la
          // página) y en la compu se hace zoom con Ctrl + rueda. Es lo que hacía a mano el
          // "Tocá para mover el mapa" del mapa anterior (Nacho, 09/10: "se traba para scrollear").
          gestureHandling="cooperative"
          clickableIcons={false}
          mapTypeControl
          streetViewControl
          fullscreenControl
          onTilesLoaded={() => setListo(true)}
          onZoomChanged={(ev) => setEscala(escalaPin(ev.detail.zoom))}
          onClick={() => setElegido(null)}
        >
          {listo && <Encuadre puntos={mostrados} />}
          {listo && mostrados.map((p) => <Pin key={p.id} p={p} onElegir={setElegido} />)}
          {listo && elegidoVisible && (
            <InfoWindow
              position={{ lat: elegidoVisible.lat, lng: elegidoVisible.lng }}
              pixelOffset={[0, -TAMANO_PIN / 2]}
              headerDisabled
              onClose={() => setElegido(null)}
            >
              {/* En el celu el mapa mide 340 px y Google le da a la ventanita ~175 px: la mini-card
                  vertical (200 px) salía con scroll y sin el "Ver ficha" (QA 25/11). Ahí va
                  horizontal (~80 px); desde sm, con el mapa más alto, vertical con la foto grande. */}
              <Link
                href={`/propiedad/${elegidoVisible.slug}`}
                className="flex w-[240px] items-center gap-2.5 text-[#1a1a1a] no-underline sm:block sm:w-[200px]"
              >
                {elegidoVisible.fotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura de un popup de Google: next/image no aporta acá
                  <img
                    src={elegidoVisible.fotoUrl}
                    alt=""
                    loading="lazy"
                    className="block size-[76px] shrink-0 rounded object-cover sm:h-[110px] sm:w-full"
                  />
                )}
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-snug sm:mt-2">{elegidoVisible.titulo}</p>
                  <p className="mt-1 text-[15px] font-bold tabular-nums sm:mt-1.5">{elegidoVisible.precio}</p>
                  <p className="mb-0.5 mt-1 text-xs font-semibold text-[#c41f0d] sm:mt-1.5">Ver ficha →</p>
                </div>
              </Link>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
