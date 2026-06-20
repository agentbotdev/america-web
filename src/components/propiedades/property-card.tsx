import Link from "next/link";
import { BedDouble, Bath, Ruler, Car, MapPin } from "lucide-react";
import { PropertyImage } from "./property-image";
import { FavoriteButton } from "../favoritos/favorite-button";
import { WhatsappButton } from "../whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajePropiedad } from "@/lib/whatsapp";
import { formatPrecio, formatM2, labelOperacion } from "@/lib/format";
import type { Propiedad } from "@/types";

// Card del catálogo: 100% clickeable (link-overlay absoluto), con los botones
// de favorito y WhatsApp por encima (z-10) para que sigan siendo accionables.
// Server-compatible salvo los hijos client (FavoriteButton / nada async aquí).

function precioCard(p: Propiedad) {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

function PropertyCard({ propiedad: p }: { propiedad: Propiedad }) {
  const href = `/propiedad/${p.slug}`;
  const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
  const ubicacion = [p.barrio, p.ciudad].filter(Boolean).join(", ");
  const m2 = formatM2(p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] transition-all duration-500 [border-top-color:rgba(255,255,255,0.16)] hover:-translate-y-2 hover:border-brand/45 hover:shadow-[0_28px_70px_-20px_rgba(47,77,134,0.5)]">
      {/* Link-overlay: cubre toda la card → 100% clickeable. */}
      <Link href={href} className="absolute inset-0 z-0" aria-label={p.titulo} />

      <div className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-b from-white/[0.05] to-transparent">
        <PropertyImage
          foto={portada}
          titulo={p.titulo}
          tipo={p.tipo_propiedad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <span className="glass rounded-full px-2.5 py-1 text-xs font-medium text-foreground">
            {labelOperacion(p.tipo_operacion)}
          </span>
          {p.destacada_web && (
            <span className="glass rounded-full px-2.5 py-1 text-xs font-medium text-brand">
              Destacada
            </span>
          )}
        </div>
      </div>

      <FavoriteButton id={p.id} className="absolute right-3 top-3 z-10" />

      <div className="relative z-10 flex flex-1 flex-col p-4">
        <Link href={href} className="transition-colors hover:text-brand">
          <h3 className="font-heading line-clamp-1 text-base font-semibold leading-tight">
            {p.titulo}
          </h3>
        </Link>
        {ubicacion && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{ubicacion}</span>
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {p.dormitorios != null && p.dormitorios > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3.5" />
              {p.dormitorios} {p.dormitorios === 1 ? "dorm." : "dorms."}
            </span>
          )}
          {p.banos != null && p.banos > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="size-3.5" />
              {p.banos} {p.banos === 1 ? "baño" : "baños"}
            </span>
          )}
          {m2 && (
            <span className="flex items-center gap-1.5">
              <Ruler className="size-3.5" />
              {m2}
            </span>
          )}
          {p.cocheras != null && p.cocheras > 0 && (
            <span className="flex items-center gap-1.5">
              <Car className="size-3.5" />
              {p.cocheras} {p.cocheras === 1 ? "cochera" : "cocheras"}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <p className="font-mono text-xl font-semibold tracking-tight">{precioCard(p)}</p>
          {p.apto_credito === "Apto crédito" && (
            <span className="text-xs text-brand">Apto crédito</span>
          )}
        </div>

        <div className="mt-4">
          <WhatsappButton
            numero={AGENCIA.whatsapp}
            mensaje={mensajePropiedad(AGENCIA, p)}
            label="Consultar"
            size="sm"
            variant="outline"
            fullWidth
          />
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
