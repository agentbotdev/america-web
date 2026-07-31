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
import { toDeckItems } from "@/lib/deck";

// ISR: cookieless → HTML cacheado, revalidado cada 2 min. Navegación instantánea.
export const revalidate = 120;

// Deck del hero CURADO por el cliente (tokko_id): variedad de tipos y plazas
// con nombre — Miramar, Boca Ratón (Pilar), Plaza Colón (MdP), La Reja.
// Si alguna sale del catálogo, se completa con las mejores destacadas.
const DECK_IDS = ["7721258", "7747664", "7979309", "7653882"];

export default async function HomePage() {
  // UN solo fetch para toda la home: el deck toma las curadas (dos no son
  // `destacada_web`, por eso se busca sobre TODAS) y la grilla, las destacadas.
  const todas = await getPropiedades();
  const destacadas = todas
    .filter((p) => p.destacada_web)
    .sort((a, b) => scoreVidriera(b) - scoreVidriera(a));

  const curadas = DECK_IDS.flatMap((id) => todas.find((p) => p.id === id) ?? []);
  const deckProps = [
    ...curadas,
    ...destacadas.filter((p) => !DECK_IDS.includes(p.id)),
  ].slice(0, 4);

  return (
    <>
      <Hero deck={toDeckItems(deckProps)} />
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
