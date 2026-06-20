// Motor genérico de cuota (sistema francés: cuota fija mensual).
// Reusado por el simulador de crédito hipotecario. Valores referenciales —
// las tasas/entidades reales las confirma la agencia por WhatsApp.

import type { CuotaHipoteca } from "@/types";

/**
 * Cuota fija mensual por sistema francés.
 *
 *   cuota = C · i / (1 − (1 + i)^−n)
 *
 * donde:
 *   C = capital a financiar
 *   i = tasa mensual = TNA / 12 (TNA en decimal: 0.08 = 8%)
 *   n = cantidad de meses
 *
 * Si la tasa es 0, la cuota es la división lineal del capital.
 */
export function cuotaFrancesa(capital: number, tasaAnual: number, meses: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  const i = tasaAnual / 12;
  if (i === 0) return capital / meses;
  const factor = Math.pow(1 + i, -meses);
  return (capital * i) / (1 - factor);
}

/**
 * Simula un crédito hipotecario y devuelve el detalle completo.
 *
 * @param montoPropiedad  Valor total de la propiedad.
 * @param anticipoPct     Porcentaje de anticipo (0–100).
 * @param plazoAnios      Plazo del crédito en años.
 * @param tasaAnualPct    TNA en PORCENTAJE (8 = 8% anual).
 * @param moneda          Moneda del resultado (default "USD").
 */
export function simularHipoteca(
  montoPropiedad: number,
  anticipoPct: number,
  plazoAnios: number,
  tasaAnualPct: number,
  moneda: CuotaHipoteca["moneda"] = "USD",
): CuotaHipoteca {
  const monto = Math.max(0, montoPropiedad);
  const pct = Math.min(Math.max(anticipoPct, 0), 100);
  const anticipo = monto * (pct / 100);
  const montoFinanciar = Math.max(0, monto - anticipo);

  const meses = Math.max(0, Math.round(plazoAnios * 12));
  const tasaAnual = Math.max(0, tasaAnualPct) / 100; // decimal

  const cuotaMensual = cuotaFrancesa(montoFinanciar, tasaAnual, meses);
  const totalCuotas = cuotaMensual * meses;
  const totalPagado = anticipo + totalCuotas;
  const totalIntereses = Math.max(0, totalCuotas - montoFinanciar);

  return {
    montoPropiedad: monto,
    anticipo,
    montoFinanciar,
    plazoAnios,
    tasaAnual, // decimal (coherente con el tipo CuotaHipoteca)
    cuotaMensual,
    totalPagado,
    totalIntereses,
    moneda,
  };
}
