import type { Metadata } from "next";
import { getPropiedades } from "@/lib/supabase/queries";
import { CatalogoBrowser } from "@/components/propiedades/catalogo-browser";

// ISR REAL: el catálogo se regenera cada 120s y se sirve del CDN.
// OJO — acá NO se lee `searchParams`: leerlo volvía la ruta DINÁMICA (un
// render en el servidor por CADA visita: cache MISS + 2-3 queries a Supabase,
// ~1-2s de TTFB medidos). Los filtros de la URL (deep-links del hero) los
// aplica el cliente tras el mount, dentro de CatalogoBrowser.
export const revalidate = 120;

export const metadata: Metadata = {
  // SIN "— América Cardozo": el layout ya lo agrega vía `title.template`.
  // Antes rendereaba la marca dos veces y el título superaba largamente los
  // ~60 caracteres que Google muestra, cortando lo importante.
  title: "Propiedades en venta y alquiler en Argentina",
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

export default async function PropiedadesPage() {
  const todas = await getPropiedades();

  // Listas de filtros derivadas del stock real (orden alfabético).
  const tipos = [...new Set(todas.map((p) => p.tipo_propiedad).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );
  const barrios = [...new Set(todas.map((p) => p.barrio).filter((b): b is string => !!b))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );

  // PAYLOAD LIVIANO: CatalogoBrowser es client component, así que TODO lo que
  // recibe viaja serializado en el HTML. Las descripciones completas eran ~70KB
  // que la card no muestra (la búsqueda libre ahora matchea sobre los tags, que
  // encima son datos estructurados: "pileta", "quincho"). El thumbnail de la
  // portada tampoco se usa cuando hay `url`. La ficha sigue trayendo todo.
  const livianas = todas.map((p) => ({
    ...p,
    descripcion: "",
    location_full: undefined,
    fotos: p.fotos.map((f) => (f.url ? { ...f, thumbnail: undefined } : f)),
  }));

  return (
    <>
      {/* Sin banda ni border-b: fondo uniforme (feedback previo del cliente). */}
      <div className="mx-auto grid max-w-7xl items-center gap-x-8 px-4 py-10 sm:px-6 md:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-brand-text">Catálogo · Todo el país</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
            Encontrá tu próximo inmueble
          </h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Casas, departamentos, PH, terrenos y locales en venta y alquiler en toda la Argentina.
            Filtrá por operación, tipo, zona, dormitorios o precio, y consultá al instante por
            WhatsApp. El equipo de América Cardozo te acompaña en cada paso.
          </p>
        </div>
        {/* El deck de destacadas se QUITÓ de acá (pedido del cliente: "sacar en
            la parte inmuebles las cards del hero, así no es tan repetitivo y
            arranca de una").
            Tenía sentido: quien entra a /propiedades ya decidió que quiere ver
            el catálogo — mostrarle primero el mismo librito que ya vio en la
            home lo hace bajar antes de llegar a lo que vino a buscar. Además
            ahorra 4 imágenes `priority` que competían con el LCP del catálogo. */}
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CatalogoBrowser propiedades={livianas} tipos={tipos} barrios={barrios} />
      </div>
    </>
  );
}
