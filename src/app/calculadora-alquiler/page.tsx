"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calculator, Info, KeyRound } from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { formatPrecio } from "@/lib/format";
import { AGENCIA } from "@/data/agencia";
import type { CostoAlquiler } from "@/types";

// Costos de ingreso a un alquiler (referenciales, configurables por el usuario):
//  - Primer mes de alquiler
//  - Depósito en garantía (N meses)
//  - Comisión inmobiliaria (% sobre un mes — convención local)
//  - Sellado / impuesto de sellos (% sobre el contrato; se estima sobre un mes)
const DEFAULTS = {
  alquilerMensual: 350_000,
  mesesDeposito: 1,
  comisionPct: 4.15,
  selladoPct: 0.5,
};

function calcularCostoAlquiler(
  alquilerMensual: number,
  mesesDeposito: number,
  comisionPct: number,
  selladoPct: number,
): CostoAlquiler {
  const alquiler = Math.max(0, alquilerMensual);
  const deposito = alquiler * Math.max(0, mesesDeposito);
  const comision = alquiler * (Math.max(0, comisionPct) / 100);
  const sellado = alquiler * (Math.max(0, selladoPct) / 100);

  const desglose = [
    { concepto: "Primer mes de alquiler", monto: alquiler },
    {
      concepto: `Depósito en garantía (${mesesDeposito} ${
        mesesDeposito === 1 ? "mes" : "meses"
      })`,
      monto: deposito,
    },
    { concepto: `Comisión inmobiliaria (${comisionPct}%)`, monto: comision },
    { concepto: `Sellado (${selladoPct}%)`, monto: sellado },
  ];

  const totalIngreso = desglose.reduce((acc, d) => acc + d.monto, 0);

  return {
    alquilerMensual: alquiler,
    totalIngreso,
    desglose,
    moneda: "ARS",
  };
}

function mensajeAlquiler(costo: CostoAlquiler): string {
  const lineas = costo.desglose
    .map((d) => `• ${d.concepto}: ${formatPrecio(d.monto, "ARS")}`)
    .join("\n");
  return (
    `¡Hola ${AGENCIA.nombre}! 👋 Calculé el costo de ingreso a un alquiler en la web:\n\n` +
    `🏠 *Alquiler mensual*: ${formatPrecio(costo.alquilerMensual, "ARS")}\n\n` +
    `🧾 *Desglose estimado*\n${lineas}\n\n` +
    `💰 *Total para ingresar*: ${formatPrecio(costo.totalIngreso, "ARS")}\n\n` +
    `(Valores referenciales) ¿Me asesoran con el contrato y la garantía?`
  );
}

// Input numérico reutilizable con label + sufijo.
function CampoNumero({
  id,
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="h-11 w-full rounded-xl border border-input bg-transparent px-3.5 pr-12 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CalculadoraAlquilerPage() {
  const [alquilerMensual, setAlquilerMensual] = useState(DEFAULTS.alquilerMensual);
  const [mesesDeposito, setMesesDeposito] = useState(DEFAULTS.mesesDeposito);
  const [comisionPct, setComisionPct] = useState(DEFAULTS.comisionPct);
  const [selladoPct, setSelladoPct] = useState(DEFAULTS.selladoPct);

  const costo = useMemo(
    () =>
      calcularCostoAlquiler(alquilerMensual, mesesDeposito, comisionPct, selladoPct),
    [alquilerMensual, mesesDeposito, comisionPct, selladoPct],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="flex items-center gap-2 text-sm font-medium text-brand">
          <KeyRound className="size-4" /> Calculadora de alquiler
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          ¿Cuánto cuesta entrar a un alquiler?
        </h1>
        <p className="mt-3 text-balance text-muted-foreground">
          Estimá todo lo que necesitás para ingresar: primer mes, depósito,
          comisión y sellado. Ajustá los valores según tu caso. Te asesoramos
          con el contrato por WhatsApp.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Inputs */}
        <div className="panel-glass rounded-3xl p-6 sm:p-7">
          <div className="space-y-6">
            <CampoNumero
              id="alquiler"
              label="Alquiler mensual"
              value={alquilerMensual}
              onChange={setAlquilerMensual}
              step={10_000}
              suffix="ARS"
            />
            <CampoNumero
              id="deposito"
              label="Meses de depósito"
              value={mesesDeposito}
              onChange={setMesesDeposito}
              step={1}
              suffix="meses"
            />
            <CampoNumero
              id="comision"
              label="Comisión inmobiliaria"
              value={comisionPct}
              onChange={setComisionPct}
              step={0.05}
              suffix="%"
            />
            <CampoNumero
              id="sellado"
              label="Sellado"
              value={selladoPct}
              onChange={setSelladoPct}
              step={0.1}
              suffix="%"
            />
          </div>
        </div>

        {/* Resultado */}
        <div className="card-premium flex flex-col rounded-3xl p-6 sm:p-7">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="size-4 text-brand" /> Desglose estimado
          </p>

          <table className="mt-4 w-full text-sm">
            <tbody>
              {costo.desglose.map((d) => (
                <tr key={d.concepto} className="border-b border-border/60">
                  <td className="py-2.5 pr-2 text-muted-foreground">{d.concepto}</td>
                  <td className="py-2.5 text-right font-mono whitespace-nowrap">
                    {formatPrecio(d.monto, "ARS")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <p className="text-sm text-muted-foreground">Total para ingresar</p>
            <motion.p
              key={Math.round(costo.totalIngreso)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-0.5 font-mono text-3xl font-semibold text-brand sm:text-4xl"
            >
              {formatPrecio(costo.totalIngreso, "ARS")}
            </motion.p>
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Valores referenciales. Los porcentajes de comisión y sellado varían
            según la jurisdicción y el tipo de contrato. Consultá tu caso
            puntual.
          </p>

          <div className="mt-auto pt-5">
            <WhatsappButton
              numero={AGENCIA.whatsapp}
              mensaje={mensajeAlquiler(costo)}
              label="Consultar por WhatsApp"
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
}
