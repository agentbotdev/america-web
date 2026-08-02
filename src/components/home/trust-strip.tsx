import { Calculator, CalendarCheck, Scale, MapPin, Handshake, FileCheck2, type LucideIcon } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

// Beneficios de la inmobiliaria: cinta infinita (marquee). Sin logos de marcas.
const ITEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Calculator, title: "Tasaciones en 48 hs", desc: "Valuamos tu propiedad rápido y con criterio de mercado." },
  { icon: CalendarCheck, title: "Visitas coordinadas", desc: "A tu ritmo y agenda." },
  { icon: Scale, title: "Asesoría legal", desc: "Papeles en regla de punta a punta." },
  { icon: MapPin, title: "Cobertura nacional", desc: "Operamos en todo el país." },
  { icon: Handshake, title: "Acompañamiento real", desc: "Un asesor con vos en todo el proceso." },
  { icon: FileCheck2, title: "Operaciones seguras", desc: "Reserva, boleto y escritura claros." },
];

export function TrustStrip() {
  return (
    // Sin border-y ni fondo propio: el fondo de la página es UN color uniforme
    // (feedback del cliente: las líneas entre secciones se leían como "cortes").
    <section className="py-8">
      <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Por qué elegirnos
      </p>

      {/* Rueda de beneficios: pills COMPACTAS (menos padding, ícono menor) y
          paso más ágil — el cliente las marcó como "barras muy grandes". */}
      {/* repeat=2: 6 pills (~1.6k px por set) alcanzan justo en monitores
          anchos; duplicado no queda hueco. duration escala con el track. */}
      <Marquee duration={30} gap="0.875rem" repeat={2}>
        {ITEMS.map((it) => (
          <li
            key={it.title}
            className="card-premium flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand ring-1 ring-brand/25">
              <it.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-foreground">{it.title}</p>
              <p className="text-xs leading-tight text-muted-foreground">{it.desc}</p>
            </div>
          </li>
        ))}
      </Marquee>
    </section>
  );
}
