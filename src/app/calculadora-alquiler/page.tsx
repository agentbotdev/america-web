"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calculator, Info, KeyRound } from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { formatPrecio } from "@/lib/format";
import { AGENCIA } from "@/data/agencia";
import type { CostoAlquiler } from "@/types";

// Costos de ingreso a un alquiler — REGLAS FIJAS definidas por la dueña:
//  - Primer mes de alquiler
//  - Depósito en garantía (N meses, editable)
//  - HONORARIOS (antes "comisión") = UN mes de alquiler, FIJO
//  - Gastos administrativos = 10% del alquiler mensual, FIJO (base CONFIRMADA
//    por el cliente: se calcula sobre el alquiler mensual)
//  - SELLADO = 1,2% del TOTAL DEL CONTRATO, FIJO — el contrato dura
//    2 años (vivienda) o 3 años (comercial), a elección del usuario.
const DEFAULTS = {
  alquilerMensual: 350_000,
  mesesDeposito: 1,
};

const GASTOS_ADM_PCT = 10;
const SELLADO_PCT = 1.2;

export type TipoContrato = "vivienda" | "comercial";
const CONTRATOS: Record<TipoContrato, { label: string; anios: number }> = {
  vivienda: { label: "Vivienda", anios: 2 },
  comercial: { label: "Comercial", anios: 3 },
};

function calcularCostoAlquiler(
  alquilerMensual: number,
  mesesDeposito: number,
  tipoContrato: TipoContrato,
): CostoAlquiler {
  const alquiler = Math.max(0, alquilerMensual);
  const deposito = alquiler * Math.max(0, mesesDeposito);
  const honorarios = alquiler; // fijo: 1 mes de alquiler
  const gastosAdm = alquiler * (GASTOS_ADM_PCT / 100);
  const { anios } = CONTRATOS[tipoContrato];
  const totalContrato = alquiler * anios * 12;
  const sellado = totalContrato * (SELLADO_PCT / 100);

  const desglose = [
    { concepto: "Primer mes de alquiler", monto: alquiler },
    {
      concepto: `Depósito en garantía (${mesesDeposito} ${
        mesesDeposito === 1 ? "mes" : "meses"
      })`,
      monto: deposito,
    },
    { concepto: "Honorarios (1 mes de alquiler)", monto: honorarios },
    { concepto: `Gastos administrativos (${GASTOS_ADM_PCT}%)`, monto: gastosAdm },
    {
      concepto: `Sellado (${SELLADO_PCT}% del contrato de ${anios} años)`,
      monto: sellado,
    },
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
  max,
  step = 1,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
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
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Math.max(min, Number(e.target.value));
            onChange(max != null ? Math.min(max, n) : n);
          }}
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
  const [tipoContrato, setTipoContrato] = useState<TipoContrato>("vivienda");

  const costo = useMemo(
    () => calcularCostoAlquiler(alquilerMensual, mesesDeposito, tipoContrato),
    [alquilerMensual, mesesDeposito, tipoContrato],
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
          honorarios, gastos administrativos y sellado. Elegí el tipo de
          contrato según tu caso. Te asesoramos con el contrato por WhatsApp.
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
              max={12}
              suffix="meses"
            />
            {/* Tipo de contrato → define la duración sobre la que se calcula
                el sellado (1,2% del total del contrato). */}
            <div>
              <span className="mb-2 block text-sm font-medium">Tipo de contrato</span>
              <div className="flex gap-2">
                {(Object.keys(CONTRATOS) as TipoContrato[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipoContrato(t)}
                    aria-pressed={tipoContrato === t}
                    className={
                      "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition " +
                      (tipoContrato === t
                        ? "border-brand/60 bg-brand/10 text-foreground glow-brand"
                        : "border-border bg-transparent text-muted-foreground hover:text-foreground")
                    }
                  >
                    {CONTRATOS[t].label} · {CONTRATOS[t].anios} años
                  </button>
                ))}
              </div>
            </div>

            {/* Reglas FIJAS (definidas por la inmobiliaria, no editables). */}
            <div className="space-y-2 rounded-xl border border-brand/25 bg-brand/8 px-3.5 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Honorarios</span>
                <span className="font-mono font-semibold text-brand-text">1 mes de alquiler</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Gastos administrativos</span>
                <span className="font-mono font-semibold text-brand-text">{GASTOS_ADM_PCT}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Sellado</span>
                <span className="font-mono font-semibold text-brand-text">
                  {SELLADO_PCT}% del contrato
                </span>
              </div>
            </div>
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
