"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, Heart, Check, Loader2 } from "lucide-react";
import { useFavorites, useHydratedFavorites } from "./favorites-store";
import { AGENCIA } from "@/data/agencia";
import { mensajeFavoritos, mensajePropiedad, waLink } from "@/lib/whatsapp";
import { formatPrecio, formatM2, tituloPropiedad, labelOperacion } from "@/lib/format";
import type { Propiedad } from "@/types";

/* Paleta del documento (CLARA, imprimible — no usa los tokens dark del sitio). */
const NAVY = "#1f3d6e"; // azul marino fuerte (headers, precio)
const NAVY_SOFT = "#eff4fb"; // tinte navy para cajas
const INK = "#0f172a";
const MUTE = "#64748b";
const LINE = "#e3e8f0";

function precioDoc(p: Propiedad): string {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

/* ------------------------------------------------------------------ */
/*  Una hoja por propiedad: foto + datos clave + specs + amenities.    */
/* ------------------------------------------------------------------ */
function PropiedadHoja({ p }: { p: Propiedad }) {
  const titulo = tituloPropiedad(p);
  const foto = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
  const ubicacion =
    p.location_full ?? [p.barrio, p.ciudad, p.provincia].filter(Boolean).join(", ");
  const m2 = formatM2(p.superficie_total ?? p.superficie_cubierta ?? p.metros_cubiertos);

  // Specs físicas del inmueble (solo las que existen).
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

  return (
    <article className="doc-page mb-10" style={{ color: INK }}>
      {/* Encabezado de la propiedad: foto + datos clave */}
      <div className="doc-avoid grid gap-6 sm:grid-cols-[1.05fr_1fr]">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-2xl"
          style={{ background: "#f6f8fb", border: `1px solid ${LINE}` }}
        >
          {foto?.url ? (
            <Image
              src={foto.url}
              alt={foto.alt || titulo}
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold"
              style={{ background: NAVY_SOFT, color: NAVY }}
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

          <h2 className="mt-2 text-2xl font-bold leading-tight" style={{ color: INK }}>
            {titulo}
          </h2>
          {ubicacion && (
            <p className="mt-1 text-sm" style={{ color: MUTE }}>
              {ubicacion}
            </p>
          )}
          <p className="mt-3 font-mono text-3xl font-bold" style={{ color: NAVY }}>
            {precioDoc(p)}
          </p>

          {/* Specs rápidas */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
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
      </div>

      {/* Descripción */}
      {p.descripcion && (
        <div className="doc-avoid mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>
            Descripción
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed" style={{ color: INK }}>
            {p.descripcion}
          </p>
        </div>
      )}

      {/* Amenities / servicios (tags) */}
      {p.tags.length > 0 && (
        <div className="doc-avoid mt-5">
          <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>
            Características y servicios
          </h3>
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
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Documento: lee favoritos (o ?solo=<id>) y arma la vista imprimible. */
/* ------------------------------------------------------------------ */
export function FavoritosDoc() {
  const params = useSearchParams();
  const solo = params.get("solo");
  const { ids, hydrated } = useHydratedFavorites();
  const clear = useFavorites((s) => s.clear);

  // Lee el catálogo REAL (DB en vivo / mock en local) — NO el mock importado.
  // Así los IDs guardados (tokko_id) matchean con los datos correctos.
  const [todos, setTodos] = useState<Propiedad[] | null>(null);
  useEffect(() => {
    let activo = true;
    fetch("/api/propiedades")
      .then((r) => r.json())
      .then((d: Propiedad[]) => activo && setTodos(d))
      .catch(() => activo && setTodos([]));
    return () => {
      activo = false;
    };
  }, []);

  const lista: Propiedad[] =
    todos == null
      ? []
      : solo
        ? todos.filter((p) => p.id === solo)
        : todos.filter((p) => ids.includes(p.id));

  const a = AGENCIA;
  const titulo = solo ? "Ficha de la propiedad" : "Mi selección de propiedades";
  const waHref =
    solo && lista[0]
      ? waLink(a.whatsapp, mensajePropiedad(a, lista[0]))
      : waLink(a.whatsapp, mensajeFavoritos(a, lista));

  // Cargando catálogo o store sin hidratar: loader.
  if (todos == null || (!hydrated && !solo)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  if (lista.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <Heart className="size-12 text-muted-foreground/40" />
        <h1 className="text-xl font-bold">Todavía no elegiste propiedades</h1>
        <p className="text-sm text-muted-foreground">
          Guardá las que te gusten con el corazón y volvé acá para exportarlas en PDF.
        </p>
        <Link
          href="/catalogo"
          className="glow-brand rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="doc-shell mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Barra de acciones — NO se imprime */}
      <div data-no-print className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al catálogo
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {!solo && lista.length > 0 && (
            <button
              onClick={clear}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-destructive"
            >
              Vaciar
            </button>
          )}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Compartir por WhatsApp
          </a>
          <button
            onClick={() => window.print()}
            className="glow-brand inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Printer className="size-4" /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Documento claro imprimible */}
      <div className="doc-print rounded-3xl bg-white p-6 text-[#0f172a] shadow-2xl shadow-black/40 sm:p-10">
        {/* Encabezado del documento */}
        <header
          className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b pb-5"
          style={{ borderColor: NAVY }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: NAVY }}
            >
              {a.nombre}
            </p>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: INK }}>
              {titulo}
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: MUTE }}>
              {a.tagline}
            </p>
          </div>
          <div className="text-right text-sm" style={{ color: MUTE }}>
            <p className="font-semibold" style={{ color: INK }}>
              {lista.length} {lista.length === 1 ? "propiedad" : "propiedades"}
            </p>
            <p>WhatsApp +{a.whatsapp.replace(/[^\d]/g, "")}</p>
            <p>{a.ciudad}</p>
          </div>
        </header>

        {lista.map((p) => (
          <PropiedadHoja key={p.id} p={p} />
        ))}

        {/* Pie del documento */}
        <footer
          className="mt-8 border-t pt-4 text-center text-xs"
          style={{ borderColor: LINE, color: MUTE }}
        >
          {a.nombre} · {[a.direccion, a.ciudad].filter(Boolean).join(", ")} · {a.horario}
          <br />
          Documento generado desde la web. Precios y disponibilidad sujetos a confirmación.
        </footer>
      </div>
    </div>
  );
}
