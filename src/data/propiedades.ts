// Mock de FALLBACK: solo se usa si Supabase no responde o no hay env vars.
// En runtime normal el catálogo viene de las vistas `propiedades_publicas` /
// `fotos_publicas`. Sin fotos reales: el componente de imagen cae a su placeholder.

import type { Propiedad, FotoPropiedad } from "@/types";
import { propiedadSlug, idFromSlug } from "@/lib/slug";

type Seed = Partial<Propiedad> &
  Pick<Propiedad, "id" | "titulo" | "tipo_propiedad" | "tipo_operacion">;

const SEEDS: Seed[] = [
  {
    id: "demo-1",
    titulo: "Casa 3 dormitorios con parrilla y patio",
    tipo_propiedad: "Casa",
    tipo_operacion: "venta",
    precio: 145000,
    moneda: "USD",
    dormitorios: 3,
    banos: 2,
    cocheras: 1,
    superficie_total: 250,
    superficie_cubierta: 140,
    barrio: "Paso del Rey",
    ciudad: "Moreno",
    provincia: "G.B.A. Zona Oeste",
    destacada_web: true,
    tags: ["Parrilla", "Patio", "Gas Natural", "Cochera", "Lavadero"],
    descripcion:
      "Casa luminosa a refaccionar a gusto, sobre lote propio con amplio fondo. Excelente ubicación a metros de la estación.",
  },
  {
    id: "demo-2",
    titulo: "Departamento 2 ambientes a estrenar",
    tipo_propiedad: "Departamento",
    tipo_operacion: "alquiler",
    precio: 320000,
    moneda: "ARS",
    expensas: 45000,
    dormitorios: 1,
    banos: 1,
    superficie_total: 48,
    barrio: "Moreno Centro",
    ciudad: "Moreno",
    provincia: "G.B.A. Zona Oeste",
    destacada_web: true,
    tags: ["Balcón", "Cocina integrada", "Luminoso", "Apto profesional"],
    descripcion:
      "Departamento a estrenar en pleno centro, con balcón al frente. Ideal pareja o profesional.",
  },
  {
    id: "demo-3",
    titulo: "PH 3 ambientes con cochera",
    tipo_propiedad: "PH",
    tipo_operacion: "venta",
    precio: 89000,
    moneda: "USD",
    dormitorios: 2,
    banos: 1,
    cocheras: 1,
    superficie_total: 110,
    superficie_cubierta: 75,
    barrio: "General Rodríguez",
    ciudad: "General Rodríguez",
    provincia: "G.B.A. Zona Oeste",
    destacada_web: false,
    tags: ["Patio", "Parrilla", "Gas Natural", "Sin expensas"],
    descripcion: "PH al frente sin expensas, con patio propio y cochera. Muy buena oportunidad.",
  },
  {
    id: "demo-4",
    titulo: "Terreno lote propio apto construcción",
    tipo_propiedad: "Terreno",
    tipo_operacion: "venta",
    precio: 32000,
    moneda: "USD",
    superficie_total: 300,
    frente: 10,
    fondo: 30,
    barrio: "La Reja",
    ciudad: "Moreno",
    provincia: "G.B.A. Zona Oeste",
    destacada_web: false,
    tags: ["Servicios en la zona", "Apto crédito"],
    descripcion: "Lote propio listo para construir, con todos los servicios sobre la calle.",
  },
];

const NO_FOTOS: FotoPropiedad[] = [];

export const PROPIEDADES_DEMO: Propiedad[] = SEEDS.map((s) => ({
  id: s.id,
  slug: propiedadSlug(s.titulo, s.id),
  titulo: s.titulo,
  descripcion: s.descripcion ?? "",
  reference_code: s.reference_code,
  tipo_propiedad: s.tipo_propiedad,
  tipo_operacion: s.tipo_operacion,
  ambientes: s.ambientes,
  dormitorios: s.dormitorios,
  banos: s.banos,
  toilettes: s.toilettes,
  cocheras: s.cocheras,
  plantas: s.plantas,
  antiguedad: s.antiguedad,
  superficie_total: s.superficie_total,
  superficie_cubierta: s.superficie_cubierta,
  superficie_semicubierta: s.superficie_semicubierta,
  superficie_descubierta: s.superficie_descubierta,
  metros_cubiertos: s.metros_cubiertos,
  frente: s.frente,
  fondo: s.fondo,
  precio: s.precio,
  moneda: s.moneda ?? "USD",
  precio_visible: s.precio_visible ?? true,
  expensas: s.expensas,
  apto_credito: s.apto_credito,
  barrio: s.barrio,
  ciudad: s.ciudad,
  zona: s.zona,
  provincia: s.provincia,
  destacada_web: s.destacada_web ?? false,
  tags: s.tags ?? [],
  fotos: NO_FOTOS,
}));

export function getPropiedades(): Propiedad[] {
  return PROPIEDADES_DEMO;
}

export function getPropiedadBySlug(slug: string): Propiedad | undefined {
  const id = idFromSlug(slug);
  return PROPIEDADES_DEMO.find((p) => p.id === id || p.slug === slug);
}

export function getDestacadas(): Propiedad[] {
  return PROPIEDADES_DEMO.filter((p) => p.destacada_web);
}
