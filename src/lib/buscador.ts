// Intérprete de la búsqueda libre (hero, barra de la home con el mapa y catálogo).
//
// PROBLEMA QUE RESUELVE: el buscador mandaba el texto tal cual y el catálogo lo
// usaba como búsqueda literal sobre título/barrio/ciudad/descripción. Escribir
// "casa en venta" devolvía CERO resultados, porque ninguna propiedad tiene esa
// frase escrita. El cliente pidió poder combinar criterios en una sola frase.
//
// CÓMO FUNCIONA: separa la frase en operación, tipo, ambientes/dormitorios y texto
// libre, y cada parte se aplica como el filtro que corresponde. "depto 3 ambientes
// en alquiler en Moreno" pasa a ser: operación=alquiler, tipo=Departamento,
// ambientes≥3, texto="moreno".
//
// RECLAMO DEL 24/10 ("los buscadores de la web andan peor que los del CRM", "no
// encontró la de Domínguez en Castelar"):
//  - El texto libre se buscaba solo en título, barrio, ciudad y amenities: NUNCA en la
//    dirección. "dominguez" daba cero aunque la propiedad estuviera publicada. Ahora
//    entran también la dirección pública, la zona, la ubicación y el código.
//  - El tipo se comparaba exacto: en la base hay "Departamento" y "departamento" (y
//    "Casa"/"casa"), así que un filtro dejaba afuera parte del stock. Ahora se compara
//    normalizado y las listas de filtros juntan las variantes.
//  - "Dúplex" no existía como tipo en la web: la inmo los carga como Departamento, Casa
//    o PH con "DUPLEX" en el título. Ahora es un tipo que se reconoce por las dos cosas.
//  - Las tildes: "ituzaingo" no encontraba "Ituzaingó" en el catálogo.
//
// Deliberadamente SIN dependencias ni IA: es un matcher de sinónimos sobre una
// lista cerrada. La entrada es corta y el vocabulario inmobiliario es acotado.

