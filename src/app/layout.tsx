import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AsesorChat } from "@/components/chatbot/asesor-chat";
import { WhatsappFloat } from "@/components/whatsapp/whatsapp-float";
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
    "Propiedades en venta y alquiler en toda Argentina. Casas, departamentos, terrenos y locales. Tasaciones en 48 hs, visitas coordinadas y asesoría real. Consultá por WhatsApp.",
  keywords: [
    "inmobiliaria",
    "propiedades en venta",
    "propiedades en alquiler",
    "casas",
    "departamentos",
    "terrenos",
    "inmobiliaria Argentina",
    "propiedades Argentina",
    "tasaciones",
    "alquiler",
    "comprar casa",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: AGENCIA.nombre,
    title: `${AGENCIA.nombre} — ${AGENCIA.tagline}`,
    description:
      "Propiedades en venta y alquiler en toda Argentina. Encontrá tu próxima propiedad con asesoría real.",
    images: [
      {
        url: "/hero-casa.webp",
        width: 1200,
        height: 630,
        alt: `${AGENCIA.nombre} — Propiedades en ${AGENCIA.zona_operacion}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${AGENCIA.nombre} — ${AGENCIA.tagline}`,
    description:
      "Propiedades en venta y alquiler en toda Argentina. Encontrá tu próxima propiedad con asesoría real.",
    images: ["/hero-casa.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

// Web CLARA (branding real): la barra del navegador (mobile) acompaña con el
// crema de marca. `colorScheme: light` evita que el navegador auto-oscurezca.
export const viewport: Viewport = {
  themeColor: "#f7e6a6",
  colorScheme: "light",
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
        {/* `reducedMotion="never"` — decisión deliberada, con su porqué:
            1) Ramificar el render con `useReducedMotion()` provoca un hydration
               mismatch garantizado (el servidor no tiene navegador: devuelve
               `false` y pinta opacity:0, mientras un cliente con la preferencia
               activada devuelve `true` y pinta opacity:1). Ante un mismatch React
               DESCARTA el HTML del servidor y re-renderiza todo el árbol: era el
               motivo real del scroll trabado y del cartel de issues de Next.
            2) Pero `reducedMotion="user"` NO sirve acá: con la preferencia
               activada motion no anima NADA — tampoco la opacidad — y como las
               variantes arrancan en opacity:0, el contenido queda invisible para
               siempre. Verificado: dejaba 26 elementos con texto sin mostrarse.
            Con "never" el render es idéntico en servidor y cliente (no hay
            mismatch) y la animación SIEMPRE termina, así que el contenido nunca
            depende de una preferencia para verse. Las entradas son cortas y
            suaves (fade + 26px). Las animaciones CSS infinitas —marquee, aurora,
            float— siguen atenuadas por el @media de globals.css.
            DEUDA: soportar reduced-motion de verdad exige mover estos reveals a
            CSS con @media (prefers-reduced-motion), que se evalúa antes del
            primer paint y no necesita JS. */}
        <MotionConfig reducedMotion="never">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsappFloat />
          <AsesorChat />
        </MotionConfig>
      </body>
    </html>
  );
}
