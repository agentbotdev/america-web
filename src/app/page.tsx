import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { AlliesStrip } from "@/components/home/allies-strip";
import { StatsSection } from "@/components/home/stats-section";
import { PropiedadesConMapa, type PuntoBuscable } from "@/components/home/propiedades-con-mapa";
import { ProcessSection } from "@/components/home/process-section";
import { CtaSection } from "@/components/home/cta-section";
import { getPropiedades } from "@/lib/supabase/queries";
import { datosBuscables } from "@/lib/buscador";
import { formatPrecio, tituloPropiedad } from "@/lib/format";
import { scoreVidriera } from "@/lib/vidriera";

// ISR: cookieless → HTML cacheado, revalidado cada 2 min. Navegación instantánea.
export const revalidate = 120;

export default async function HomePage() {
  // VERSIÓN 2: un solo fetch alimenta el buscador del hero (tipos y ciudades
  // derivados del stock REAL), el mapa y la grilla de destacadas.
  const todas = await getPropiedades();
  const destacadas = todas
    .filter((p) => p.destacada_web)
    .sort((a, b) => scoreVidriera(b) - scoreVidriera(a));

  const tipos = [...new Set(todas.map((p) => p.tipo_propiedad).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );
  const ciudades = [...new Set(todas.map((p) => p.ciudad).filter((c): c is string => !!c))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );

  // Pins del mapa: toda propiedad geolocalizada, con lo justo para la mini-card del
  // popup (título lindo, precio y thumbnail liviano) y para filtrarla en vivo.
  const puntos: PuntoBuscable[] = todas
    .filter((p) => p.coordenadas_lat != null && p.coordenadas_lng != null)
    .map((p) => {
      const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
      return {
        id: p.id,
        slug: p.slug,
        titulo: tituloPropiedad(p),
        precio:
          p.precio_visible && p.precio != null
            ? `${formatPrecio(p.precio, p.moneda ?? "USD")}${p.tipo_operacion === "alquiler" ? "/mes" : ""}`
            : "Consultar",
        lat: p.coordenadas_lat as number,
        lng: p.coordenadas_lng as number,
        fotoUrl: portada?.thumbnail ?? portada?.url,
        ...datosBuscables(p),
      };
    });

  return (
    <>
      <Hero tipos={tipos} ciudades={ciudades} />
      {/* Justo después del hero, las propiedades (Nacho, 08/10): el video termina adentro
          de una casa y se "aterriza" acá, con la barra, el mapa y la grilla. */}
      <PropiedadesConMapa puntos={puntos} destacadas={destacadas} />
      <AlliesStrip />
      <TrustStrip />
      <ProcessSection />
      {/* La trayectoria (las 4 cards) pasó al final: arriba demoraba la llegada a las
          propiedades (Nacho, 08/10). */}
      <StatsSection />
      <CtaSection />
    </>
  );
}
