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
    // Marca real (del logo): ROJO + negro. Acento ámbar (el amarillo del logo).
    brand: "#dc2626",
    brandForeground: "#ffffff",
    accent: "#f59e0b",
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
  },
  anios_experiencia: 20,
  propiedades_vendidas: 0,
};

// Alias retrocompatible: el código heredado de Press importa `AGENCIA_DEMO`.
export const AGENCIA_DEMO = AGENCIA;
