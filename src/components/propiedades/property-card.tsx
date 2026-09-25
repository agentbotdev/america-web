import Link from "next/link";
import { BedDouble, Bath, Ruler, Car, MapPin, Star } from "lucide-react";
import { PropertyImage } from "./property-image";
import { FavoriteButton } from "../favoritos/favorite-button";
import { WhatsappButton } from "../whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajePropiedad } from "@/lib/whatsapp";
import { formatPrecio, formatM2, labelOperacion, tituloPropiedad, suavizarMayusculas } from "@/lib/format";
import type { Propiedad } from "@/types";

// Card del catálogo: 100% clickeable. El link-overlay absoluto (z-10) cubre toda
// la card; el contenido es `pointer-events-none` para NO robar el click, y los
// elementos accionables (favorito, WhatsApp) reactivan `pointer-events-auto` por
// encima (z-20). Así entrar a la ficha funciona desde CUALQUIER punto de la card
// —no hace falta tocar el título— y los CTAs siguen siendo accionables.
// Server-compatible salvo los hijos client (FavoriteButton / WhatsappButton).

function precioCard(p: Propiedad) {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

function PropertyCard({ propiedad: p }: { propiedad: Propiedad }) {
  const href = `/propiedad/${p.slug}`;
  const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
  // Portada en RESOLUCIÓN COMPLETA (`url`), no el `thumbnail`.
  // Los thumbs de Tokko son de 260×195 y la card mide ~475px en desktop (~950
  // en pantalla retina): se estiraban casi 4× y las fotos se veían pixeladas.
  // En una inmobiliaria la foto ES el producto, así que prima la nitidez.
  // El peso (≈125 KB vs ≈10 KB) lo contiene el lazy-loading: sólo bajan las
  // cards que entran en pantalla, no las 109 del catálogo.
  const portadaSrc = portada?.url ?? portada?.thumbnail;
  // Reunión 18/09 (Tatiana: "con la dirección es con lo que más identificamos";
  // Moria: "donde está Moreno ponemos la dirección, y arriba sobre la foto
  // ponemos Moreno"): la ZONA sube a la foto en una tarjetita con fondo (por
  // las fotos oscuras) y la línea de ubicación pasa a mostrar la DIRECCIÓN.
  // Sin dirección pública cargada (1 de 138), fallback al formato anterior.
  const zonaCard = suavizarMayusculas(p.ciudad ?? p.barrio ?? p.zona);
  const direccion = suavizarMayusculas(p.direccion_publica);
  const barrioCard = suavizarMayusculas(p.barrio);
  const ubicacion = direccion
    ? [direccion, barrioCard !== zonaCard ? barrioCard : null].filter(Boolean).join(" · ")
    : [p.barrio, p.ciudad].filter(Boolean).join(", ");
  const m2 = formatM2(p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos);
  // Título LINDO (no el crudo de Tokko en mayúsculas con barras).
  const titulo = tituloPropiedad(p);
  const precio = precioCard(p);
  const aptoCredito = p.apto_credito === "Apto crédito";

  // `list-defer`: el catálogo llega a 141 cards en el DOM con scroll infinito y
  // cada una lleva backdrop-filter. Difiere layout/paint/blur de las que están
  // fuera del viewport (ver globals.css).
  return (
    <article className="card-premium list-defer group relative flex h-full flex-col overflow-hidden rounded-xl hover:-translate-y-1">
      {/* Link-overlay: cubre TODA la card por encima del contenido → 1 click
          desde cualquier punto. Los CTAs lo "perforan" con z-20. */}
      <Link href={href} className="absolute inset-0 z-10" aria-label={`Ver ${titulo}`} />

      <div className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <PropertyImage
          foto={portada}
          src={portadaSrc}
          titulo={titulo}
          tipo={p.tipo_propiedad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        {/* Velo inferior para legibilidad de los badges y profundidad al hover. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          <span className="glass rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
            {labelOperacion(p.tipo_operacion)}
          </span>
          {p.destacada_web && (
            <span className="glass inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-text">
              <Star className="size-3 fill-brand text-brand" aria-hidden="true" />
              Destacada
            </span>
          )}
        </div>
        {/* ZONA sobre la foto (reunión 18/09): tarjetita con fondo glass para
            que se lea también sobre fotos oscuras (lo marcó Tatiana). Abajo a
            la izquierda, sobre el velo — arriba viven los badges de operación. */}
        {zonaCard && (
          <span className="glass pointer-events-none absolute bottom-3 left-3 z-20 inline-flex max-w-[80%] items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-semibold text-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{zonaCard}</span>
          </span>
        )}
      </div>

      {/* Accionable por encima del overlay (z-20) → no navega al togglear. */}
      <FavoriteButton id={p.id} className="absolute right-3 top-3 z-20" />

      {/* `pointer-events-none`: el contenido no roba el click → toda la card
          navega vía el overlay. El CTA de WhatsApp reactiva los eventos. */}
      <div className="pointer-events-none relative z-20 flex flex-1 flex-col p-4">
        <h3 className="font-heading line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-brand-text">
          {titulo}
        </h3>
        {ubicacion && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{ubicacion}</span>
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {p.dormitorios != null && p.dormitorios > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3.5 shrink-0" aria-hidden="true" />
              {p.dormitorios} {p.dormitorios === 1 ? "dorm." : "dorms."}
            </span>
          )}
          {p.banos != null && p.banos > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="size-3.5 shrink-0" aria-hidden="true" />
              {p.banos} {p.banos === 1 ? "baño" : "baños"}
            </span>
          )}
          {m2 && (
            <span className="flex items-center gap-1.5">
              <Ruler className="size-3.5 shrink-0" aria-hidden="true" />
              {m2}
            </span>
          )}
          {p.cocheras != null && p.cocheras > 0 && (
            <span className="flex items-center gap-1.5">
              <Car className="size-3.5 shrink-0" aria-hidden="true" />
              {p.cocheras} {p.cocheras === 1 ? "cochera" : "cocheras"}
            </span>
          )}
        </div>

        {/* Empuja el precio + CTA al fondo para que todas las cards alineen. */}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <p className="text-xl font-semibold tabular-nums tracking-tight">{precio}</p>
            {aptoCredito && (
              <span className="rounded-sm bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-text">
                Apto crédito
              </span>
            )}
          </div>

          <div className="pointer-events-auto mt-4">
            <WhatsappButton
              numero={AGENCIA.whatsapp}
              mensaje={mensajePropiedad(AGENCIA, p)}
              label="Consultar"
              // `md` (52px) y no `sm` (36px): es el CTA por el que entra el lead
              // desde el catálogo, que es la pantalla más usada en el celular.
              // A 36px quedaba una tira finita difícil de acertar con el pulgar
              // — el cliente lo marcó puntualmente.
              size="md"
              variant="outline"
              fullWidth
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