/** Quita tildes y pasa a minúsculas, para comparar sin sorpresas. */
export function normalizar(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Tipos que entiende el buscador. `valor` es el nombre que se muestra y que viaja en la
 * URL (`?tipo=`). `enTitulo`: el tipo también se reconoce por una palabra del título
 * (Dúplex y PH se cargan muchas veces como "Departamento" o "Casa").
 */
const TIPOS: { valor: string; alias: string[]; enTitulo?: RegExp }[] = [
  { valor: "Departamento", alias: ["departamento", "departamentos", "depto", "deptos", "dpto", "dptos", "depa"] },
  // "chalet" ya NO es alias de Casa (16/11): buscar "chalet" devolvía TODAS las casas (56).
  // Chalet es un tipo propio en el CRM (config/taxonomy.ts) y se reconoce también por título.
  { valor: "Casa", alias: ["casa", "casas", "vivienda"] },
  { valor: "Chalet", alias: ["chalet", "chalets"], enTitulo: /\bchalet\b/ },
  { valor: "Dúplex", alias: ["duplex", "duplexs", "duplexes", "triplex"], enTitulo: /\b(duplex|triplex)\b/ },
  { valor: "PH", alias: ["ph"], enTitulo: /\bph\b/ },
  { valor: "Terreno", alias: ["terreno", "terrenos", "lote", "lotes", "loteo"] },
  { valor: "Local", alias: ["local", "locales", "comercio", "negocio"] },
  { valor: "Oficina", alias: ["oficina", "oficinas"] },
  { valor: "Galpón", alias: ["galpon", "galpones", "deposito"] },
  // Quinta y Monoambiente también por título (16/11): hay "CASA QUINTA" cargadas como Casa y
  // monoambientes cargados como Departamento; "quinta" encontraba 9 de 15.
  { valor: "Quinta", alias: ["quinta", "quintas"], enTitulo: /\bquintas?\b/ },
  { valor: "Campo", alias: ["campo", "campos", "chacra"] },
  { valor: "Cochera", alias: ["cochera", "cocheras", "garage", "garaje"] },
  { valor: "Monoambiente", alias: ["monoambiente", "mono"], enTitulo: /\bmonoambientes?\b/ },
];

const OPERACIONES: { valor: string; alias: string[] }[] = [
  { valor: "venta", alias: ["venta", "vender", "comprar", "compra", "vendo"] },
  { valor: "alquiler", alias: ["alquiler", "alquilar", "alquilo", "renta", "rentar"] },
];

/** Palabras de unión que no aportan al filtro y sólo ensucian el texto libre. */
const VACIAS = new Set([
  "en", "de", "del", "la", "el", "los", "las", "un", "una", "por",
  "para", "con", "y", "o", "a", "al", "busco", "quiero", "zona", "calle",
]);

/**
 * Abreviaturas de calles y nombres: LA MISMA LISTA que el buscador del CRM (función SQL
 * public.buscar_propiedades_catalogo). "gral rodriguez" encontraba 5 propiedades en la web
 * y 12 en el CRM: la web buscaba "gral" literal y la mayoría dice "General Rodríguez".
 * Si cambia una, cambiar la otra.
 */
const ABREVIATURAS: [corta: string, larga: string][] = [
  ["av", "avenida"], ["avda", "avenida"], ["avd", "avenida"],
  ["pje", "pasaje"], ["psje", "pasaje"],
  ["gral", "general"], ["grl", "general"],
  ["cnel", "coronel"], ["crnel", "coronel"],
  ["cap", "capitan"], ["tte", "teniente"],
  ["dr", "doctor"], ["dra", "doctora"],
  ["pres", "presidente"], ["pdte", "presidente"], ["pte", "presidente"],
  ["bv", "bulevar"], ["blvd", "bulevar"], ["bvar", "bulevar"],
  ["sta", "santa"], ["sto", "santo"],
  ["gdor", "gobernador"], ["ing", "ingeniero"], ["alte", "almirante"],
  ["diag", "diagonal"], ["cno", "camino"], ["esq", "esquina"], ["prof", "profesor"],
];

/** Las otras formas de escribir una palabra ("gral" → general, grl; "general" → gral, grl). */
function equivalentes(palabra: string): string[] {
  const largas = new Set(ABREVIATURAS.filter(([c, l]) => c === palabra || l === palabra).map(([, l]) => l));
  const out = new Set<string>();
  for (const [c, l] of ABREVIATURAS) if (largas.has(l)) { out.add(c); out.add(l); }
  out.delete(palabra);
  return [...out];
}

/** La palabra aparece en el texto, o alguna equivalente como comienzo de palabra. */
function aparece(palabra: string, texto: string): boolean {
  if (texto.includes(palabra)) return true;
  return equivalentes(palabra).some((alt) => new RegExp(`(^|\\s)${alt}`).test(texto));
}

const PALABRAS_AMB = new Set(["amb", "ambiente", "ambientes"]);
const PALABRAS_DORM = new Set(["dorm", "dorms", "dormitorio", "dormitorios", "habitacion", "habitaciones", "hab"]);

export interface BusquedaInterpretada {
  /** "venta" | "alquiler" | undefined si no se mencionó. */
  operacion?: string;
  /** Uno de los `valor` de TIPOS (o un tipo del stock elegido en un filtro). */
  tipo?: string;
  /** "3 ambientes" → 3 (mínimo). */
  ambientes?: number;
  /** "2 dormitorios" → 2 (mínimo). */
  dormitorios?: number;
  /** Lo que sobró: se busca palabra por palabra (dirección, barrio, ciudad, etc.). */
  texto: string;
}

/**
 * Interpreta una frase de búsqueda libre.
 *
 * @example
 *   interpretarBusqueda("casa en venta")          → { operacion:"venta", tipo:"Casa", texto:"" }
 *   interpretarBusqueda("depto alquiler moreno")  → { operacion:"alquiler", tipo:"Departamento", texto:"moreno" }
 *   interpretarBusqueda("duplex 3 ambientes")     → { tipo:"Dúplex", ambientes:3, texto:"" }
 *   interpretarBusqueda("dominguez castelar")     → { texto:"dominguez castelar" }
 */
export function interpretarBusqueda(consulta: string): BusquedaInterpretada {
  // "3amb" / "2dorm" pegados se separan para que el número quede solo.
  const limpio = normalizar(consulta)
    .replace(/[.,;:|/()]+/g, " ")
    .replace(/(\d)(amb|dorm|hab)/g, "$1 $2");
  if (!limpio) return { texto: "" };

  const palabras = limpio.split(/\s+/).filter(Boolean);
  const usadas = new Set<number>();
  const r: BusquedaInterpretada = { texto: "" };

  palabras.forEach((palabra, i) => {
    if (usadas.has(i)) return;
    // "3 ambientes", "2 dorm": el número va con la palabra que le sigue.
    const siguiente = palabras[i + 1];
    if (/^\d{1,2}$/.test(palabra) && siguiente) {
      if (PALABRAS_AMB.has(siguiente) && r.ambientes == null) {
        r.ambientes = Number(palabra);
        usadas.add(i).add(i + 1);
        return;
      }
      if (PALABRAS_DORM.has(siguiente) && r.dormitorios == null) {
        r.dormitorios = Number(palabra);
        usadas.add(i).add(i + 1);
        return;
      }
    }
    if (!r.operacion) {
      const op = OPERACIONES.find((o) => o.alias.includes(palabra));
      if (op) {
        r.operacion = op.valor;
        usadas.add(i);
        return;
      }
    }
    if (!r.tipo) {
      const t = TIPOS.find((x) => x.alias.includes(palabra));
      if (t) {
        r.tipo = t.valor;
        usadas.add(i);
      }
    }
  });

  r.texto = palabras
    .filter((p, i) => !usadas.has(i) && !VACIAS.has(p))
    .join(" ")
    .trim();
  return r;
}

/**
 * Lo mínimo de una propiedad para decidir si coincide con una búsqueda. Lo arma el
 * servidor para cada pin del mapa (así el filtrado en vivo de la home no necesita bajar
 * todo el catálogo) y el navegador para las propiedades completas.
 */
export interface DatosBuscables {
  /** tipo_propiedad normalizado ("departamento"). */
  tipo: string;
  operacion: string;
  ambientes: number;
  dormitorios: number;
  /** Título, dirección, barrio, zona, ciudad, ubicación, código y amenities, normalizados. */
  texto: string;
  /**
   * Solo el título, normalizado: para reconocer el tipo por título (Dúplex, Quinta…).
   * Antes se miraba `texto` entero y las comodidades colaban falsos ("monoambiente" traía
   * un galpón). NO se llama `titulo` a propósito: los pines del mapa hacen
   * `{ titulo, ...datosBuscables(p) }` y pisaría el título que se muestra.
   */
  tituloBuscable: string;
}

export function datosBuscables(p: {
  titulo?: string;
  tipo_propiedad: string;
  tipo_operacion: string;
  ambientes?: number;
  dormitorios?: number;
  direccion_publica?: string;
  barrio?: string;
  zona?: string;
  ciudad?: string;
  location_short?: string;
  reference_code?: string;
  tags?: string[];
}): DatosBuscables {
  return {
    tipo: normalizar(p.tipo_propiedad),
    operacion: p.tipo_operacion,
    ambientes: p.ambientes ?? 0,
    dormitorios: p.dormitorios ?? 0,
    tituloBuscable: normalizar(p.titulo),
    texto: normalizar(
      [
        p.titulo,
        p.direccion_publica,
        p.barrio,
        p.zona,
        p.ciudad,
        // "G.B.A. Zona Oeste | Moron | Castelar": los separadores se vuelven espacios.
        p.location_short?.replace(/\|/g, " "),
        p.reference_code,
        ...(p.tags ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    ).replace(/[.,;:|/()]+/g, " "),
  };
}

/**
 * ¿La propiedad es del tipo pedido? Compara sin mayúsculas ni tildes, y para Dúplex y PH
 * mira también el título (los cargan como Departamento/Casa con "DUPLEX" en el título).
 */
export function esDelTipo(tipoPedido: string, d: Pick<DatosBuscables, "tipo" | "tituloBuscable">): boolean {
  const pedido = normalizar(tipoPedido);
  if (d.tipo === pedido) return true;
  const def = TIPOS.find((t) => normalizar(t.valor) === pedido);
  return !!def?.enTitulo && def.enTitulo.test(d.tituloBuscable);
}

/** ¿La propiedad cumple la búsqueda? Cada palabra del texto libre tiene que aparecer. */
export function coincideBusqueda(b: BusquedaInterpretada, d: DatosBuscables): boolean {
  if (b.operacion && d.operacion !== b.operacion) return false;
  if (b.tipo && !esDelTipo(b.tipo, d)) return false;
  if (b.ambientes && d.ambientes < b.ambientes) return false;
  if (b.dormitorios && d.dormitorios < b.dormitorios) return false;
  return normalizar(b.texto)
    .split(/\s+/)
    .filter(Boolean)
    .every((palabra) => aparece(palabra, d.texto));
}

/**
 * Opciones de un filtro (tipo, barrio) a partir del stock, sin duplicados por mayúsculas o
 * tildes: "Departamento" y "departamento" son UNA opción. Se muestra la variante más usada
 * que no esté toda en mayúsculas.
 */
export function opcionesUnicas(valores: (string | null | undefined)[]): string[] {
  const grupos = new Map<string, Map<string, number>>();
  for (const v of valores) {
    const limpio = (v ?? "").replace(/\s+/g, " ").trim();
    if (!limpio) continue;
    const k = normalizar(limpio);
    const variantes = grupos.get(k) ?? new Map<string, number>();
    variantes.set(limpio, (variantes.get(limpio) ?? 0) + 1);
    grupos.set(k, variantes);
  }
  const elegir = (variantes: Map<string, number>) =>
    [...variantes.entries()].sort(
      ([a, na], [b, nb]) =>
        Number(a === a.toUpperCase() && a !== a.toLowerCase()) -
          Number(b === b.toUpperCase() && b !== b.toLowerCase()) ||
        nb - na ||
        Number(a[0] !== a[0].toUpperCase()) - Number(b[0] !== b[0].toUpperCase()),
    )[0][0];
  return [...grupos.values()].map(elegir).sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Tipos para los filtros: los del stock (sin duplicados) más los que se reconocen por
 * título (Dúplex, Chalet…) si hay alguno así, aunque esté cargado con otro tipo.
 */
export function tiposDelStock(
  props: { titulo?: string; tipo_propiedad: string }[],
): string[] {
  const tipos = opcionesUnicas(props.map((p) => p.tipo_propiedad));
  for (const t of TIPOS) {
    if (!t.enTitulo || tipos.some((x) => normalizar(x) === normalizar(t.valor))) continue;
    const re = t.enTitulo;
    if (props.some((p) => re.test(normalizar(p.titulo)))) tipos.push(t.valor);
  }
  return tipos.sort((a, b) => a.localeCompare(b, "es"));
}
