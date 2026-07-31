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
    <section className="relative overflow-hidden">
      {/* (sin grilla de fondo: el fondo de la página es un solo color liso) */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center" blur={10}>
          <span className="text-sm font-medium text-brand-text">Por qué confiar en nosotros</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trayectoria que se traduce en resultados
          </h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          stagger={0.1}
        >
          {STATS.map((s) => (
            <RevealItem key={s.label}>
              <div className="card-glow card-topline card-premium group relative h-full overflow-hidden rounded-3xl p-6 text-center hover:-translate-y-1.5 hover:border-brand/40">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand/12 text-brand ring-1 ring-brand/25 transition-transform duration-500 group-hover:scale-110">
                  <s.icon className="size-6" />
                </span>
                <p className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-text">
                  {s.label}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.sub}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
