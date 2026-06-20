import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AsesorChat } from "@/components/chatbot/asesor-chat";
import { brandStyle } from "@/lib/brand";
import { AGENCIA } from "@/data/agencia";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://america-cardozo.vercel.app";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });
const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${AGENCIA.nombre} — Propiedades en venta y alquiler en ${AGENCIA.zona_operacion}`,
    template: `%s | América Cardozo`,
  },
  description:
    "Propiedades en venta y alquiler en GBA Zona Oeste. Casas, departamentos, terrenos y locales. Tasaciones sin cargo, visitas coordinadas y asesoría legal. Consultá por WhatsApp.",
  keywords: [
    "inmobiliaria",
    "propiedades en venta",
    "propiedades en alquiler",
    "casas",
    "departamentos",
    "terrenos",
    "GBA Zona Oeste",
    "Buenos Aires",
    "tasaciones",
    "alquiler",
    "comprar casa",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: AGENCIA.nombre,
    title: `${AGENCIA.nombre} — ${AGENCIA.tagline}`,
    description:
      "Propiedades en venta y alquiler en GBA Zona Oeste. Encontrá tu próximo hogar con asesoría real.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col" style={brandStyle(AGENCIA)}>
        <LenisProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <AsesorChat />
        </LenisProvider>
      </body>
    </html>
  );
}
