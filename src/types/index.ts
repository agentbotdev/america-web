// Tipos del dominio — Web pública INMOBILIARIA América Cardozo.
// Derivados del schema REAL de la vista `propiedades_publicas` (Supabase
// kywossjvyttklegvqgtt). Una sola fuente de verdad: la DB. Los numéricos de
// Postgres (numeric) llegan como string vía supabase-js → el mapper los parsea.

export type TipoOperacion = "venta" | "alquiler";
export type Moneda = "USD" | "ARS";

/** Tipos de propiedad reales en el catálogo (texto legible que ya trae Tokko). */
export type TipoPropiedad =
  | "Casa"
  | "Departamento"
  | "PH"
  | "Terreno"
  | "Quinta"
  | "Local"
  | "Campo"
  | "Galpón"
  | "Oficina"
  | "Cochera"
  | "Edificio Comercial"
  | (string & {}); // tolera valores nuevos sin romper el tipado

export interface FotoPropiedad {
  url: string;
  thumbnail?: string;
  alt?: string;
  es_portada?: boolean;
  es_plano?: boolean;
  orden?: number;
}

/** Entidad central del catálogo. Mapea la vista `propiedades_publicas`. */
export interface Propiedad {
  id: string; // tokko_id (PK)
  slug: string; // URL indexable: /propiedad/{slug} → termina en el tokko_id
  titulo: string;
  descripcion: string;
  reference_code?: string;

  tipo_propiedad: TipoPropiedad;
  tipo_propiedad_code?: string;
  tipo_operacion: TipoOperacion;
  estado_propiedad?: string;

  // Ambientes / físicas
  ambientes?: number;
  dormitorios?: number;
  banos?: number;
  toilettes?: number;
  cocheras?: number;
  plantas?: number;
  antiguedad?: number;

  // Superficies (m²)
  superficie_total?: number;
  superficie_cubierta?: number;
  superficie_semicubierta?: number;
  superficie_descubierta?: number;
  metros_cubiertos?: number;
  frente?: number;
  fondo?: number;

  // Precio: `precio`/`moneda` ya vienen resueltos según la operación.
  precio?: number;
  moneda?: Moneda;
  precio_venta?: number;
  precio_alquiler?: number;
  precio_visible: boolean;
  expensas?: number;
  apto_credito?: string; // texto: "Apto crédito" | "No especificado" | "No elegible"

  // Ubicación
  barrio?: string;
  ciudad?: string;
  zona?: string;
  provincia?: string;
  direccion_publica?: string;
  location_short?: string;
  location_full?: string;
  coordenadas_lat?: number;
  coordenadas_lng?: number;

  // Flags / extras
  destacada_web: boolean;
  alquiler_temporal?: boolean;
  tags: string[]; // amenities + servicios, ya en español ("Parrilla", "Gas Natural"...)
  tiene_video?: boolean;
  orientacion?: string;

  // Media
  fotos: FotoPropiedad[];
}

export interface BrandColors {
  brand: string;
  brandForeground: string;
  accent: string;
}

/** La inmobiliaria. Branding mono-tenant en código. */
export interface Agencia {
  id: string;
  slug: string;
  nombre: string;
  tagline: string;
  logoTexto: string;
  colores: BrandColors;
  whatsapp: string; // E.164 sin "+", ej. 5491100000000
  email: string;
  direccion: string;
  ciudad: string;
  zona_operacion: string;
  horario: string;
  redes: { instagram?: string; facebook?: string };
  anios_experiencia: number;
  propiedades_vendidas: number;
}

/** Item de favoritos (sin login, persistido por localStorage). */
export interface Favorito {
  propiedadId: string;
}

/** Resultado del simulador de crédito hipotecario (sistema francés). */
export interface CuotaHipoteca {
  montoPropiedad: number;
  anticipo: number;
  montoFinanciar: number;
  plazoAnios: number;
  tasaAnual: number; // TNA decimal (0.08 = 8%)
  cuotaMensual: number;
  totalPagado: number;
  totalIntereses: number;
  moneda: Moneda;
}

/** Resultado de la calculadora de costos de ingreso a un alquiler. */
export interface CostoAlquiler {
  alquilerMensual: number;
  totalIngreso: number;
  desglose: { concepto: string; monto: number }[];
  moneda: Moneda;
}
