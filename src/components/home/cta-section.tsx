import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { mensajeGeneral } from "@/lib/whatsapp";

export function CtaSection() {
  const a = AGENCIA;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Azul marino + glass (gradiente de marca) */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-14 text-center sm:px-12 sm:py-20"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklch, var(--brand) 78%, black 6%) 0%, color-mix(in oklch, var(--brand) 28%, black 40%) 100%)",
        }}
      >
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ¿Listo para encontrar tu próxima propiedad?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-balance text-slate-200">
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
              className="cta-shine group/cta glass-dark inline-flex h-13 items-center gap-1.5 rounded-full px-7 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
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
