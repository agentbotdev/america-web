import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Building2 } from "lucide-react";
import { getPropiedadBySlug, getPropiedades } from "@/lib/supabase/queries";
import { AGENCIA } from "@/data/agencia";
import { PropertyGallery } from "@/components/propiedades/property-gallery";
import { FichaTecnica } from "@/components/propiedades/ficha-tecnica";
import { PropertyMap } from "@/components/propiedades/property-map";
import { FavoriteButton } from "@/components/favoritos/favorite-button";
import { PropertyBrochure } from "@/components/propiedades/property-brochure";
import { Badge } from "@/components/ui/badge";
import { formatPrecio, labelOperacion, tituloPropiedad } from "@/lib/format";

// ISR: cookieless + prerender por slug → click a una propiedad = instantáneo.
export const revalidate = 120;

export async function generateStaticParams() {
  const propiedades = await getPropiedades();
  return propiedades.map((p) => ({ slug: p.slug }));
}

/** Precio formateado para la ficha ("/mes" en alquiler, "Consultar" si oculto). */
function precioFicha(p: { precio?: number; precio_visible: boolean; moneda?: "USD" | "ARS"; tipo_operacion: "venta" | "alquiler" }) {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

/** Recorta un texto a ~160 chars sin cortar palabras, para meta description. */
function recortar(texto: string, max = 160) {
  const limpio = texto.trim().replace(/\s+/g, " ");
  if (limpio.length <= max) return limpio;
  return limpio.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPropiedadBySlug(slug);
  if (!p) return { title: "Propiedad no encontrada" };

  const titulo = tituloPropiedad(p);
  const desc = p.descripcion?.trim()
    ? recortar(p.descripcion)
    : `${titulo} — ${precioFicha(p)}.`;
  const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];

  return {
    title: `${titulo} · ${labelOperacion(p.tipo_operacion)}`,
    description: desc,
    alternates: { canonical: `/propiedad/${p.slug}` },
    openGraph: {
      title: `${titulo} · ${AGENCIA.nombre}`,
      description: desc,
      type: "website",
      url: `/propiedad/${p.slug}`,
      images: portada?.url
        ? [{ url: portada.url, width: 1200, height: 630, alt: titulo }]
        : [],
    },
  };
}

export default async function PropiedadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPropiedadBySlug(slug);
  if (!p) notFound();

  const titulo = tituloPropiedad(p);
  const ubicacion = [p.barrio, p.zona, p.ciudad].filter(Boolean).join(", ");
  const precio = precioFicha(p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: titulo,
    description: p.descripcion || titulo,
    url: `/propiedad/${p.slug}`,
    image: p.fotos.map((f) => f.url).filter(Boolean),
    ...(p.precio_visible && p.precio != null
      ? {
          offers: {
            "@type": "Offer",
            price: p.precio,
            priceCurrency: p.moneda ?? "USD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: p.barrio ?? p.ciudad,
      addressRegion: p.provincia,
      addressCountry: "AR",
    },
    ...(p.dormitorios ? { numberOfRoomsTotal: p.dormitorios } : {}),
    ...(p.superficie_total
      ? { floorSize: { "@type": "QuantitativeValue", value: p.superficie_total, unitCode: "MTK" } }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/propiedades"
        className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Columna izquierda */}
        <div>
          <PropertyGallery
            fotos={p.fotos}
            titulo={p.titulo}
            tipo={p.tipo_propiedad}
            tieneVideo={p.tiene_video}
          />

          {/* Título + precio + CTA (mobile): justo bajo la galería, así el usuario
              puede consultar sin scrollear toda la ficha. El aside sticky cubre desktop. */}
          <div className="mt-6 lg:hidden">
            <div className="flex flex-wrap gap-1.5">
              <Badge>{labelOperacion(p.tipo_operacion)}</Badge>
              {p.destacada_web && <Badge variant="secondary">Destacada</Badge>}
              {p.reference_code && <Badge variant="secondary">Ref. {p.reference_code}</Badge>}
            </div>
            {/* <h1> semántico ÚNICO de la página (visible en mobile, presente en el
                DOM en desktop). El aside repite el título como <p> para no duplicar h1. */}
            <h1 className="font-heading mt-3 text-2xl font-bold leading-tight">{titulo}</h1>
            {ubicacion && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" /> {ubicacion}
              </p>
            )}
            <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-brand">{precio}</p>
            {p.expensas != null && p.expensas > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                Expensas {formatPrecio(p.expensas, "ARS")}/mes
              </p>
            )}
            <div className="mt-4 flex items-start gap-2">
              <div className="flex-1">
                <PropertyBrochure propiedad={p} />
              </div>
              <FavoriteButton id={p.id} variant="inline" className="h-12 w-12" />
            </div>
          </div>

          {p.descripcion?.trim() && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold">Descripción</h2>
              <p className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
                {p.descripcion}
              </p>
            </div>
          )}

          <FichaTecnica propiedad={p} />

          <PropertyMap propiedad={p} />
        </div>

        {/* Columna derecha (sticky) */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:h-fit">
          <div className="panel-glass rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap gap-1.5">
              <Badge>{labelOperacion(p.tipo_operacion)}</Badge>
              {p.destacada_web && <Badge variant="secondary">Destacada</Badge>}
              {p.reference_code && <Badge variant="secondary">Ref. {p.reference_code}</Badge>}
            </div>

            {/* Título repetido como <p> (el <h1> de la página está en el bloque mobile). */}
            <p className="font-heading mt-3 text-2xl font-semibold leading-tight">{titulo}</p>

            {ubicacion && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" /> {ubicacion}
              </p>
            )}

            <p className="mt-4 font-mono text-3xl font-semibold tracking-tight text-brand">{precio}</p>

            {p.expensas != null && p.expensas > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="size-3.5 shrink-0" />
                Expensas {formatPrecio(p.expensas, "ARS")}/mes
              </p>
            )}

            <div className="mt-5 flex items-start gap-2">
              <div className="flex-1">
                <PropertyBrochure propiedad={p} />
              </div>
              <FavoriteButton id={p.id} variant="inline" className="h-12 w-12" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
