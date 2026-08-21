import type { Metadata } from "next";
import { VendeTuPropiedadClient } from "./vende-client";

// Server Component SOLO para poder exportar `metadata` (ver nota extendida en
// calculadora-alquiler/page.tsx). Sin esto la página heredaba el canonical "/"
// del layout raíz y se declaraba duplicada de la home ante Google.
//
// De las tres páginas afectadas ésta era la más cara: es la de CAPTACIÓN de
// propietarios que quieren vender — el lead de mayor valor de la inmobiliaria —
// y estaba pidiéndole a Google que no la indexara.
// La lógica y el formulario viven en ./vende-client.tsx.

export const metadata: Metadata = {
  title: "Vendé tu propiedad",
  description:
    "Tasamos tu propiedad en 48 hs y la publicamos en los principales portales del país. Más de 20 años vendiendo casas, departamentos y terrenos. Consultanos sin cargo.",
  keywords: [
    "vender mi propiedad",
    "tasación de propiedades",
    "tasar mi casa",
    "vender casa",
    "vender departamento",
    "inmobiliaria para vender",
  ],
  alternates: { canonical: "/vende-tu-propiedad" },
  openGraph: {
    title: "Vendé tu propiedad | América Cardozo",
    description:
      "Tasación en 48 hs, publicación en los principales portales y acompañamiento hasta la escritura.",
    url: "/vende-tu-propiedad",
  },
};

export default function VendeTuPropiedadPage() {
  return <VendeTuPropiedadClient />;
}
