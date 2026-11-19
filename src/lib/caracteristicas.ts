import { formatNumero } from "@/lib/format";

// Campos propios de cada tipo de propiedad que se cargan en el CRM (pestaña Características) y
// viajan en `propiedades.caracteristicas`. Las claves y etiquetas son las de
// `config/camposPorTipo.ts` del CRM: si se agrega un campo allá, se agrega acá con la misma clave.
// Los de opción ya vienen escritos para mostrar ("Asfalto", "24 horas"); los numéricos llevan unidad.

type Def = {
  label: string;
  /** Se guarda como número (aunque venga como texto desde el formulario). */
  numero?: boolean;
  /** Unidad para los numéricos ("m", "km"). */
  unidad?: string;
  /** Texto especial para el cero; sin esto, un cero no se muestra (es "no tiene"). */
  cero?: string;
};

const CAMPOS: Record<string, Def> = {
  tipo_campo: { label: "Tipo de campo" },
  tipo_galpon: { label: "Tipo de galpón" },
  tipo_cochera: { label: "Tipo de cochera" },
  acceso_terreno: { label: "Acceso" },
  acceso_cochera: { label: "Acceso" },
  cobertura_cochera: { label: "Cobertura" },
  forma_terreno: { label: "Forma del terreno" },
  disposicion_lote: { label: "Ubicación del lote" },
  distancia_asfalto_km: { label: "Distancia al asfalto", numero: true, unidad: "km", cero: "Sobre asfalto" },
  seguridad: { label: "Seguridad" },
  sup_balcon: { label: "Balcón", numero: true, unidad: "m²" },
  bauleras: { label: "Bauleras", numero: true },
  altura_m: { label: "Altura libre", numero: true, unidad: "m" },
  soporte_piso_t_m2: { label: "Soporte de piso", numero: true, unidad: "t/m²" },
  muelles_carga: { label: "Muelles de carga", numero: true },
  oficinas: { label: "Oficinas", numero: true },
  oficinas_por_piso: { label: "Oficinas por piso", numero: true },
  banos_por_piso: { label: "Baños por piso", numero: true },
};

/** Orden de aparición: primero lo que define el tipo, después el resto. */
const ORDEN = Object.keys(CAMPOS);

const decimales = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

/** Pares etiqueta/valor listos para la ficha, solo los que tienen dato. */
export function caracteristicasParaMostrar(
  c: Record<string, string | number> | null | undefined,
): { label: string; value: string }[] {
  if (!c) return [];
  const out: { label: string; value: string }[] = [];
  for (const clave of ORDEN) {
    const v = c[clave];
    const def = CAMPOS[clave];
    if (v == null || v === "") continue;
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    if (def.numero) {
      if (!Number.isFinite(n)) continue;
      if (n === 0) {
        if (def.cero) out.push({ label: def.label, value: def.cero });
        continue;
      }
      const num = Number.isInteger(n) ? formatNumero(n) : decimales.format(n);
      out.push({ label: def.label, value: def.unidad ? `${num} ${def.unidad}` : num });
    } else {
      out.push({ label: def.label, value: String(v) });
    }
  }
  return out;
}
