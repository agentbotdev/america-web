import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { AGENCIA } from "@/data/agencia";
import { EQUIPO } from "@/data/equipo";
import { mensajeGeneral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Estudio Inmobiliario América Cardozo: desde 2006 en Paso del Rey, con sucursal en Ituzaingó. Conocé nuestra historia y a nuestro equipo.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros | América Cardozo",
    description: "Una historia de confianza, una trayectoria que sigue creciendo. Desde 2006.",
    url: "/nosotros",
  },
};

function iniciales(nombre: string) {
  const p = nombre.split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export default function NosotrosPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pb-6 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
        <Reveal>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-text">Quiénes somos</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Una historia de confianza, una trayectoria que sigue creciendo.
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl space-y-5 px-4 pb-14 text-pretty text-base leading-relaxed text-muted-foreground sm:px-6 sm:text-lg">
        <Reveal>
          <p>
            El Estudio Inmobiliario América Cardozo nació el{" "}
            <strong className="text-foreground">27 de abril de 2006</strong> en S. M. del Carril 400, Paso del Rey. Allí
            dimos nuestros primeros pasos, construyendo las bases de lo que hoy es una inmobiliaria con trayectoria,
            compromiso y vocación de servicio.
          </p>
        </Reveal>
        <Reveal>
          <p>
            Con el tiempo crecimos y nos trasladamos a una ubicación más estratégica y transitada: Avenida Bartolomé Mitre
            1300, esquina Misiones, en Paso del Rey, donde seguimos acompañando a nuestros clientes. Hoy, además, ampliamos
            nuestra presencia con una nueva sucursal en Olazábal y Fragio, Ituzaingó, acercándonos a más personas y
            proyectos.
          </p>
        </Reveal>
        <Reveal>
          <p>
            A lo largo de estos años, nos distinguimos por trabajar con ética, transparencia y atención personalizada,
            acompañando a familias, propietarios, compradores e inversores en decisiones importantes de sus vidas.
          </p>
        </Reveal>
        <Reveal>
          <p>
            Nuestra trayectoria también está ligada al compromiso con la profesión inmobiliaria, participando activamente
            en instituciones del sector y promoviendo el trabajo colaborativo entre colegas.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="equipo">
        <Reveal>
          <h2 id="equipo" className="text-center text-3xl font-semibold sm:text-4xl">
            Conocé a nuestro equipo
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-3 max-w-2xl text-balance text-center text-muted-foreground">
            Detrás de cada operación hay personas que escuchan, asesoran y trabajan con responsabilidad. Te invitamos a
            conocer a quienes forman parte de nuestro equipo y hacen posible que cada proyecto encuentre su camino.
          </p>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {EQUIPO.map((m, i) => (
            <li key={m.nombre}>
              <Reveal delay={(i % 4) * 0.05}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative size-28 overflow-hidden rounded-full border border-border bg-brand/10 shadow-sm sm:size-36">
                    {m.foto ? (
                      <Image src={m.foto} alt={m.nombre} fill sizes="144px" className="object-cover" />
                    ) : (
                      <span
                        aria-hidden
                        className="flex size-full items-center justify-center text-3xl font-semibold tracking-wide text-brand-text sm:text-4xl"
                      >
                        {iniciales(m.nombre)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-tight">{m.nombre}</h3>
                  <p className="mt-1 text-balance text-sm text-muted-foreground">{m.cargo}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <Reveal>
          <div className="panel-glass rounded-lg p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Estudio Inmobiliario América Cardozo</h2>
            <p className="mt-1 text-muted-foreground">Experiencia, confianza y compromiso desde 2006.</p>
            <ul className="mt-5 space-y-2 text-sm text-foreground sm:text-base">
              <li className="flex items-start justify-center gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
                <span>
                  <strong>Paso del Rey:</strong> Av. Bartolomé Mitre 1300, esquina Misiones.
                </span>
              </li>
              <li className="flex items-start justify-center gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
                <span>
                  <strong>Ituzaingó:</strong> Olazábal esquina Fragio.
                </span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Phone className="size-4 shrink-0 text-brand-text" aria-hidden />
                <span>
                  <strong>Llamadas:</strong>{" "}
                  <a href="tel:+541159564430" className="hover:underline">
                    11 5956-4430
                  </a>
                </span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <MessageCircle className="size-4 shrink-0 text-brand-text" aria-hidden />
                <span>
                  <strong>WhatsApp:</strong> 15 5930-7526
                </span>
              </li>
            </ul>
            <div className="mt-6">
              <WhatsappButton
                numero={AGENCIA.whatsapp}
                mensaje={mensajeGeneral(AGENCIA)}
                label="Escribinos por WhatsApp"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
