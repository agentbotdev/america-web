import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/propiedades/property-card";
import { Tilt } from "@/components/ui/tilt";
import { Reveal } from "@/components/ui/reveal";
import { getDestacadas } from "@/lib/supabase/queries";

export async function FeaturedProperties() {
  // Mismos datos (DB) que el listado → IDs consistentes para favoritos/PDF.
  const destacadas = (await getDestacadas()).slice(0, 6);

  if (destacadas.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-brand">Propiedades destacadas</span>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Las que más se consultan
            </h2>
          </div>
          <Link
            href="/propiedades"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand"
          >
            Ver todas las propiedades
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destacadas.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08}>
            <Tilt className="h-full">
              <PropertyCard propiedad={p} />
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
