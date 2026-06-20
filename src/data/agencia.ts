// Branding de INMOBILIARIA AMÉRICA CARDOZO (mono-tenant: vive en código).
//
// ⚠️ PLACEHOLDERS A CONFIRMAR CON NACHO: WhatsApp real, email, dirección, horario,
// Instagram/Facebook, colores de marca definitivos + logo, años de experiencia y
// propiedades vendidas. Hasta entonces, branding tipográfico + paleta tentativa.

import type { Agencia } from "@/types";

export const AGENCIA: Agencia = {
  id: "america-cardozo",
  slug: "america-cardozo",
  nombre: "Inmobiliaria América Cardozo",
  tagline: "Tu próxima propiedad en Zona Oeste",
  logoTexto: "AMÉRICA CARDOZO",
  colores: {
    // PLACEHOLDER sobrio inmobiliario (azul profundo + dorado). Confirmar marca real.
    brand: "#0f2e4a",
    brandForeground: "#ffffff",
    accent: "#c9a227",
  },
  // WhatsApp público real de América Cardozo.
  whatsapp: "5491159307526",
  email: "",
  direccion: "",
  ciudad: "Buenos Aires, Argentina",
  zona_operacion: "GBA Zona Oeste",
  horario: "Coordiná tu visita por WhatsApp",
  redes: {},
  anios_experiencia: 0,
  propiedades_vendidas: 0,
};

// Alias retrocompatible: el código heredado de Press importa `AGENCIA_DEMO`.
export const AGENCIA_DEMO = AGENCIA;
