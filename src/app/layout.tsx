import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// `MotionConfig` se eliminó: existía para forzar `reducedMotion="never"` sobre
// todo el árbol y evitar un hydration mismatch de motion. Ya no hace falta —
// hero, deck, reveals, contadores, tilt y el proceso corren en CSS, donde la
// preferencia del usuario la resuelve `@media (prefers-reduced-motion)` sin
// ramificar el render. Y su sola presencia acá metía la librería (~160 KB) en
// el bundle de TODAS las páginas, aunque la página no animara nada.
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsappFloat } from "@/components/whatsapp/whatsapp-float";
// El asesor se carga DIFERIDO: pesaba en todas las páginas aunque casi nadie lo
// abra. El envoltorio existe porque `ssr: false` no se admite en un Server
// Component como este layout — ver el comentario del archivo.
import { AsesorChatLazy } from "@/components/chatbot/asesor-chat-lazy";
import { brandStyle } from "@/lib/brand";
import { AGENCIA } from "@/data/agencia";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://america-cardozo.vercel.app";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });
// VERSIÓN 2 ("Apple"): sin fuente de títulos aparte — los headings usan Geist
// vía `--font-heading: var(--font-sans)` en globals.css. Una sola familia,
// jerarquía por peso/tamaño/tracking.

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

// Web CLARA: la barra del navegador (mobile) acompaña con el marfil del fondo.
// `colorScheme: light` evita que el navegador auto-oscurezca.
export const viewport: Viewport = {
  themeColor: "#f7f0d5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable}`}
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
        {/* Skip link — WCAG 2.4.1 "Bypass Blocks" (nivel A). Invisible hasta que
            recibe foco por teclado; entonces aparece arriba a la izquierda.
            Sin esto, quien navega con teclado o lector de pantalla tiene que
            tabular por el logo y las 6 solapas del header EN CADA página antes
            de llegar al contenido. `sr-only` + `focus:not-sr-only` es el patrón
            estándar: no ocupa espacio ni se ve para el resto de los usuarios. */}
        <a
          href="#contenido"
          className="sr-only rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:outline-none focus:ring-2 focus:ring-foreground"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        {/* `tabIndex={-1}`: para que el navegador pueda MOVER el foco acá al
            seguir el skip link. Sin esto el link scrollea pero el foco queda
            en el header y el siguiente Tab vuelve a la navegación. */}
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <WhatsappFloat />
        <AsesorChatLazy />
      </body>
    </html>
  );
}
