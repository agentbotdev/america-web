import type { Metadata } from "next";
import { Suspense } from "react";
import { FavoritosDoc } from "@/components/favoritos/favoritos-doc";

export const metadata: Metadata = {
  title: "Mi selección de propiedades",
  // Página personal del visitante: no se indexa.
  robots: { index: false, follow: false },
  // Redundante con el noindex, pero evita que herede `canonical: "/"` del
  // layout: así ninguna ruta del sitio se declara duplicada de la home.
  alternates: { canonical: "/favoritos" },
};

export default function FavoritosPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <FavoritosDoc />
    </Suspense>
  );
}
