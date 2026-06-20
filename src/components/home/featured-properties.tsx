import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/propiedades/property-card";
import { Tilt } from "@/components/ui/tilt";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { getDestacadas } from "@/lib/supabase/queries";
import { AGENCIA } from "@/data/agencia";
import type { Propiedad } from "@/types";

/**
 * Score de "vidriera": las que mejor venden van primero. Priorizamos las
 * propiedades más COMPLETAS (más fotos, precio a la vista, specs cargadas) —
 * son las que mejor se ven en la home y generan más consultas.
 */
function scoreVidriera(p: Propiedad): number {
  let s = 0;
  // Fotos: lo que más pesa visualmente (hasta ~12 pts).
  s += Math.min(p.fotos.length, 6) * 2;
  // Precio visible → la card no dice "Consultar" (gancho fuerte).
  if (p.precio_visible && p.precio != null) s += 6;
  // Specs físicas cargadas.
  if (p.dormitorios) s += 2;
  if (p.banos) s += 1;
  if (p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos) s += 2;
  if (p.cocheras) s += 1;
  // Descripción y amenities → ficha rica.
  if (p.descripcion?.trim()) s += 2;
  s += Math.min(p.tags.length, 4);
  // Geolocalizada → entra al mapa.
  if (p.coordenadas_lat != null && p.coordenadas_lng != null) s += 1;
  return s;
}

export async function FeaturedProperties() {
  // Mismos datos (DB) que el listado → IDs consistentes para favoritos/PDF.
  // Ordenamos por "calidad de vidriera" y mostramos sólo las mejores 6.
  const destacadas = [...(await getDestacadas())]
    .sort((a, b) => scoreVidriera(b) - scoreVidriera(a))
    .slice(0, 6);

  if (destacadas.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-sm font-medium text-brand">Propiedades destacadas</span>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Selección en {AGENCIA.zona_operacion}
            </h2>
            <p className="mt-2 text-balance text-muted-foreground">
              Una muestra de lo que tenemos disponible. Tocá cualquier propiedad
              para ver fotos, ficha completa y coordinar la visita.
            </p>
          </div>
          <Link
            href="/propiedades"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-foreground"
          >
            Ver todas las propiedades
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
        {destacadas.map((p) => (
          <RevealItem key={p.id} className="h-full">
            <Tilt className="h-full">
              <PropertyCard propiedad={p} />
            </Tilt>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
