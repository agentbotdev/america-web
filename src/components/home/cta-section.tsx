import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

export function CtaSection() {
  const a = AGENCIA;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Bloque rojo de marca: el único acento saturado de la página.
          El gradiente arranca TRANSLÚCIDO (el rojo al 88% deja ver el fondo
          cálido y le saca dureza al bloque) y cierra en un rojo PROFUNDO.
          Esa dirección no es estética solamente: el texto va centrado sobre la
          mitad más oscura, así que la transparencia se ve arriba a la izquierda
          y el contraste se gana donde está la lectura. */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-[0_28px_70px_-32px_color-mix(in_oklch,var(--brand)_70%,transparent)] sm:px-12 sm:py-20"
        style={{
          background:
            // En `color-mix` los porcentajes DEBEN sumar 100: si suman menos,
            // CSS normaliza el color pero le deja alpha < 1 (bug ya pagado acá).
            // La translucidez va con `transparent`, que es explícito y medible.
            "linear-gradient(135deg, color-mix(in oklch, var(--brand) 88%, transparent) 0%, color-mix(in oklch, var(--brand) 62%, black 38%) 100%)",
        }}
      >
        <div className="bg-grid-invert pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ¿Listo para encontrar tu próxima propiedad?
          </h2>
          {/* Blanco PURO: sobre el rojo de marca cada punto de opacidad que se
              baja cuesta contraste (con /85 caía a 3.3). */}
          <p className="mx-auto mt-4 max-w-lg text-balance text-white">
            Escribinos por WhatsApp y un asesor te ayuda a comprar, vender o
            alquilar en {a.zona_operacion}. Sin compromiso.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <WhatsappButton
              numero={a.whatsapp}
              mensaje={mensajeGeneral(a)}
              label="Hablar con un asesor"
              size="lg"
              className="cta-shine hover:-translate-y-0.5"
            />
            <Link
              href="/propiedades"
              className="cta-shine group/cta inline-flex h-13 items-center gap-1.5 rounded-full border border-white/45 px-7 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/15"
            >
              Ver propiedades
              <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
