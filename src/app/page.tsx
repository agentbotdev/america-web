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
  // VERSIÓN 2: el hero ya no lleva deck de cartas — un solo fetch para las
  // destacadas de la grilla.
  const todas = await getPropiedades();
  const destacadas = todas
    .filter((p) => p.destacada_web)
    .sort((a, b) => scoreVidriera(b) - scoreVidriera(a));

  return (
    <>
      <Hero />
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
