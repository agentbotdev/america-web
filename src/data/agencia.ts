// Branding de AMÉRICA CARDOZO — inmobiliaria (mono-tenant: vive en código).
// Datos reales del negocio (web americacardozo.com.ar + portales Zonaprop/MercadoLibre).
// Operan a NIVEL NACIONAL; la oficina central está en Paso del Rey, Moreno (Bs As).
//
// ⚠️ PENDIENTE de confirmar con el cliente: email, horario exacto, Facebook,
// logo gráfico definitivo, cantidad de propiedades vendidas.

import type { Agencia } from "@/types";

export const AGENCIA: Agencia = {
  id: "america-cardozo",
  slug: "america-cardozo",
  nombre: "América Cardozo",
  tagline: "Tu próxima propiedad te está esperando",
  logoTexto: "AMÉRICA CARDOZO",
  colores: {
    // Marca REAL, verificada en el CSS de americacardozo.com.ar (sitio Tokko):
    // rojo bermellón + crema pastel + negro. NO es el #dc2626/#f59e0b que
    // teníamos antes (eran una aproximación de memoria, no la marca).
    brand: "#f02e19", // rojo de marca: rellenos, íconos, bordes, badges
    brandForeground: "#ffffff",
    // El rojo de marca sobre fondo claro da 3.3:1 (crema) / 4.1:1 (blanco) →
    // NO pasa WCAG AA para texto. Este es el mismo rojo oscurecido a 5.7:1,
    // para links, labels y cualquier texto en rojo. La marca se respeta; se lee.
    brandText: "#c41f0d",
    accent: "#f7e6a6", // crema pastel: fondo de BANDA, no acento puntual
  },
  whatsapp: "5491159307526",
  email: "",
  direccion: "Bartolomé Mitre 1300, Paso del Rey, Moreno, Buenos Aires",
  ciudad: "Argentina",
  // Operación nacional: NO geo-específico, para no limitar el mensaje de marketing.
  zona_operacion: "todo el país",
  horario: "Coordiná tu visita por WhatsApp",
  redes: {
    instagram: "https://www.instagram.com/americacardozovende/",
    // VERIFICADO por búsqueda web: la página real es /americacardozoinmobiliaria
    // (el handle del boceto "/americacardozovende" era el de Instagram, no el
    // de Facebook — el link anterior estaba ROTO).
    facebook: "https://www.facebook.com/americacardozoinmobiliaria/",
    // VERIFICADO: canal enlazado desde el footer de americacardozo.com.ar.
    youtube: "https://www.youtube.com/@americacardozo1162",
    // Buscado y NO existe cuenta de la inmobiliaria (a la fecha). El ícono
    // aparece solo cuando se cargue una URL acá.
    tiktok: "",
  },
  anios_experiencia: 20,
  propiedades_vendidas: 0,
};

// Alias retrocompatible: el código heredado de Press importa `AGENCIA_DEMO`.
export const AGENCIA_DEMO = AGENCIA;
