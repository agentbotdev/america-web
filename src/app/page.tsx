import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { ProcessSection } from "@/components/home/process-section";
import { CtaSection } from "@/components/home/cta-section";

// ISR: cookieless → HTML cacheado, revalidado cada 2 min. Navegación instantánea.
export const revalidate = 120;

export default function HomePage() {
  // El hero es una pieza de marca (gradiente + blob 3D decorativo), no un listado puntual.
  return (
    <>
      <Hero />
      <TrustStrip />
      <StatsSection />
      <FeaturedProperties />
      <ProcessSection />
      <CtaSection />
    </>
  );
}
