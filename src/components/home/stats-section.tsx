import { CalendarRange, MapPinned, Headset, ShieldCheck, type LucideIcon } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { AGENCIA } from "@/data/agencia";

// Franja de métricas con count-up al entrar en viewport. Datos HONESTOS de marca
// (sin inventar números de ventas, que hoy es 0 en data/agencia.ts): años de
// trayectoria, cobertura, acompañamiento. El número anima; el resto es contexto.
type Stat = {
  icon: LucideIcon;
  to: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sub: string;
};

const STATS: Stat[] = [
  {
    icon: CalendarRange,
    to: AGENCIA.anios_experiencia,
    prefix: "+",
    label: "años de trayectoria",
    sub: "Operando con respaldo y experiencia real.",
  },
  {
    icon: MapPinned,
    to: 100,
    suffix: "%",
    label: "cobertura nacional",
    sub: "Compramos, vendemos y alquilamos en todo el país.",
  },
  {
    icon: Headset,
    to: 1,
    label: "asesor dedicado",
    sub: "Una persona con vos en todo el proceso.",
  },
  {
    icon: ShieldCheck,
    to: 100,
    suffix: "%",
    label: "operaciones en regla",
    sub: "Reserva, boleto y escritura, claros y transparentes.",
  },
];

export function StatsSection() {
  return (
    <section className="section-dark relative overflow-hidden border-y border-white/[0.06]">
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center" blur={10}>
          <span className="text-sm font-medium text-brand">Por qué confiar en nosotros</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Trayectoria que se traduce en resultados
          </h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          stagger={0.1}
        >
          {STATS.map((s) => (
            <RevealItem key={s.label}>
              <div className="card-glow card-topline group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center transition-all duration-500 [border-top-color:rgba(255,255,255,0.16)] hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white/[0.06]">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/25 transition-transform duration-500 group-hover:scale-110">
                  <s.icon className="size-6" />
                </span>
                <p className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand">
                  {s.label}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.sub}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
