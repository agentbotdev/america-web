// Generador de links de WhatsApp con mensaje precargado (wa.me).
// La tesis: el cliente llega al WhatsApp del vendedor con TODA la info de la
// propiedad ya cargada. Cero fricción, cero "contame de nuevo".

import type { Agencia, Propiedad } from "@/types";
import { tituloPropiedad, formatPrecio, formatM2 } from "@/lib/format";

/** Construye el link oficial de WhatsApp con el texto urlencodeado. */
export function waLink(numero: string, mensaje: string) {
  const num = numero.replace(/[^\d]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://america-cardozo.vercel.app";

function urlPropiedad(p: Propiedad) {
  return `${SITE_URL}/propiedad/${p.slug}`;
}

function precioTexto(p: Propiedad) {
  if (!p.precio_visible || p.precio == null) return "Consultar precio";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

// Ficha corta de specs según el tipo (los terrenos no tienen dormitorios).
function specs(p: Propiedad): string {
  const partes = [
    p.dormitorios ? `🛏️ ${p.dormitorios} dorm.` : null,
    p.banos ? `🚿 ${p.banos} baño${p.banos > 1 ? "s" : ""}` : null,
    p.cocheras ? `🚗 ${p.cocheras} coch.` : null,
    formatM2(p.superficie_total) ? `📐 ${formatM2(p.superficie_total)}` : null,
    p.expensas ? `🏢 Expensas ${formatPrecio(p.expensas, "ARS")}` : null,
  ].filter(Boolean);
  return partes.join("\n");
}

/** Mensaje genérico (header, hero, flotante). */
export function mensajeGeneral(agencia: Agencia) {
  return `¡Hola ${agencia.nombre}! 👋 Estoy mirando la web y quiero que me asesoren para encontrar mi próxima propiedad. 🏠`;
}

/** Mensaje contextual de una propiedad (card, ficha) — con ficha completa. */
export function mensajePropiedad(agencia: Agencia, p: Propiedad) {
  const ficha = specs(p);
  const ubic = [p.barrio, p.ciudad].filter(Boolean).join(", ");
  const tags = p.tags.slice(0, 6);
  return (
    `¡Hola ${agencia.nombre}! 👋 Vi esta propiedad en la web y me interesa:\n\n` +
    `🏠 *${tituloPropiedad(p)}*\n` +
    `${p.tipo_operacion === "alquiler" ? "En alquiler" : "En venta"}` +
    (p.reference_code ? ` · Ref. ${p.reference_code}` : "") +
    `\n${ficha ? ficha + "\n" : ""}` +
    `💰 *${precioTexto(p)}*\n` +
    (ubic ? `📍 ${ubic}\n` : "") +
    (tags.length ? `\n🧩 ${tags.join(" · ")}\n` : "") +
    `\n🔗 ${urlPropiedad(p)}\n\n` +
    `¿Sigue disponible? ¿Coordinamos una visita?`
  );
}

/** Mensaje con TODAS las propiedades guardadas en favoritos. */
export function mensajeFavoritos(agencia: Agencia, propiedades: Propiedad[]) {
  if (propiedades.length === 0) return mensajeGeneral(agencia);
  const lista = propiedades
    .map((p, i) => {
      const ubic = [p.barrio, p.ciudad].filter(Boolean).join(", ");
      return (
        `${i + 1}. *${tituloPropiedad(p)}*\n` +
        `   💰 ${precioTexto(p)}\n` +
        (ubic ? `   📍 ${ubic}\n` : "") +
        `   🔗 ${urlPropiedad(p)}`
      );
    })
    .join("\n\n");
  return (
    `¡Hola ${agencia.nombre}! 👋 Guardé ${propiedades.length} ${
      propiedades.length === 1 ? "propiedad" : "propiedades"
    } de la web y quiero que me asesoren 👇\n\n` +
    `${lista}\n\n` +
    `¿Cuáles siguen disponibles? ¿Cuál me conviene según lo que busco?`
  );
}
