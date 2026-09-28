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

// ISR: cookieless → HTML cacheado, revalidado cada 2 min. Navegación instantánea.
export const revalidate = 120;

export default async function HomePage() {
  // VERSIÓN 2: un solo fetch alimenta el buscador del hero (tipos y ciudades
  // derivados del stock REAL) y la grilla de destacadas.
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

  return (
    <>
      <Hero tipos={tipos} ciudades={ciudades} />
      {/* UNA sola cinta bajo el hero (feedback del cliente: dos marquees
          seguidos ocupaban mucho espacio). Los beneficios (TrustStrip) se
          mudaron abajo de la grilla de propiedades. */}
      <AlliesStrip />
      <StatsSection />
      <FeaturedProperties propiedades={destacadas} />
      <TrustStrip />
      <ProcessSection />
      <CtaSection />
    </>
  );
}
