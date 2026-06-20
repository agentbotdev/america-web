"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Landmark,
  Wallet,
  Receipt,
  TrendingUp,
  Info,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { simularHipoteca } from "@/lib/cotizador";
import { formatPrecio } from "@/lib/format";
import { AGENCIA } from "@/data/agencia";
import type { Moneda } from "@/types";

const MONEDAS: { value: Moneda; label: string }[] = [
  { value: "USD", label: "Dólares (USD)" },
  { value: "ARS", label: "Pesos (ARS)" },
];

const MONTO_DEFAULT: Record<Moneda, number> = {
  USD: 120_000,
  ARS: 90_000_000,
};

const STEP_MONTO: Record<Moneda, number> = {
  USD: 1_000,
  ARS: 1_000_000,
};

function mensajeHipoteca(
  moneda: Moneda,
  montoPropiedad: number,
  anticipoPct: number,
  plazoAnios: number,
  tasaPct: number,
  cuotaMensual: number,
  montoFinanciar: number,
  totalPagado: number,
  totalIntereses: number,
): string {
  return (
    `¡Hola ${AGENCIA.nombre}! 👋 Simulé un crédito hipotecario en la web y quiero asesoramiento:\n\n` +
    `🏠 *Valor propiedad*: ${formatPrecio(montoPropiedad, moneda)}\n` +
    `💵 *Anticipo*: ${anticipoPct}% (${formatPrecio(montoPropiedad * (anticipoPct / 100), moneda)})\n` +
    `🏦 *A financiar*: ${formatPrecio(montoFinanciar, moneda)}\n` +
    `📅 *Plazo*: ${plazoAnios} años\n` +
    `📈 *TNA*: ${tasaPct}%\n\n` +
    `📌 *Cuota mensual estimada*: ${formatPrecio(cuotaMensual, moneda)}\n` +
    `🧮 Total a pagar: ${formatPrecio(totalPagado, moneda)}\n` +
    `🔺 Intereses: ${formatPrecio(totalIntereses, moneda)}\n\n` +
    `(Valores referenciales) ¿Me ayudan a ver opciones reales?`
  );
}

