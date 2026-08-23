// Motor de cuota de la financiación PROPIA de la inmobiliaria.
//
// ⚠️ NO es sistema francés (cuota fija con amortización). Confirmado por el
// cliente: acá el interés se calcula SOBRE EL TOTAL y el resultado se divide en
// partes iguales. Es la forma habitual de la financiación directa inmobiliaria,
// y da una cuota MUY distinta de la bancaria — a 20 años y 10% el francés daba
// ~USD 926 donde esta fórmula da USD 1.200 sobre el mismo capital.

import type { CuotaHipoteca } from "@/types";

/**
 * Total a devolver con interés SIMPLE sobre el capital original.
 *
 *   total = C · (1 + i · años)
 *
 * El interés de cada año se calcula siempre sobre el capital ORIGINAL, no
 * sobre el saldo acumulado. Confirmado por el cliente frente a la variante
 * compuesta (C · (1+i)^años), que a 20 años daba más del doble de cuota.
 *
 *   C = capital a financiar
 *   i = tasa anual en decimal (0.10 = 10%)
 */
export function totalConInteresSimple(
  capital: number,
  tasaAnual: number,
  anios: number,
): number {
  if (capital <= 0) return 0;
  const i = Math.max(0, tasaAnual);
  const a = Math.max(0, anios);
  return capital * (1 + i * a);
}

/**
 * Cuota mensual: el total con interés dividido en partes IGUALES.
 *
 *   cuota = C · (1 + i · años) / (años · 12)
 */
export function cuotaSimple(capital: number, tasaAnual: number, anios: number): number {
  const meses = Math.round(Math.max(0, anios) * 12);
  if (meses <= 0) return 0;
  return totalConInteresSimple(capital, tasaAnual, anios) / meses;
}

/**
 * Simula la financiación y devuelve el detalle completo.
 *
 * @param montoPropiedad  Valor total de la propiedad.
 * @param anticipoPct     Porcentaje de anticipo (0–100).
 * @param plazoAnios      Plazo en años.
 * @param tasaAnualPct    Tasa anual en PORCENTAJE (10 = 10% anual).
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

  const anios = Math.max(0, plazoAnios);
  const meses = Math.round(anios * 12);
  const tasaAnual = Math.max(0, tasaAnualPct) / 100; // decimal

  const totalCuotas = totalConInteresSimple(montoFinanciar, tasaAnual, anios);
  const cuotaMensual = meses > 0 ? totalCuotas / meses : 0;
  const totalPagado = anticipo + totalCuotas;
  const totalIntereses = Math.max(0, totalCuotas - montoFinanciar);

  return {
    montoPropiedad: monto,
    anticipo,
    montoFinanciar,
    plazoAnios,
    tasaAnual, // decimal (coherente con el tipo CuotaHipoteca)
    cantidadCuotas: meses,
    cuotaMensual,
    totalPagado,
    totalIntereses,
    moneda,
  };
}
