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
      {/* py-10 (antes 16): sección más finita → menos scroll hasta las props. */}
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center" blur={10}>
          <span className="text-sm font-medium text-brand-text">Por qué confiar en nosotros</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trayectoria que se traduce en resultados
          </h2>
        </Reveal>

        {/* Cards COMPACTAS (pedido del cliente: "les sobra espacio"): padding
            corto, ícono chico y número un talle menos. La stat es un dato de
            respaldo, no la protagonista — el espacio se lo damos a las props. */}
        <RevealGroup
          className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          stagger={0.1}
        >
          {STATS.map((s) => (
            <RevealItem key={s.label}>
              <div className="card-glow card-topline card-premium group relative h-full overflow-hidden rounded-3xl px-3 py-4 text-center hover:-translate-y-1.5 hover:border-brand/40 sm:py-5">
                <span className="mx-auto mb-2.5 flex size-9 items-center justify-center rounded-xl bg-brand/12 text-brand ring-1 ring-brand/25 transition-transform duration-500 group-hover:scale-110">
                  <s.icon className="size-4" />
                </span>
                <p className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand-text">
                  {s.label}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
