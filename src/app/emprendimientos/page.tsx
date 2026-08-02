import type { Metadata } from "next";
import Image from "next/image";
import { Building2, TrendingUp, KeyRound, PencilRuler, MapPin } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { EMPRENDIMIENTOS } from "@/data/emprendimientos";
import { mensajeGeneral } from "@/lib/whatsapp";

// Página de AMERICAN GROUP (la desarrolladora del grupo). Boceto de la dueña:
// proyectos (terminados / en obra / loteos) + hincapié en las ETAPAS de
// desarrollo e inversión. Los proyectos salen de data/emprendimientos.ts —
// mientras no haya cargados, un estado "en preparación" honesto con CTA.

export const metadata: Metadata = {
  title: "Emprendimientos | América Cardozo",
  description:
    "Desarrollos inmobiliarios de American Group: proyectos en pozo, en obra, terminados y loteos. Oportunidades de inversión con el respaldo de América Cardozo.",
};

// Las etapas que la dueña pidió destacar: cómo se desarrolla e invierte.
const ETAPAS = [
  {
    icon: PencilRuler,
    title: "Proyecto y pozo",
    desc: "Entrás en la etapa inicial, con el mejor precio por m² y planes de pago en cuotas durante la obra.",
  },
  {
    icon: Building2,
    title: "Desarrollo y obra",
    desc: "Avance certificado y comunicación en cada etapa. Tu inversión se valoriza a medida que el proyecto crece.",
  },
  {
    icon: KeyRound,
    title: "Entrega y escritura",
    desc: "Posesión con todo en regla: reserva, boleto y escritura acompañados por nuestro equipo legal.",
  },
  {
    icon: TrendingUp,
    title: "Inversión y renta",
    desc: "Te asesoramos para rentabilizar tu unidad: reventa con valorización o renta por alquiler.",
  },
];

const ESTADO_BADGE: Record<string, string> = {
  "En pozo": "bg-brand/12 text-brand-text",
  "En obra": "bg-brand/12 text-brand-text",
  Terminado: "bg-foreground/8 text-foreground",
  Loteo: "bg-foreground/8 text-foreground",
};

export default function EmprendimientosPage() {
  const a = AGENCIA;
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <Reveal>
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-text">American Group</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Emprendimientos y desarrollos
          </h1>
          <p className="mt-4 text-balance text-muted-foreground sm:text-lg">
            La desarrolladora del grupo: proyectos en pozo, en obra, terminados
            y loteos en {a.zona_operacion}. Invertí acompañado de un equipo con
            +{a.anios_experiencia} años en el mercado inmobiliario.
          </p>
        </div>
      </Reveal>

      {/* Proyectos (data-driven; sin inventos) */}
      <section className="mt-12" aria-labelledby="proyectos">
        <Reveal>
          <h2 id="proyectos" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Nuestros proyectos
          </h2>
        </Reveal>

        {EMPRENDIMIENTOS.length > 0 ? (
          <RevealGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {EMPRENDIMIENTOS.map((e) => (
              <RevealItem key={e.id} className="h-full">
                <article className="card-glow card-topline card-premium flex h-full flex-col overflow-hidden rounded-3xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {e.imagen ? (
                      <Image
                        src={e.imagen}
                        alt={`${e.nombre} — ${e.ubicacion}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/90 to-brand text-brand-foreground">
                        <Building2 className="size-12 opacity-90" aria-hidden />
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE[e.estado] ?? "bg-foreground/8 text-foreground"}`}
                    >
                      {e.estado}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-lg font-semibold">{e.nombre}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden /> {e.ubicacion}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {e.descripcion}
                    </p>
                    {e.tipologias && (
                      <p className="mt-auto pt-4 text-xs font-medium text-brand-text">
                        {e.tipologias}
                      </p>
                    )}
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <Reveal>
            {/* Estado "en preparación": honesto (sin proyectos inventados) y
                con captura por WhatsApp mientras se cargan los reales. */}
            <div className="card-premium mt-6 rounded-3xl px-6 py-12 text-center sm:px-12">
              <Building2 className="mx-auto size-10 text-brand" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">
                Estamos preparando la presentación de nuestros proyectos
              </h3>
              <p className="mx-auto mt-2 max-w-md text-balance text-sm text-muted-foreground">
                Muy pronto vas a poder recorrerlos acá. Mientras tanto, un
                asesor te cuenta por WhatsApp qué desarrollos y loteos tenemos
                disponibles y cómo invertir desde el pozo.
              </p>
              <div className="mt-6 flex justify-center">
                <WhatsappButton
                  numero={a.whatsapp}
                  mensaje="¡Hola América Cardozo! 👋 Quiero conocer los emprendimientos y oportunidades de inversión de American Group."
                  label="Consultar emprendimientos"
                />
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* Etapas de desarrollo e inversión (pedido explícito del boceto) */}
      <section className="mt-16" aria-labelledby="etapas">
        <Reveal>
          <h2 id="etapas" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Etapas de desarrollo e inversión
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            De la compra en pozo a la renta: te acompañamos en cada etapa para
            que tu inversión sea segura y rinda.
          </p>
        </Reveal>
        <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {ETAPAS.map((e) => (
            <RevealItem key={e.title} className="h-full">
              <div className="card-premium h-full rounded-3xl p-5">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/12 text-brand ring-1 ring-brand/25">
                  <e.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-base font-semibold">{e.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* CTA de cierre */}
      <Reveal>
        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-brand/25 bg-brand/8 px-6 py-10 text-center">
          <h2 className="text-balance text-xl font-semibold sm:text-2xl">
            ¿Querés invertir en un desarrollo?
          </h2>
          <p className="max-w-lg text-balance text-sm text-muted-foreground sm:text-base">
            Contanos tu presupuesto y objetivo (vivienda o renta) y te
            proponemos el proyecto que mejor encaja.
          </p>
          <WhatsappButton
            numero={a.whatsapp}
            mensaje={mensajeGeneral(a)}
            label="Hablar con un asesor"
            size="lg"
          />
        </div>
      </Reveal>
    </div>
  );
}
