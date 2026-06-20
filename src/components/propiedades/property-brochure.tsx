"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Printer,
  X,
  Check,
  MapPin,
  Phone,
  AtSign,
  FileDown,
} from "lucide-react";
import { AGENCIA } from "@/data/agencia";
import { mensajePropiedad, waLink } from "@/lib/whatsapp";
import { formatPrecio, formatM2, tituloPropiedad, labelOperacion } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Propiedad } from "@/types";

/* Paleta del brochure — CLARA e imprimible, con la marca REAL de América (rojo).
   No usa los tokens dark del sitio: un PDF se imprime en blanco. */
const BRAND = "#dc2626"; // rojo América Cardozo (logo)
const BRAND_SOFT = "#fef2f2"; // tinte rojo para cajas/badges
const INK = "#0f172a";
const MUTE = "#64748b";
const LINE = "#e3e8f0";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://america-cardozo.vercel.app";

function urlPropiedad(p: Propiedad) {
  return `${SITE_URL}/propiedad/${p.slug}`;
}

function precioBrochure(p: Propiedad): string {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

/* QR del link de la propiedad — sin librerías nuevas, vía servicio público.
   Es un <img> normal (no next/image) para no tener que registrar el dominio en
   remotePatterns. Si la red falla, el link impreso debajo sigue sirviendo. */
function qrSrc(url: string, size = 160) {
  const data = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${data}`;
}

/* ------------------------------------------------------------------ */
/*  El documento imprimible de UNA propiedad (overlay full-screen).    */
/* ------------------------------------------------------------------ */
function BrochureDoc({ p, onClose }: { p: Propiedad; onClose: () => void }) {
  const titulo = tituloPropiedad(p);
  const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
  // Hasta 4 fotos extra (sin planos ni portada) para la tira de galería chica.
  const galeria = p.fotos
    .filter((f) => f !== portada && !f.es_plano && f.url)
    .slice(0, 4);
  const ubicacion =
    p.location_full ?? [p.barrio, p.zona, p.ciudad, p.provincia].filter(Boolean).join(", ");
  const m2 = formatM2(p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos);
  const url = urlPropiedad(p);

  // Specs físicas (solo las que existen).
  const specs: { label: string; value: string }[] = [
    { label: "Operación", value: labelOperacion(p.tipo_operacion) },
    { label: "Tipo", value: p.tipo_propiedad },
    ...(p.dormitorios ? [{ label: "Dormitorios", value: String(p.dormitorios) }] : []),
    ...(p.banos ? [{ label: "Baños", value: String(p.banos) }] : []),
    ...(p.toilettes ? [{ label: "Toilettes", value: String(p.toilettes) }] : []),
    ...(p.ambientes ? [{ label: "Ambientes", value: String(p.ambientes) }] : []),
    ...(p.cocheras ? [{ label: "Cocheras", value: String(p.cocheras) }] : []),
    ...(m2 ? [{ label: "Superficie", value: m2 }] : []),
    ...(formatM2(p.superficie_cubierta)
      ? [{ label: "Sup. cubierta", value: formatM2(p.superficie_cubierta)! }]
      : []),
    ...(p.antiguedad != null
      ? [{ label: "Antigüedad", value: p.antiguedad === 0 ? "A estrenar" : `${p.antiguedad} años` }]
      : []),
    ...(p.plantas ? [{ label: "Plantas", value: String(p.plantas) }] : []),
    ...(p.orientacion ? [{ label: "Orientación", value: p.orientacion }] : []),
    ...(p.expensas
      ? [{ label: "Expensas", value: `${formatPrecio(p.expensas, "ARS")}/mes` }]
      : []),
    ...(p.reference_code ? [{ label: "Referencia", value: p.reference_code }] : []),
  ];

  const tel = `+${AGENCIA.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <div
      id="brochure-root"
      className="doc-shell fixed inset-0 z-[120] overflow-y-auto bg-slate-900/70 backdrop-blur-sm"
    >
      {/* Estilo de print AUTOCONTENIDO: en la impresión, sólo el brochure existe.
          No toca globals.css — es un <style> scoped del propio componente. */}
      <style>{`
        @media print {
          body > *:not(#brochure-root) { display: none !important; }
          #brochure-root {
            position: static !important;
            overflow: visible !important;
            background: #fff !important;
            backdrop-filter: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Barra de acciones — NO se imprime */}
        <div data-no-print className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/80">Vista previa del brochure</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
            >
              <X className="size-4" /> Cerrar
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: BRAND }}
            >
              <Printer className="size-4" /> Descargar / Imprimir
            </button>
          </div>
        </div>

        {/* Documento claro imprimible */}
        <div className="doc-print rounded-3xl bg-white p-6 text-[#0f172a] shadow-2xl shadow-black/40 sm:p-9">
          <article className="doc-page" style={{ color: INK }}>
            {/* Cabecera con wordmark de marca */}
            <header
              className="doc-avoid mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-4"
              style={{ borderColor: BRAND }}
            >
              <div>
                <p
                  className="text-lg font-black uppercase tracking-[0.18em]"
                  style={{ color: BRAND }}
                >
                  {AGENCIA.logoTexto}
                </p>
                <p className="mt-0.5 text-sm" style={{ color: MUTE }}>
                  {AGENCIA.tagline}
                </p>
              </div>
              <div className="text-right text-xs" style={{ color: MUTE }}>
                <p className="font-semibold" style={{ color: INK }}>
                  WhatsApp {tel}
                </p>
                {AGENCIA.redes.instagram && <p>@americacardozovende</p>}
              </div>
            </header>

            {/* Foto portada + datos clave */}
            <div className="doc-avoid grid gap-5 sm:grid-cols-[1.15fr_1fr]">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{ background: "#f6f8fb", border: `1px solid ${LINE}` }}
              >
                {portada?.url ? (
                  <Image
                    src={portada.url}
                    alt={portada.alt || titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, 460px"
                    className="object-cover"
                    priority
                  />
                ) : null}
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{ background: BRAND_SOFT, color: BRAND }}
                  >
                    {labelOperacion(p.tipo_operacion)}
                  </span>
                  {p.destacada_web && (
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-semibold"
                      style={{ background: "#fef3c7", color: "#92400e" }}
                    >
                      Destacada
                    </span>
                  )}
                  {p.apto_credito === "Apto crédito" && (
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-medium"
                      style={{ background: "#f1f5f9", color: MUTE }}
                    >
                      Apto crédito
                    </span>
                  )}
                </div>

                <h1 className="mt-2 text-2xl font-bold leading-tight" style={{ color: INK }}>
                  {titulo}
                </h1>
                {ubicacion && (
                  <p
                    className="mt-1 flex items-center gap-1 text-sm"
                    style={{ color: MUTE }}
                  >
                    <MapPin className="size-3.5 shrink-0" /> {ubicacion}
                  </p>
                )}
                <p className="mt-3 font-mono text-3xl font-bold" style={{ color: BRAND }}>
                  {precioBrochure(p)}
                </p>
              </div>
            </div>

            {/* Tira de galería chica */}
            {galeria.length > 0 && (
              <div className="doc-avoid mt-3 grid grid-cols-4 gap-2">
                {galeria.map((f, i) => (
                  <div
                    key={f.url + i}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl"
                    style={{ background: "#f6f8fb", border: `1px solid ${LINE}` }}
                  >
                    <Image
                      src={f.url}
                      alt={f.alt || `${titulo} — foto ${i + 2}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Specs completas */}
            <div className="doc-avoid mt-6">
              <h2
                className="text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: BRAND }}
              >
                Características
              </h2>
              <dl className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5 text-sm sm:grid-cols-3">
                {specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex justify-between gap-2 border-b pb-1"
                    style={{ borderColor: LINE }}
                  >
                    <dt style={{ color: MUTE }}>{s.label}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Descripción */}
            {p.descripcion?.trim() && (
              <div className="doc-avoid mt-5">
                <h2
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: BRAND }}
                >
                  Descripción
                </h2>
                <p
                  className="mt-2 whitespace-pre-line text-sm leading-relaxed"
                  style={{ color: INK }}
                >
                  {p.descripcion}
                </p>
              </div>
            )}

            {/* Características y servicios (tags) */}
            {p.tags.length > 0 && (
              <div className="doc-avoid mt-5">
                <h2
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: BRAND }}
                >
                  Comodidades y servicios
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: "#166534" }}
                    >
                      <Check className="size-3.5" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contacto + QR */}
            <div
              className="doc-avoid mt-7 flex flex-wrap items-center gap-5 rounded-2xl p-5"
              style={{ background: BRAND_SOFT, border: `1px solid ${LINE}` }}
            >
              <div className="min-w-0 flex-1">
                <p
                  className="text-base font-black uppercase tracking-[0.16em]"
                  style={{ color: BRAND }}
                >
                  {AGENCIA.logoTexto}
                </p>
                <p
                  className="mt-1.5 flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: INK }}
                >
                  <Phone className="size-4" /> WhatsApp {tel}
                </p>
                {AGENCIA.redes.instagram && (
                  <p
                    className="mt-0.5 flex items-center gap-1.5 text-sm"
                    style={{ color: MUTE }}
                  >
                    <AtSign className="size-4" /> @americacardozovende
                  </p>
                )}
                <p
                  className="mt-0.5 flex items-center gap-1.5 text-sm"
                  style={{ color: MUTE }}
                >
                  <MapPin className="size-4 shrink-0" /> {AGENCIA.direccion}
                </p>
                <p className="mt-2 break-all text-xs" style={{ color: BRAND }}>
                  {url}
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc(url)}
                alt="Escaneá para ver la propiedad online"
                width={104}
                height={104}
                className="shrink-0 rounded-lg bg-white p-1.5"
                style={{ width: 104, height: 104, border: `1px solid ${LINE}` }}
              />
            </div>
          </article>

          {/* Pie */}
          <footer
            className="doc-avoid mt-6 border-t pt-3 text-center text-[11px]"
            style={{ borderColor: LINE, color: MUTE }}
          >
            {AGENCIA.nombre} · +{AGENCIA.anios_experiencia} años acompañando · {AGENCIA.ciudad}
            <br />
            Brochure generado desde la web. Precios y disponibilidad sujetos a confirmación.
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Acciones de la ficha: WhatsApp + Descargar brochure (juntos).      */
/* ------------------------------------------------------------------ */
export function PropertyBrochure({ propiedad: p }: { propiedad: Propiedad }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Bloquea el scroll del fondo + cierra con Escape mientras el overlay está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={waLink(AGENCIA.whatsapp, mensajePropiedad(AGENCIA, p))}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-all active:scale-[0.98]",
            "bg-whatsapp hover:brightness-95",
          )}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.04zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          Consultar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand/40 px-5 text-sm font-semibold text-brand transition-all hover:bg-brand/10 active:scale-[0.98]"
        >
          <FileDown className="size-5" /> Descargar brochure
        </button>
      </div>

      {mounted && open
        ? createPortal(<BrochureDoc p={p} onClose={() => setOpen(false)} />, document.body)
        : null}
    </>
  );
}

export default PropertyBrochure;
