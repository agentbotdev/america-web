import type { Metadata } from "next";
import { CalculadoraAlquilerClient } from "./calculadora-client";

// Server Component SOLO para poder exportar `metadata`: un componente marcado
// con "use client" no puede hacerlo, y esta página era enteramente cliente.
// Consecuencia real que esto arregla: sin metadata propia heredaba la del
// layout raíz, incluido `alternates.canonical: "/"` → la página declaraba en
// producción que era un duplicado de la home y le pedía a Google que indexara
// la home en su lugar. Verificado en el HTML servido antes del fix.
// La lógica y la interactividad viven en ./calculadora-client.tsx.

export const metadata: Metadata = {
  title: "Calculadora de alquiler",
  description:
    "Calculá cuánto vas a pagar al firmar un alquiler: honorarios, gastos administrativos y sellado. Contratos de vivienda (2 años) y comerciales (3 años).",
  keywords: [
    "calculadora alquiler",
    "cuánto cuesta alquilar",
    "gastos de alquiler",
    "sellado contrato alquiler",
    "honorarios inmobiliaria",
  ],
  alternates: { canonical: "/calculadora-alquiler" },
  openGraph: {
    title: "Calculadora de alquiler | América Cardozo",
    description:
      "Calculá honorarios, gastos administrativos y sellado antes de firmar. Sin sorpresas.",
    url: "/calculadora-alquiler",
  },
};

export default function CalculadoraAlquilerPage() {
  return <CalculadoraAlquilerClient />;
}
