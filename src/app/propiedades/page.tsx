import type { Metadata } from "next";
import { getPropiedades } from "@/lib/supabase/queries";
import { CatalogoBrowser, FILTROS_VACIOS } from "@/components/propiedades/catalogo-browser";
import { interpretarBusqueda } from "@/lib/buscador";

// ISR: el catálogo se regenera cada 120s. El filtrado/orden es 100% client-side
// (en memoria), así que una sola página estática sirve a todas las combinaciones.
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

  // BÚSQUEDA COMBINADA (pedido del cliente: "poder poner varias cosas de filtro
  // como casa en venta o depto en alquiler").
  // El buscador del hero manda una frase libre en `q`. Antes se usaba como
  // búsqueda literal sobre título/barrio/descripción, así que "casa en venta"
  // daba CERO resultados: ninguna propiedad tiene esa frase escrita.
  // Ahora la frase se interpreta y cada parte va al filtro que le corresponde.
  // Los parámetros EXPLÍCITOS de la URL (?operacion=…&tipo=…) tienen prioridad:
  // vienen de los chips de acceso rápido, que ya son inequívocos.
  const interpretada = interpretarBusqueda(sp.q ?? "");

  // Filtros iniciales desde el URL (deep-links del hero / búsquedas guardadas).
  // A partir de la hidratación, el filtrado es client-side (instantáneo).
  const initial = {
    ...FILTROS_VACIOS,
    q: interpretada.texto,
    operacion: sp.operacion ?? interpretada.operacion ?? "all",
    tipo: sp.tipo ?? interpretada.tipo ?? "all",
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
      {/* HEADER COMPACTO (pedido del cliente): título → buscador → props.
          Sin subtítulo ni columnas — el buscador completo arranca de una. */}
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-8 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-text">Catálogo · Todo el país</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
          Encontrá tu próximo inmueble
        </h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <CatalogoBrowser propiedades={todas} tipos={tipos} barrios={barrios} initial={initial} />
      </div>
    </>
  );
}
