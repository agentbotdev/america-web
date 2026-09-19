import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el badge de Next.js del dev server (el logito flotante con el
  // contador de issues abajo a la izquierda). Es SOLO de desarrollo — en
  // producción no existe — pero molesta al revisar el diseño.
  devIndicators: false,
  async redirects() {
    return [
      {
        // Reunión 18/09 (Moria): la sección "Nosotros" pasa a llamarse
        // "Administración" — el quiénes somos ahora convive con el servicio
        // de administración de alquileres. La URL vieja redirige permanente.
        source: "/nosotros",
        destination: "/administracion",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // SRCSET RECORTADO — pesa en el HTML, no en las imágenes.
    // Next genera por defecto 8 deviceSizes + 8 imageSizes, o sea hasta 16
    // variantes por imagen, y cada URL `/_next/image?url=…&w=…&q=…` ocupa ~150
    // bytes de markup. Medido en la home: 164 URLs de fotos para apenas 16
    // propiedades — el srcset era el grueso del HTML.
    // Estos anchos cubren los breakpoints REALES del sitio (mobile, tablet,
    // desktop, retina) sin escalones intermedios que el navegador casi nunca
    // elige. El usuario ve la misma nitidez con la mitad de markup.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [128, 256, 384],
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
      {
        // Thumbnails de YouTube: portada de los videos de emprendimientos
        // cuando el proyecto no tiene imagen propia cargada.
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        // QR del brochure. Registrado acá para poder servirlo a través del
        // optimizador de Next en vez de apuntar al dominio externo, y NO es
        // por peso: es lo que hace posible exportar el PDF.
        // html2canvas rasteriza el DOM en un <canvas>, y una imagen de otro
        // origen sin cabecera CORS lo "contamina" — el canvas deja de poder
        // leerse y la exportación falla entera. Ni Tokko ni qrserver mandan
        // Access-Control-Allow-Origin. Pasando por /_next/image la imagen se
        // sirve desde NUESTRO dominio y el problema desaparece.
        // Ése era el motivo real de que "Descargar PDF" cayera al modo
        // impresión: el fallback del catch se disparaba siempre.
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "/v1/create-qr-code/**",
      },
    ],
  },
};

export default nextConfig;
