import { Calculator, CalendarCheck, Scale, MapPin, Handshake, FileCheck2, type LucideIcon } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

// Beneficios de la inmobiliaria: cinta infinita (marquee). Sin logos de marcas.
const ITEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Calculator, title: "Tasaciones sin cargo", desc: "Valuamos tu propiedad gratis." },
  { icon: CalendarCheck, title: "Visitas coordinadas", desc: "A tu ritmo y agenda." },
  { icon: Scale, title: "Asesoría legal", desc: "Papeles en regla de punta a punta." },
  { icon: MapPin, title: "Cobertura nacional", desc: "Operamos en todo el país." },
  { icon: Handshake, title: "Acompañamiento real", desc: "Un asesor con vos en todo el proceso." },
  { icon: FileCheck2, title: "Operaciones seguras", desc: "Reserva, boleto y escritura claros." },
];

export function TrustStrip() {
  return (
    <section className="section-dark border-y border-white/[0.06] py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Por qué elegirnos
      </p>

      {/* Rueda de beneficios (glass, cinta infinita) */}
      <Marquee duration={30} gap="1.25rem">
        {ITEMS.map((it) => (
          <li
            key={it.title}
            className="flex items-center gap-3 whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 [border-top-color:rgba(255,255,255,0.16)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand ring-1 ring-brand/25">
              <it.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{it.title}</p>
              <p className="text-xs text-muted-foreground">{it.desc}</p>
            </div>
          </li>
        ))}
      </Marquee>
    </section>
  );
}
