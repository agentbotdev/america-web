import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el badge de Next.js del dev server (el logito flotante con el
  // contador de issues abajo a la izquierda). Es SOLO de desarrollo — en
  // producción no existe — pero molesta al revisar el diseño.
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        // Fotos reales de las propiedades (sincronizadas desde Tokko Broker).
        protocol: "https",
        hostname: "static.tokkobroker.com",
        pathname: "/**",
      },
      {
        // Fotos propias subidas a Supabase Storage (fallback / futuras).
        protocol: "https",
        hostname: "kywossjvyttklegvqgtt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
