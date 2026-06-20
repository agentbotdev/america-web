import type { Metadata } from "next";
import { getPropiedades } from "@/lib/supabase/queries";
import { CatalogoBrowser, FILTROS_VACIOS } from "@/components/propiedades/catalogo-browser";

// ISR: el catálogo se regenera cada 120s. El filtrado/orden es 100% client-side
// (en memoria), así que una sola página estática sirve a todas las combinaciones.
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Propiedades en venta y alquiler en Argentina — América Cardozo",
  description:
    "Casas, departamentos, PH, terrenos y locales en venta y alquiler en todo el país. Filtrá por operación, tipo, zona, dormitorios y precio, y consultá por WhatsApp al instante con América Cardozo.",
  alternates: { canonical: "/propiedades" },
  openGraph: {
    title: "Propiedades en venta y alquiler en Argentina — América Cardozo",
    description:
      "Casas, departamentos, PH, terrenos y locales en venta y alquiler en todo el país. Encontrá tu próxima propiedad y consultá al instante por WhatsApp.",
    url: "/propiedades",
    type: "website",
  },
};

type SP = Promise<Record<string, string | undefined>>;

export default async function PropiedadesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const todas = await getPropiedades();

  // Listas de filtros derivadas del stock real (orden alfabético).
  const tipos = [...new Set(todas.map((p) => p.tipo_propiedad).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );
  const barrios = [...new Set(todas.map((p) => p.barrio).filter((b): b is string => !!b))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );

  // Filtros iniciales desde el URL (deep-links del hero / búsquedas guardadas).
  // A partir de la hidratación, el filtrado es client-side (instantáneo).
  const initial = {
    ...FILTROS_VACIOS,
    q: sp.q ?? "",
    operacion: sp.operacion ?? "all",
    tipo: sp.tipo ?? "all",
    barrio: sp.barrio ?? "all",
    dormitorios: sp.dormitorios ?? "all",
    banos: sp.banos ?? "all",
    precio_min: sp.precio_min ?? "",
    precio_max: sp.precio_max ?? "",
    superficie_min: sp.superficie_min ?? "all",
    orden: sp.orden ?? "destacadas",
  };

  return (
    <>
      <div className="section-dark border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand">Catálogo · Todo el país</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
            Encontrá tu próxima propiedad
          </h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Casas, departamentos, PH, terrenos y locales en venta y alquiler en toda la Argentina.
            Filtrá por operación, tipo, zona, dormitorios o precio, y consultá al instante por
            WhatsApp. El equipo de América Cardozo te acompaña en cada paso.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CatalogoBrowser propiedades={todas} tipos={tipos} barrios={barrios} initial={initial} />
      </div>
    </>
  );
}
