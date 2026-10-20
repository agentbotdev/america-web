import type { Metadata } from "next";
import { CreditoHipotecarioClient } from "./credito-client";

// Server Component SOLO para poder exportar `metadata` (ver nota extendida en
// calculadora-alquiler/page.tsx). Sin esto la página heredaba el canonical "/"
// del layout raíz y se declaraba duplicada de la home ante Google.
// La lógica y la interactividad viven en ./credito-client.tsx.

export const metadata: Metadata = {
  title: "Simulá tu crédito personal",
  description:
    "Simulá la cuota de tu crédito personal: monto, plazo y anticipo. Tasa anual fija del 10% acumulativo. Te acompañamos en todo el proceso de compra.",
  keywords: [
    "crédito hipotecario",
    "simulador crédito hipotecario",
    "cuota crédito vivienda",
    "financiación propiedad",
    "comprar casa con crédito",
  ],
  alternates: { canonical: "/credito-hipotecario" },
  openGraph: {
    title: "Simulá tu crédito personal | América Cardozo",
    description:
      "Calculá tu cuota antes de decidir: monto, plazo y anticipo, con tasa anual fija.",
    url: "/credito-hipotecario",
  },
};

export default function CreditoHipotecarioPage() {
  return <CreditoHipotecarioClient />;
}
