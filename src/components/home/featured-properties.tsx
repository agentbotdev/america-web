import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/propiedades/property-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { AGENCIA } from "@/data/agencia";
import type { Propiedad } from "@/types";

/**
 * Score de "vidriera": las que mejor venden van primero. Priorizamos las
 * propiedades más COMPLETAS (más fotos, precio a la vista, specs cargadas) —
 * son las que mejor se ven en la home y generan más consultas.
 * Exportado: page.tsx ordena UNA vez y reparte entre el deck del hero y esta grilla.
 */
export function scoreVidriera(p: Propiedad): number {
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

export function FeaturedProperties({ propiedades }: { propiedades: Propiedad[] }) {
  // Los datos llegan YA ordenados por vidriera desde page.tsx (fetch único a
  // Supabase compartido con el deck del hero — antes cada sección fetcheaba
  // por su cuenta y eran 2 queries idénticas por render).
  const destacadas = propiedades.slice(0, 6);

  if (destacadas.length === 0) return null;

  return (
    <section>
      {/* BANDA de color de marca a lo ancho (patrón de la web de referencia
          matiasszpira.com.ar: su sección "Propiedades Destacadas" es una banda
          del color de la casa con el título claro encima). Se usa el rojo
          PROFUNDO (--brand-text): blanco encima da 5.7:1 → AA. */}
      <div className="bg-brand-text py-12 text-center sm:py-14">
        <Reveal className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Propiedades destacadas
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance text-white/85">
            La mejor selección de inmuebles en {AGENCIA.zona_operacion}. Tocá
            cualquier propiedad para ver la ficha completa y coordinar la visita.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {destacadas.map((p) => (
            <RevealItem key={p.id} className="h-full">
              <PropertyCard propiedad={p} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-10 text-center">
          <Link
            href="/propiedades"
            className="group inline-flex h-12 items-center gap-2 rounded-md border border-brand/50 px-8 text-sm font-semibold uppercase tracking-wide text-brand-text transition hover:bg-brand hover:text-brand-foreground"
          >
            Ver todas las propiedades
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
