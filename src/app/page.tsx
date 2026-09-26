import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { AlliesStrip } from "@/components/home/allies-strip";
import { StatsSection } from "@/components/home/stats-section";
import {
  FeaturedProperties,
  scoreVidriera,
} from "@/components/home/featured-properties";
import { ProcessSection } from "@/components/home/process-section";
import { CtaSection } from "@/components/home/cta-section";
import { getPropiedades } from "@/lib/supabase/queries";
import { formatPrecio, tituloPropiedad } from "@/lib/format";

// ISR: cookieless → HTML cacheado, revalidado cada 2 min. Navegación instantánea.
export const revalidate = 120;

export default async function HomePage() {
  // VERSIÓN 3: el hero lleva el mapa — un solo fetch alimenta pins del mapa
  // y grilla de destacadas.
  const todas = await getPropiedades();
  const destacadas = todas
    .filter((p) => p.destacada_web)
    .sort((a, b) => scoreVidriera(b) - scoreVidriera(a));

  // Pins del mapa: toda propiedad geolocalizada, con lo justo para la
  // mini-card del popup (título lindo, precio y thumbnail liviano).
  const puntos = todas
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
      };
    });

  return (
    <>
      <Hero puntos={puntos} />
      <TrustStrip />
      {/* Instituciones de las que forma parte la martillera. */}
      <AlliesStrip />
      <StatsSection />
      <FeaturedProperties propiedades={destacadas} />
      <ProcessSection />
      <CtaSection />
    </>
  );
}
