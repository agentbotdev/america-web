// Intérprete de la búsqueda libre del hero.
//
// PROBLEMA QUE RESUELVE: el buscador mandaba el texto tal cual y el catálogo lo
// usaba como búsqueda literal sobre título/barrio/ciudad/descripción. Escribir
// "casa en venta" devolvía CERO resultados, porque ninguna propiedad tiene esa
// frase escrita. El cliente pidió poder combinar criterios en una sola frase.
//
// CÓMO FUNCIONA: separa la frase en tres partes — operación, tipo y texto
// libre — y cada una se aplica como el filtro que corresponde. "depto en
// alquiler en Moreno" pasa a ser: operación=alquiler, tipo=Departamento,
// texto="moreno".
//
// Deliberadamente SIN dependencias ni IA: es un matcher de sinónimos sobre una
// lista cerrada. La entrada es corta y el vocabulario inmobiliario es acotado.

/** Valores REALES de `tipo_propiedad` en la base, con sus sinónimos de uso. */
const TIPOS: { valor: string; alias: string[] }[] = [
  { valor: "Departamento", alias: ["departamento", "departamentos", "depto", "deptos", "dpto", "dptos", "depa"] },
  { valor: "Casa", alias: ["casa", "casas", "chalet", "vivienda"] },
  { valor: "PH", alias: ["ph"] },
  { valor: "Terreno", alias: ["terreno", "terrenos", "lote", "lotes", "loteo"] },
  { valor: "Local", alias: ["local", "locales", "comercio", "negocio"] },
  { valor: "Oficina", alias: ["oficina", "oficinas"] },
  { valor: "Galpón", alias: ["galpon", "galpones", "deposito", "depósito"] },
  { valor: "Quinta", alias: ["quinta", "quintas"] },
  { valor: "Campo", alias: ["campo", "campos", "chacra"] },
  { valor: "Cochera", alias: ["cochera", "cocheras", "garage", "garaje"] },
  { valor: "Monoambiente", alias: ["monoambiente", "mono"] },
];

const OPERACIONES: { valor: string; alias: string[] }[] = [
  { valor: "venta", alias: ["venta", "vender", "comprar", "compra", "vendo", "en venta"] },
  { valor: "alquiler", alias: ["alquiler", "alquilar", "alquilo", "renta", "rentar", "en alquiler"] },
];

/** Palabras de unión que no aportan al filtro y sólo ensucian el texto libre. */
const VACIAS = new Set([
  "en", "de", "del", "la", "el", "los", "las", "un", "una", "por",
  "para", "con", "y", "o", "a", "al", "busco", "quiero", "zona",
]);

/** Quita tildes y pasa a minúsculas, para comparar sin sorpresas. */
function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export interface BusquedaInterpretada {
  /** "venta" | "alquiler" | undefined si no se mencionó. */
  operacion?: string;
  /** Valor exacto de `tipo_propiedad`, o undefined. */
  tipo?: string;
  /** Lo que sobró: se usa como búsqueda de texto (barrio, ciudad, etc.). */
  texto: string;
}

/**
 * Interpreta una frase de búsqueda libre.
 *
 * @example
 *   interpretar("casa en venta")           → { operacion:"venta", tipo:"Casa", texto:"" }
 *   interpretar("depto alquiler moreno")   → { operacion:"alquiler", tipo:"Departamento", texto:"moreno" }
 *   interpretar("ph con patio")            → { tipo:"PH", texto:"patio" }
 *   interpretar("bella vista")             → { texto:"bella vista" }
 */
export function interpretarBusqueda(consulta: string): BusquedaInterpretada {
  const limpio = normalizar(consulta);
  if (!limpio) return { texto: "" };

  const palabras = limpio.split(/\s+/).filter(Boolean);
  const usadas = new Set<number>();

  let operacion: string | undefined;
  let tipo: string | undefined;

  // Se marca qué palabras se consumieron para no repetirlas en el texto libre:
  // sin esto, "casa en venta" seguiría filtrando por el texto "casa venta" y
  // volveríamos a cero resultados.
  palabras.forEach((palabra, i) => {
    if (!operacion) {
      const op = OPERACIONES.find((o) => o.alias.includes(palabra));
      if (op) {
        operacion = op.valor;
        usadas.add(i);
        return;
      }
    }
    if (!tipo) {
      const t = TIPOS.find((x) => x.alias.includes(palabra));
      if (t) {
        tipo = t.valor;
        usadas.add(i);
      }
    }
  });

  const texto = palabras
    .filter((p, i) => !usadas.has(i) && !VACIAS.has(p))
    .join(" ")
    .trim();

  return { operacion, tipo, texto };
}
