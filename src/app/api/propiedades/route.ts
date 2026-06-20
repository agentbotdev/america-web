import { getPropiedades } from "@/lib/supabase/queries";

// Catálogo público en JSON. Lo consumen favoritos + el documento PDF + el asesor
// (client-side) para filtrar por los IDs guardados / criterios usando los DATOS
// REALES (DB), no el mock. Cacheado 2 min: lo piden varias vistas y el stock no
// cambia tan seguido.
export const revalidate = 120;

export async function GET() {
  const propiedades = await getPropiedades();
  return Response.json(propiedades, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
  });
}
