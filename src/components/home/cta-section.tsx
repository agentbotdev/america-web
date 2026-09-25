import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

export function CtaSection() {
  const a = AGENCIA;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Banda CHARCOAL: el momento de contraste de la página. Sale del negro
          del propio logo (serif negro + líneas rojas) — no del rojo a bloque
          completo, que se leía "promo de supermercado". El rojo queda como
          firma: una raya fina arriba del titular, igual que en el logo. */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--ink)] px-6 py-14 text-center shadow-[0_28px_70px_-40px_rgba(20,16,10,0.75)] sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <span aria-hidden className="mx-auto block h-[3px] w-12 bg-brand" />
          <h2 className="mt-6 text-balance text-3xl font-semibold text-white sm:text-4xl">
            ¿Listo para encontrar tu próxima propiedad?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-balance text-white/85">
            Escribinos por WhatsApp y un asesor te ayuda a comprar, vender o
            alquilar en {a.zona_operacion}. Sin compromiso.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <WhatsappButton
              numero={a.whatsapp}
              mensaje={mensajeGeneral(a)}
              label="Hablar con un asesor"
              size="lg"
            />
            <Link
              href="/propiedades"
              className="group/cta inline-flex h-13 items-center gap-1.5 rounded-md border border-white/30 px-7 text-base font-medium text-white transition-all hover:border-white hover:bg-white/10"
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