export default function CreditoHipotecarioPage() {
  const [moneda, setMoneda] = useState<Moneda>("USD");
  const [montoPropiedad, setMontoPropiedad] = useState(MONTO_DEFAULT.USD);
  const [anticipoPct, setAnticipoPct] = useState(20);
  const [plazoAnios, setPlazoAnios] = useState(20);
  const [tasaPct, setTasaPct] = useState(8);

  function handleMoneda(m: Moneda) {
    setMoneda(m);
    setMontoPropiedad(MONTO_DEFAULT[m]);
  }

  const sim = useMemo(
    () => simularHipoteca(montoPropiedad, anticipoPct, plazoAnios, tasaPct, moneda),
    [montoPropiedad, anticipoPct, plazoAnios, tasaPct, moneda],
  );

  const pctCapital = sim.totalPagado
    ? (sim.montoFinanciar / (sim.montoFinanciar + sim.totalIntereses)) * 100
    : 100;
  const pctInteres = 100 - pctCapital;

  const stepMonto = STEP_MONTO[moneda];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="flex items-center gap-2 text-sm font-medium text-brand">
          <Landmark className="size-4" /> Crédito hipotecario
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Simulá tu crédito hipotecario
        </h1>
        <p className="mt-3 text-balance text-muted-foreground">
          Calculá la cuota mensual estimada de tu crédito por sistema francés.
          Ajustá monto, anticipo, plazo y tasa para ver cómo cambia. Te
          confirmamos las condiciones reales por WhatsApp.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Inputs */}
        <div className="panel-glass rounded-3xl p-6 sm:p-7">
          {/* Moneda */}
          <div className="mb-6">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Moneda
            </span>
            <div className="flex gap-2">
              {MONEDAS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleMoneda(m.value)}
                  className={
                    "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition " +
                    (moneda === m.value
                      ? "border-brand/60 bg-brand/10 text-foreground glow-brand"
                      : "border-border bg-transparent text-muted-foreground hover:text-foreground")
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monto de la propiedad */}
          <div className="mb-6">
            <label
              htmlFor="monto"
              className="mb-2 flex items-center justify-between text-sm font-medium"
            >
              Valor de la propiedad
              <span className="font-mono text-brand">
                {formatPrecio(montoPropiedad, moneda)}
              </span>
            </label>
            <input
              id="monto"
              type="number"
              inputMode="numeric"
              min={0}
              step={stepMonto}
              value={montoPropiedad}
              onChange={(e) => setMontoPropiedad(Math.max(0, Number(e.target.value)))}
              className="h-11 w-full rounded-xl border border-input bg-transparent px-3.5 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>

          {/* Anticipo */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Anticipo</label>
              <span className="font-mono text-sm">
                {anticipoPct}%{" "}
                <span className="text-muted-foreground">
                  ({formatPrecio(sim.anticipo, moneda)})
                </span>
              </span>
            </div>
            <Slider
              value={[anticipoPct]}
              min={0}
              max={80}
              step={1}
              onValueChange={(v) =>
                setAnticipoPct(Array.isArray(v) ? v[0] : (v as number))
              }
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              A financiar: {formatPrecio(sim.montoFinanciar, moneda)}
            </p>
          </div>

          {/* Plazo */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Plazo</label>
              <span className="font-mono text-sm">{plazoAnios} años</span>
            </div>
            <Slider
              value={[plazoAnios]}
              min={10}
              max={30}
              step={1}
              onValueChange={(v) =>
                setPlazoAnios(Array.isArray(v) ? v[0] : (v as number))
              }
            />
          </div>

          {/* TNA */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Tasa anual (TNA)</label>
              <span className="font-mono text-sm">{tasaPct}%</span>
            </div>
            <Slider
              value={[tasaPct]}
              min={0}
              max={60}
              step={0.5}
              onValueChange={(v) =>
                setTasaPct(Array.isArray(v) ? v[0] : (v as number))
              }
            />
          </div>
        </div>

        {/* Resultado */}
        <div className="card-premium flex flex-col rounded-3xl p-6 sm:p-7">
          <p className="text-sm text-muted-foreground">Cuota mensual estimada</p>
          <motion.p
            key={Math.round(sim.cuotaMensual)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 font-mono text-4xl font-semibold text-brand sm:text-5xl"
          >
            {formatPrecio(sim.cuotaMensual, moneda)}
          </motion.p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="size-4" /> Monto a financiar
              </dt>
              <dd className="font-mono">{formatPrecio(sim.montoFinanciar, moneda)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Receipt className="size-4" /> Total a pagar
              </dt>
              <dd className="font-mono font-semibold">
                {formatPrecio(sim.totalPagado, moneda)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="size-4" /> Total intereses
              </dt>
              <dd className="font-mono text-accent-warm">
                {formatPrecio(sim.totalIntereses, moneda)}
              </dd>
            </div>
          </dl>

          {/* Barra capital vs intereses */}
          <div className="mt-5">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="bg-brand"
                initial={false}
                animate={{ width: `${pctCapital}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="bg-accent-warm"
                initial={false}
                animate={{ width: `${pctInteres}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-brand" /> Capital{" "}
                {Math.round(pctCapital)}%
              </span>
              <span className="flex items-center gap-1">
                Intereses {Math.round(pctInteres)}%{" "}
                <span className="size-2 rounded-full bg-accent-warm" />
              </span>
            </div>
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Valores referenciales. No constituyen una oferta de crédito. Las
            condiciones reales (tasa, requisitos y aprobación) dependen de cada
            entidad.
          </p>

          <div className="mt-5">
            <WhatsappButton
              numero={AGENCIA.whatsapp}
              mensaje={mensajeHipoteca(
                moneda,
                montoPropiedad,
                anticipoPct,
                plazoAnios,
                tasaPct,
                sim.cuotaMensual,
                sim.montoFinanciar,
                sim.totalPagado,
                sim.totalIntereses,
              )}
              label="Consultar por WhatsApp"
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
}
