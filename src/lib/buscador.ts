// ═══════════════════════════════════════════════════════════════════════════════════════════
// MOTOR DE BÚSQUEDA DE PROPIEDADES — EL MISMO EN EL CRM Y EN LA WEB (16/11)
//
// ⚠️ ESPEJO EXACTO: CRM `utils/buscador.ts` ⇄ web `src/lib/buscador.ts`. Es el MISMO archivo
// copiado tal cual (sin imports ni dependencias, a propósito). Si cambiás uno, copiá el otro.
//
// POR QUÉ UNO SOLO: Nacho (16/11) "tiene que haber el mejor buscador posible y unificado…
// errores de ortografía también… que esté en los dos el mejor". Hasta hoy el CRM buscaba con
// una función SQL (solo texto: "casa 3 dormitorios" daba 0) y la web con otro intérprete en el
// navegador (entendía tipo y ambientes pero no las abreviaturas ni los errores de tipeo). La
// misma frase daba resultados distintos según dónde la escribieras.
//
// CÓMO FUNCIONA, en orden:
//   1. Corrige errores de tipeo palabra por palabra contra el vocabulario REAL del catálogo
//      (barrios, calles, ciudades, títulos) más el del rubro (tipos, operaciones, comodidades):
//      "departamneto en moreon" → "departamento en moreno". Distancia de edición con
//      transposiciones y una versión fonética del castellano (b/v, s/z/c, ll/y, h muda).
//   2. Interpreta la frase: operación, tipo, ambientes, dormitorios, baños, cocheras, precio
//      ("hasta 100 mil dólares", "entre 50 y 80 mil") y comodidades ("con pileta", "sin
//      expensas" no: "sin pileta" sí excluye).
//   3. Lo que sobra es texto libre: cada palabra tiene que aparecer como comienzo de palabra en
//      título, dirección, barrio, zona, ciudad, código o etiquetas, con abreviaturas
//      ("gral" = general, "av" = avenida).
//   4. Si no hay nada exacto, prueba en la descripción, y si tampoco, muestra las que cumplen la
//      mayoría de las palabras — avisando que son parecidas, nunca como si fueran exactas.
//   5. Ordena por relevancia: coincidir en barrio/ciudad o en el título pesa más que coincidir
//      en una etiqueta; el código exacto va primero.
//
// Deliberadamente SIN IA ni servicios externos: el catálogo son cientos de fichas y la frase es
// corta; todo corre en el navegador en milisegundos y no cuesta nada por búsqueda.
// ═══════════════════════════════════════════════════════════════════════════════════════════

// Rango de marcas diacríticas (U+0300–U+036F) armado con códigos: escrito como literal se
// rompe al copiar el archivo entre editores, y `\p{M}` exige ES2018 (la web compila a ES2017).
const DIACRITICOS = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");

/** Quita tildes y pasa a minúsculas, para comparar sin sorpresas. */
export function normalizar(s: string | null | undefined): string {
  return (s ?? "").normalize("NFD").replace(DIACRITICOS, "").toLowerCase().trim();
}

/**
 * Texto listo para buscar: sin tildes ni signos, espacios simples. Los separadores de miles se
 * juntan ("14.500" → "14500") para que una altura o un precio se encuentren escritos de las
 * dos formas.
 */
export function textoBuscable(s: string | null | undefined): string {
  return normalizar(s)
    .replace(/(\d)[.,](?=\d{3}(\D|$))/g, "$1")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// ─── Vocabulario del rubro ─────────────────────────────────────────────────────────────────

/**
 * Tipos que entiende el buscador. `valor`: nombre que se muestra (y viaja en la URL de la web).
 * `incluye`: tipos de la base que también cuentan (un lote es un terreno; un monoambiente es un
 * departamento). `enTitulo`: se reconoce también por el título (la inmo carga dúplex y PH como
 * "Departamento" o "Casa" con "DUPLEX" en el título).
 */
const TIPOS: { valor: string; alias: string[]; incluye?: string[]; enTitulo?: RegExp }[] = [
  { valor: "Departamento", alias: ["departamento", "departamentos", "depto", "deptos", "dpto", "dptos", "depa", "dto"], incluye: ["monoambiente"] },
  // "chalet" NO es alias de Casa (16/11): buscar "chalet" devolvía TODAS las casas. Al revés sí:
  // un chalet es una casa, así que buscar "casa" los incluye.
  { valor: "Casa", alias: ["casa", "casas", "vivienda", "viviendas"], incluye: ["chalet"] },
  { valor: "Chalet", alias: ["chalet", "chalets"], enTitulo: /\bchalet\b/ },
  { valor: "Dúplex", alias: ["duplex", "duplexs", "duplexes", "triplex"], incluye: ["duplex"], enTitulo: /\b(duplex|triplex)\b/ },
  { valor: "PH", alias: ["ph"], enTitulo: /\bph\b/ },
  { valor: "Terreno", alias: ["terreno", "terrenos", "lote", "lotes", "loteo"], incluye: ["lote"] },
  // Por título también: "CASA CON LOCAL AL FRENTE" es una opción para quien busca un local.
  { valor: "Local", alias: ["local", "locales", "comercio", "negocio"], enTitulo: /\blocal(es)?\b/ },
  { valor: "Oficina", alias: ["oficina", "oficinas", "consultorio"] },
  { valor: "Galpón", alias: ["galpon", "galpones", "deposito", "nave"] },
  // "CASA QUINTA" se carga como Casa y muchos monoambientes como Departamento: título.
  { valor: "Quinta", alias: ["quinta", "quintas"], enTitulo: /\bquintas?\b/ },
  { valor: "Campo", alias: ["campo", "campos", "chacra", "hectareas"] },
  { valor: "Cochera", alias: ["cochera", "cocheras", "garage", "garaje"] },
  { valor: "Monoambiente", alias: ["monoambiente", "monoambientes", "mono"], enTitulo: /\bmonoambientes?\b/ },
  { valor: "Edificio Comercial", alias: [] },
];

const OPERACIONES: { valor: string; alias: string[] }[] = [
  { valor: "venta", alias: ["venta", "ventas", "vender", "comprar", "compra", "vendo", "vende"] },
  { valor: "alquiler", alias: ["alquiler", "alquileres", "alquilar", "alquilo", "alquila", "renta", "rentar"] },
];

/** Comodidades: si la frase nombra una, la propiedad la tiene que tener (etiquetas, título o descripción). */
const COMODIDADES: { clave: string; alias: string[] }[] = [
  { clave: "pileta", alias: ["pileta", "piletas", "piscina", "pile"] },
  { clave: "quincho", alias: ["quincho"] },
  { clave: "parrilla", alias: ["parrilla", "parrillero", "asador"] },
  { clave: "patio", alias: ["patio"] },
  { clave: "jardin", alias: ["jardin"] },
  { clave: "balcon", alias: ["balcon", "balcones"] },
  { clave: "terraza", alias: ["terraza"] },
  { clave: "galeria", alias: ["galeria"] },
  { clave: "lavadero", alias: ["lavadero"] },
  { clave: "baulera", alias: ["baulera"] },
  { clave: "ascensor", alias: ["ascensor"] },
  { clave: "gimnasio", alias: ["gimnasio", "gym"] },
  { clave: "sum", alias: ["sum"] },
  { clave: "seguridad", alias: ["seguridad", "vigilancia"] },
  { clave: "alarma", alias: ["alarma"] },
  { clave: "aire", alias: ["aire", "split"] },
  { clave: "calefaccion", alias: ["calefaccion", "radiante", "estufa"] },
  { clave: "amoblado", alias: ["amoblado", "amoblada", "amueblado", "amueblada"] },
  { clave: "mascotas", alias: ["mascota", "mascotas"] },
  { clave: "credito", alias: ["credito", "hipotecario"] },
  { clave: "estrenar", alias: ["estrenar"] },
  { clave: "escritura", alias: ["escritura", "escriturable"] },
  { clave: "financiado", alias: ["financiado", "financiada", "financiacion", "financia", "cuotas"] },
  { clave: "permuta", alias: ["permuta", "permuto", "permutar"] },
  { clave: "luminoso", alias: ["luminoso", "luminosa"] },
  { clave: "gas", alias: ["gas"] },
  { clave: "cloaca", alias: ["cloaca", "cloacas"] },
  { clave: "pavimento", alias: ["pavimento", "asfalto"] },
  { clave: "esquina", alias: ["esquina"] },
  { clave: "country", alias: ["country", "countries"] },
];

/** Palabras de unión que no aportan al filtro y sólo ensucian el texto libre. */
const VACIAS = new Set([
  "en", "de", "del", "la", "el", "los", "las", "un", "una", "por", "para", "con", "y", "o", "a", "al",
  "busco", "buscando", "quiero", "necesito", "zona", "calle", "que", "tenga", "tiene", "apto", "apta",
  "acondicionado", "natural", "barrio", "nro", "numero", "propiedad", "propiedades", "inmueble",
]);

/**
 * Abreviaturas de calles y nombres: LA MISMA LISTA que tenía la función SQL del CRM
 * (public.buscar_propiedades_catalogo). "gral rodriguez" encontraba 5 en la web y 12 en el CRM.
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
  ["sta", "santa"], ["sto", "santo"], ["sn", "san"],
  ["gdor", "gobernador"], ["ing", "ingeniero"], ["alte", "almirante"],
  ["diag", "diagonal"], ["cno", "camino"], ["esq", "esquina"], ["prof", "profesor"],
];

const PALABRAS_AMB = new Set(["amb", "ambiente", "ambientes"]);
const PALABRAS_DORM = new Set(["dorm", "dorms", "dormitorio", "dormitorios", "habitacion", "habitaciones", "hab", "cuarto", "cuartos"]);
const PALABRAS_BANO = new Set(["bano", "banos"]);
const PALABRAS_COCHERA = new Set(["cochera", "cocheras", "garage", "garaje", "estacionamiento"]);
const NUMEROS_PALABRA: Record<string, number> = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6 };
const PRECIO_HASTA = new Set(["hasta", "maximo", "max", "tope", "menos"]);
const PRECIO_DESDE = new Set(["desde", "minimo", "min", "mas"]);
const MONEDA_USD = new Set(["usd", "us", "dolares", "dolar", "verdes", "u"]);
const MONEDA_ARS = new Set(["pesos", "peso", "ars"]);
/** Palabras de precio que, si no armaron un precio, tampoco son texto a buscar ("hasta 3 amb"). */
const NO_SON_TEXTO = new Set<string>([...PRECIO_HASTA, ...PRECIO_DESDE, "entre", "mil", "sin", "y"]);

/** Todas las palabras del rubro: nunca se "corrigen" y son candidatas fuertes de corrección. */
const DOMINIO = new Set<string>([
  ...TIPOS.flatMap((t) => t.alias),
  ...OPERACIONES.flatMap((o) => o.alias),
  ...COMODIDADES.flatMap((c) => c.alias),
  ...ABREVIATURAS.flatMap(([c, l]) => [c, l]),
  ...PALABRAS_AMB, ...PALABRAS_DORM, ...PALABRAS_BANO, ...PALABRAS_COCHERA,
  ...Object.keys(NUMEROS_PALABRA),
  ...PRECIO_HASTA, ...PRECIO_DESDE, ...MONEDA_USD, ...MONEDA_ARS,
  "mil", "millon", "millones", "entre", "sin", "con",
]);

/** Las otras formas de escribir una palabra ("gral" → general, grl; "general" → gral, grl). */
function equivalentes(palabra: string): string[] {
  const largas = new Set(ABREVIATURAS.filter(([c, l]) => c === palabra || l === palabra).map(([, l]) => l));
  const out = new Set<string>();
  for (const [c, l] of ABREVIATURAS) if (largas.has(l)) { out.add(c); out.add(l); }
  out.delete(palabra);
  return Array.from(out);
}

const escaparRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** La palabra (o una equivalente) aparece como COMIENZO de palabra en el texto. */
function empiezaPalabra(palabra: string, texto: string | undefined): boolean {
  if (!texto) return false;
  return [palabra, ...equivalentes(palabra)].some((p) => new RegExp("(^| )" + escaparRe(p)).test(texto));
}

/** La palabra aparece ENTERA (no solo como comienzo): pesa más en el orden. */
function palabraEntera(palabra: string, texto: string | undefined): boolean {
  if (!texto) return false;
  return [palabra, ...equivalentes(palabra)].some((p) => new RegExp("(^| )" + escaparRe(p) + "( |$)").test(texto));
}

// ─── Corrección de errores de tipeo ────────────────────────────────────────────────────────

/** Versión "como suena" en castellano rioplatense: b/v, s/z/c, ll/y/i, h muda, qu/k/c. */
function fonetica(p: string): string {
  return p
    .replace(/x/g, "ks")
    .replace(/ch/g, "x")
    .replace(/h/g, "")
    .replace(/qu/g, "k")
    .replace(/c([aou])/g, "k$1")
    .replace(/c([ei])/g, "s$1")
    .replace(/z/g, "s")
    .replace(/v/g, "b")
    .replace(/w/g, "u")
    .replace(/ll/g, "i")
    .replace(/y/g, "i")
    .replace(/g([ei])/g, "j$1")
    .replace(/(.)\1+/g, "$1");
}

/** Distancia de edición con transposiciones (Damerau, versión OSA). Corta apenas supera `max`. */
function distancia(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = a.length, m = b.length;
  let prev2: number[] = [];
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= n; i++) {
    const cur = [i];
    let minFila = i;
    for (let j = 1; j <= m; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + costo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < minFila) minFila = v;
    }
    if (minFila > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[m];
}

/** Palabras conocidas del catálogo con su peso (cuántas veces aparecen). Ver `crearVocabulario`. */
export interface Vocabulario {
  palabras: Map<string, number>;
  fonetica: Map<string, string>;
}

/**
 * Arma el vocabulario de corrección a partir del catálogo cargado. Se llama UNA vez por catálogo
 * (memoizado) y se pasa a `interpretarBusqueda`. Sin vocabulario, igual se corrigen las palabras
 * del rubro (tipos, operaciones, comodidades).
 */
export function crearVocabulario(datos: Pick<DatosBuscables, "texto" | "extra">[]): Vocabulario {
  const palabras = new Map<string, number>();
  const sumar = (texto: string | undefined, peso: number) => {
    for (const w of (texto ?? "").split(" ")) {
      if (w.length < 3 || /\d/.test(w)) continue;
      palabras.set(w, (palabras.get(w) ?? 0) + peso);
    }
  };
  for (const d of datos) {
    sumar(d.texto, 3);
    sumar(d.extra, 1);
  }
  for (const w of Array.from(DOMINIO)) palabras.set(w, (palabras.get(w) ?? 0) + 1000);
  const fon = new Map<string, string>();
  palabras.forEach((_, w) => fon.set(w, fonetica(w)));
  return { palabras, fonetica: fon };
}

let vocabularioDelRubro: Vocabulario | null = null;
const vocabularioMinimo = () => (vocabularioDelRubro ??= crearVocabulario([]));

/**
 * Corrección de UNA palabra. `null` = está bien escrita (o no hay nada parecido). Las de una o
 * dos letras y los números no se corrigen: "ph", "av", "689" son demasiado ambiguos.
 */
function corregirPalabra(palabra: string, voc: Vocabulario): string | null {
  if (palabra.length < 3 || /\d/.test(palabra)) return null;
  if (voc.palabras.has(palabra)) return null;
  if (equivalentes(palabra).length) return null;
  // Comienzo de una palabra conocida ("castel" → castelar): es una búsqueda a medio escribir,
  // no un error.
  let esComienzo = false;
  voc.palabras.forEach((_, w) => { if (!esComienzo && w.length > palabra.length && w.startsWith(palabra)) esComienzo = true; });
  if (esComienzo) return null;

  // Tres letras: solo si SUENA igual a una palabra del catálogo ("rei" → rey) o está a un error
  // de una del rubro ("csa" → casa). Con más libertad, "sur" o "san" se volverían otra cosa.
  const corta = palabra.length === 3;
  const max = palabra.length <= 5 ? 1 : 2;
  const fon = fonetica(palabra);
  let mejor: string | null = null;
  let mejorD = Infinity;
  let mejorPeso = -1;
  voc.palabras.forEach((peso, w) => {
    if (Math.abs(w.length - palabra.length) > max + 1) return;
    // Suena igual ("lusuriaga" / "luzuriaga") cuenta casi como idéntica.
    const d = voc.fonetica.get(w) === fon ? 0.5 : distancia(palabra, w, max);
    if (d > max) return;
    if (corta && d >= 1 && !DOMINIO.has(w)) return;
    // La primera letra rara vez se equivoca: a igual distancia, gana la que empieza igual.
    const ajuste = w[0] === palabra[0] ? 0 : 0.25;
    const total = d + ajuste;
    if (total < mejorD || (total === mejorD && peso > mejorPeso)) {
      mejor = w;
      mejorD = total;
      mejorPeso = peso;
    }
  });
  return mejor;
}

// ─── Interpretación de la frase ────────────────────────────────────────────────────────────

export interface BusquedaInterpretada {
  /** "venta" | "alquiler" | undefined si no se mencionó. */
  operacion?: string;
  /** Uno de los `valor` de TIPOS (o un tipo del stock elegido en un filtro). */
  tipo?: string;
  /** Mínimos: "3 ambientes" → 3. */
  ambientes?: number;
  dormitorios?: number;
  banos?: number;
  cocheras?: number;
  /** Precio pedido en la frase ("hasta 100 mil dólares"). Sin moneda dicha, se infiere. */
  precioMin?: number;
  precioMax?: number;
  moneda?: "usd" | "ars";
  /** Claves de COMODIDADES que la propiedad tiene que tener / no tener ("sin pileta"). */
  comodidades?: string[];
  sinComodidades?: string[];
  /** Lo que sobró: se busca palabra por palabra (dirección, barrio, ciudad, código…). */
  texto: string;
  /**
   * La frase sin lo que se pasó a operación/tipo/ambientes/dormitorios: es lo que la web deja
   * en la caja de búsqueda cuando reparte esas partes en sus filtros (así el precio y las
   * comodidades no se pierden en el camino).
   */
  resto: string;
  /** Palabras corregidas, para mostrar "buscando «moreno»" cuando se escribió "moreon". */
  correcciones: { de: string; a: string }[];
}

const numero = (p: string | undefined): number | null => {
  if (!p) return null;
  if (/^\d+(\.\d+)?$/.test(p)) return Number(p);
  if (/^\d+k$/.test(p)) return Number(p.slice(0, -1)) * 1000;
  return NUMEROS_PALABRA[p] ?? null;
};

/**
 * Interpreta una frase de búsqueda libre.
 *
 * @example
 *   interpretarBusqueda("casa en venta")                → { operacion:"venta", tipo:"Casa", texto:"" }
 *   interpretarBusqueda("depto alquiler moreno")        → { operacion:"alquiler", tipo:"Departamento", texto:"moreno" }
 *   interpretarBusqueda("casa con pileta hasta 120 mil") → { tipo:"Casa", comodidades:["pileta"], precioMax:120000 }
 *   interpretarBusqueda("departamneto en moreon", voc)   → { tipo:"Departamento", texto:"moreno", correcciones:[…] }
 */
export function interpretarBusqueda(consulta: string, vocabulario?: Vocabulario): BusquedaInterpretada {
  const voc = vocabulario ?? vocabularioMinimo();
  // Antes de limpiar signos: monedas escritas con símbolos y montos con decimales.
  const previo = normalizar(consulta)
    .replace(/u\$s|us\$|u\$d|usd/g, " usd ")
    .replace(/\$/g, " pesos ")
    .replace(/(\d+)[.,](\d+)\s*(millon|millones)\b/g, (_, e, d) => String(Math.round(Number(e + "." + d) * 1e6)))
    .replace(/(\d)(amb|dorm|hab|banos?)\b/g, "$1 $2");
  const limpio = textoBuscable(previo);
  const vacia: BusquedaInterpretada = { texto: "", resto: "", correcciones: [] };
  if (!limpio) return vacia;

  const correcciones: { de: string; a: string }[] = [];
  const palabras = limpio.split(" ").map((p) => {
    const c = corregirPalabra(p, voc);
    if (c) { correcciones.push({ de: p, a: c }); return c; }
    return p;
  });

  const r: BusquedaInterpretada = { ...vacia, correcciones };
  const usadas = new Set<number>();        // pasaron a un filtro
  const usadasFiltroWeb = new Set<number>(); // de esas, las que la web reparte en sus filtros
  const comodidades = new Set<string>();
  const sinComodidades = new Set<string>();

  const monto = (i: number): { valor: number; hasta: number } | null => {
    const n = numero(palabras[i]);
    if (n == null) return null;
    let valor = n;
    let hasta = i;
    if (palabras[i + 1] === "mil") { valor *= 1000; hasta = i + 1; }
    else if (palabras[i + 1] === "millon" || palabras[i + 1] === "millones") { valor *= 1e6; hasta = i + 1; }
    return { valor, hasta };
  };
  const marcar = (desde: number, hasta: number, web = false) => {
    for (let k = desde; k <= hasta; k++) { usadas.add(k); if (web) usadasFiltroWeb.add(k); }
  };

  for (let i = 0; i < palabras.length; i++) {
    if (usadas.has(i)) continue;
    const p = palabras[i];
    const sig = palabras[i + 1];

    // Moneda suelta ("dólares", "usd", "pesos").
    if (MONEDA_USD.has(p) && (p !== "u" && p !== "us" || sig === "s" || /\d/.test(palabras[i - 1] ?? "") || /\d/.test(sig ?? ""))) {
      r.moneda = "usd"; marcar(i, sig === "s" ? i + 1 : i); continue;
    }
    if (MONEDA_ARS.has(p)) { r.moneda = "ars"; marcar(i, i); continue; }

    // Precio: "hasta 100 mil", "menos de 80000", "desde 50 mil", "entre 50 y 80 mil".
    if (p === "entre") {
      const a = monto(i + 1);
      const y = a && palabras[a.hasta + 1] === "y" ? monto(a.hasta + 2) : null;
      if (a && y) {
        // "entre 50 y 80 mil": el "mil" del segundo vale para los dos.
        const min = a.valor < 1000 && y.valor >= 1000 && palabras[a.hasta] !== "mil" ? a.valor * (y.valor / numero(palabras[a.hasta + 2])!) : a.valor;
        r.precioMin = min;
        r.precioMax = y.valor;
        marcar(i, y.hasta);
        continue;
      }
    }
    if (PRECIO_HASTA.has(p) || PRECIO_DESDE.has(p)) {
      const salto = sig === "de" ? 2 : 1;
      const m = monto(i + salto);
      if (m && (m.valor >= 1000 || palabras[m.hasta] === "mil" || /k$/.test(palabras[i + salto]))) {
        if (PRECIO_HASTA.has(p)) r.precioMax = m.valor; else r.precioMin = m.valor;
        marcar(i, m.hasta);
        continue;
      }
    }

    // "3 ambientes", "2 dorm", "dos baños", "2 cocheras": el número va con la palabra que sigue.
    const n = numero(p);
    if (n != null && sig && n <= 20) {
      if (PALABRAS_AMB.has(sig) && r.ambientes == null) { r.ambientes = n; marcar(i, i + 1, true); continue; }
      if (PALABRAS_DORM.has(sig) && r.dormitorios == null) { r.dormitorios = n; marcar(i, i + 1, true); continue; }
      if (PALABRAS_BANO.has(sig) && r.banos == null) { r.banos = n; marcar(i, i + 1); continue; }
      if (PALABRAS_COCHERA.has(sig) && r.cocheras == null) { r.cocheras = n; marcar(i, i + 1); continue; }
    }
    // Monto suelto con "mil"/"usd" ("casa 100 mil dólares"): se toma como tope.
    if (n != null && (sig === "mil" || sig === "millones" || sig === "millon" || /k$/.test(p))) {
      const m = monto(i)!;
      if (r.precioMax == null) { r.precioMax = m.valor; marcar(i, m.hasta); continue; }
    }

    // "con cochera" / "casa … cochera" → que tenga cochera; "cochera" sola → el tipo Cochera.
    if (PALABRAS_COCHERA.has(p)) {
      if (palabras[i - 1] === "con" || palabras[i - 1] === "sin" || r.tipo) {
        if (palabras[i - 1] === "sin") r.cocheras = 0; else r.cocheras = r.cocheras ?? 1;
        marcar(i, i);
        continue;
      }
    }

    if (!r.operacion) {
      const op = OPERACIONES.find((o) => o.alias.includes(p));
      if (op) { r.operacion = op.valor; marcar(i, i, true); continue; }
    }
    if (!r.tipo) {
      const t = TIPOS.find((x) => x.alias.includes(p));
      if (t) { r.tipo = t.valor; marcar(i, i, true); continue; }
    }

    const com = COMODIDADES.find((c) => c.alias.includes(p));
    if (com) {
      if (palabras[i - 1] === "sin") sinComodidades.add(com.clave); else comodidades.add(com.clave);
      marcar(i, i);
      continue;
    }
  }

  if (comodidades.size) r.comodidades = Array.from(comodidades);
  if (sinComodidades.size) r.sinComodidades = Array.from(sinComodidades);
  // Sin moneda dicha: un alquiler se piensa en pesos y una compra en dólares.
  if ((r.precioMin != null || r.precioMax != null) && !r.moneda) r.moneda = r.operacion === "alquiler" ? "ars" : "usd";

  r.texto = palabras.filter((p, i) => !usadas.has(i) && !VACIAS.has(p) && !NO_SON_TEXTO.has(p)).join(" ").trim();
  r.resto = palabras.filter((p, i) => !usadasFiltroWeb.has(i) && !VACIAS.has(p) || (!usadasFiltroWeb.has(i) && (p === "con" || p === "sin"))).join(" ").trim();
  return r;
}

/** ¿La frase pide algo? (vacía = mostrar todo). */
export function busquedaVacia(b: BusquedaInterpretada): boolean {
  return !b.operacion && !b.tipo && !b.texto && !b.ambientes && !b.dormitorios && !b.banos
    && b.cocheras == null && b.precioMin == null && b.precioMax == null
    && !b.comodidades?.length && !b.sinComodidades?.length;
}

// ─── Lo buscable de cada propiedad ─────────────────────────────────────────────────────────

/**
 * Lo mínimo de una propiedad para decidir si coincide con una búsqueda. La web lo arma en el
 * servidor para cada pin del mapa (sin descripción, para no inflar la página) y el navegador
 * para las propiedades completas; el CRM, para todo su catálogo.
 */
export interface DatosBuscables {
  /**
   * tokko_id normalizado: buscar el código exacto lo trae primero. Ni `id` ni `precio` ni
   * `moneda` a propósito: los pines del mapa ya usan esos nombres (con otro formato) y el
   * spread `{ ...pin, ...datosBuscables(p) }` los pisaría.
   */
  codigo?: string;
  /** tipo_propiedad normalizado ("departamento"). */
  tipo: string;
  operacion: string;
  ambientes: number;
  dormitorios: number;
  banos?: number;
  cocheras?: number;
  precioBuscable?: number | null;
  /** "usd" | "ars". */
  monedaBuscable?: string;
  /** Título, dirección, barrio, zona, ciudad, ubicación, código y etiquetas, normalizados. */
  texto: string;
  /**
   * Solo el título: para reconocer el tipo por título (Dúplex, Quinta…). NO se llama `titulo`
   * a propósito: los pines del mapa hacen `{ titulo, ...datosBuscables(p) }` y lo pisaría.
   */
  tituloBuscable: string;
  /** Barrio, zona, ciudad y ubicación: coincidir acá pesa más en el orden. */
  ubicacionBuscable?: string;
  /** Descripción: solo se mira si no hay nada exacto en lo de arriba. */
  extra?: string;
}

const monedaNormal = (m: string | null | undefined): string | undefined => {
  const t = normalizar(m);
  if (!t) return undefined;
  return /us|dol|u\$/.test(t) ? "usd" : "ars";
};

export function datosBuscables(
  p: {
    tokko_id?: string;
    titulo?: string | null;
    tipo_propiedad?: string | null;
    tipo_operacion?: string | null;
    ambientes?: number | null;
    dormitorios?: number | null;
    banos?: number | null;
    cocheras?: number | null;
    precio?: number | null;
    moneda?: string | null;
    precio_venta?: number | null;
    precio_alquiler?: number | null;
    moneda_venta?: string | null;
    moneda_alquiler?: string | null;
    direccion_publica?: string | null;
    barrio?: string | null;
    zona?: string | null;
    ciudad?: string | null;
    location_short?: string | null;
    reference_code?: string | null;
    /** Web: precio oculto ("Consultar") no se usa para filtrar por precio. */
    precio_visible?: boolean | null;
    tags?: string[] | null;
    descripcion?: string | null;
  },
  opciones: { sinDescripcion?: boolean } = {},
): DatosBuscables {
  const operacion = normalizar(p.tipo_operacion);
  const esAlquiler = operacion.includes("alquiler");
  const precio = p.precio ?? (esAlquiler ? p.precio_alquiler : p.precio_venta) ?? null;
  const moneda = p.moneda ?? (esAlquiler ? p.moneda_alquiler : p.moneda_venta) ?? null;
  // "G.B.A. Zona Oeste | Moron | Castelar": los separadores se vuelven espacios.
  const ubicacion = textoBuscable([p.barrio, p.zona, p.ciudad, p.location_short].filter(Boolean).join(" "));
  return {
    codigo: p.tokko_id ? normalizar(p.tokko_id) : undefined,
    tipo: normalizar(p.tipo_propiedad),
    operacion: esAlquiler ? "alquiler" : operacion.includes("venta") ? "venta" : operacion,
    ambientes: p.ambientes ?? 0,
    dormitorios: p.dormitorios ?? 0,
    banos: p.banos ?? 0,
    cocheras: p.cocheras ?? 0,
    precioBuscable: precio != null && Number(precio) > 0 && p.precio_visible !== false ? Number(precio) : null,
    monedaBuscable: monedaNormal(moneda),
    tituloBuscable: textoBuscable(p.titulo),
    ubicacionBuscable: ubicacion,
    texto: textoBuscable(
      // Sin tokko_id: los manuales son "manual-<uuid>" y buscar "manual" los traía a todos. El
      // código exacto se compara aparte (`id`).
      [p.titulo, p.direccion_publica, p.barrio, p.zona, p.ciudad, p.location_short, p.reference_code, ...(p.tags ?? [])]
        .filter(Boolean)
        .join(" "),
    ),
    extra: opciones.sinDescripcion ? undefined : textoBuscable(p.descripcion) || undefined,
  };
}

// ─── Coincidencia y orden ──────────────────────────────────────────────────────────────────

const tipoDef = (pedido: string) => TIPOS.find((t) => normalizar(t.valor) === pedido);

/**
 * ¿La propiedad es del tipo pedido? Sin mayúsculas ni tildes; un tipo incluye a sus variantes
 * (Terreno ⊃ lote, Casa ⊃ chalet, Departamento ⊃ monoambiente) y Dúplex/PH/Quinta se reconocen
 * también por el título.
 */
export function esDelTipo(tipoPedido: string, d: Pick<DatosBuscables, "tipo" | "tituloBuscable"> & { ambientes?: number }): boolean {
  const pedido = normalizar(tipoPedido);
  if (d.tipo === pedido) return true;
  const def = tipoDef(pedido);
  if (!def) return false;
  if (def.incluye?.includes(d.tipo)) return true;
  if (def.enTitulo && def.enTitulo.test(d.tituloBuscable)) return true;
  // Monoambiente cargado como Departamento de 1 ambiente.
  return pedido === "monoambiente" && d.tipo === "departamento" && d.ambientes === 1;
}

const tieneComodidad = (clave: string, d: DatosBuscables, conDescripcion: boolean): boolean => {
  const c = COMODIDADES.find((x) => x.clave === clave);
  if (!c) return false;
  return c.alias.some((a) => empiezaPalabra(a, d.texto) || (conDescripcion && empiezaPalabra(a, d.extra)));
};

/** Lo estructurado de la búsqueda (operación, tipo, números, precio, comodidades). */
function cumpleEstructura(b: BusquedaInterpretada, d: DatosBuscables): boolean {
  if (b.operacion && d.operacion !== b.operacion) return false;
  if (b.tipo && !esDelTipo(b.tipo, d)) return false;
  if (b.ambientes && d.ambientes < b.ambientes) return false;
  if (b.dormitorios && d.dormitorios < b.dormitorios) return false;
  if (b.banos && (d.banos ?? 0) < b.banos) return false;
  if (b.cocheras != null) {
    const tiene = (d.cocheras ?? 0) > 0 || tieneComodidad("cochera", d, false) || /(^| )(cochera|garage|garaje)/.test(d.texto);
    if (b.cocheras === 0 ? tiene : !tiene || ((d.cocheras ?? 0) > 0 && (d.cocheras ?? 0) < b.cocheras)) return false;
  }
  // Precio: una propiedad sin precio (consultar) no se descarta nunca por precio; una con precio
  // en otra moneda, sí (USD 150.000 y $150.000 no son lo mismo).
  if ((b.precioMin != null || b.precioMax != null) && d.precioBuscable != null) {
    if (b.moneda && d.monedaBuscable && d.monedaBuscable !== b.moneda) return false;
    if (b.precioMin != null && d.precioBuscable < b.precioMin) return false;
    if (b.precioMax != null && d.precioBuscable > b.precioMax) return false;
  }
  for (const c of b.comodidades ?? []) if (!tieneComodidad(c, d, true)) return false;
  for (const c of b.sinComodidades ?? []) if (tieneComodidad(c, d, false)) return false;
  return true;
}

const palabrasLibres = (b: BusquedaInterpretada) => b.texto.split(" ").filter(Boolean);

/** Una palabra libre coincide con la propiedad (código exacto, o comienzo de palabra). */
function coincidePalabra(w: string, d: DatosBuscables, conDescripcion: boolean): boolean {
  if (d.codigo && (d.codigo === w || (w.length >= 6 && d.codigo.startsWith(w)))) return true;
  if (empiezaPalabra(w, d.texto)) return true;
  return conDescripcion && empiezaPalabra(w, d.extra);
}

/** ¿La propiedad cumple la búsqueda? Cada palabra del texto libre tiene que aparecer. */
export function coincideBusqueda(b: BusquedaInterpretada, d: DatosBuscables, conDescripcion = false): boolean {
  if (!cumpleEstructura(b, d)) return false;
  return palabrasLibres(b).every((w) => coincidePalabra(w, d, conDescripcion));
}

/** Relevancia de una propiedad para la búsqueda: más alto, más arriba. */
export function puntaje(b: BusquedaInterpretada, d: DatosBuscables): number {
  let s = 0;
  for (const w of palabrasLibres(b)) {
    if (d.codigo === w) s += 50;
    if (palabraEntera(w, d.ubicacionBuscable)) s += 6;
    else if (empiezaPalabra(w, d.ubicacionBuscable)) s += 4;
    if (palabraEntera(w, d.tituloBuscable)) s += 4;
    else if (empiezaPalabra(w, d.tituloBuscable)) s += 3;
    if (empiezaPalabra(w, d.texto)) s += 1;
    else if (empiezaPalabra(w, d.extra)) s += 0.5;
  }
  if (b.tipo && d.tipo === normalizar(b.tipo)) s += 1;
  // "2 ambientes" es un MÍNIMO (igual que los filtros), pero las que tienen exactamente eso van
  // primero: quien escribe "depto 2 ambientes" casi siempre quiere 2.
  if (b.ambientes && d.ambientes === b.ambientes) s += 3;
  if (b.dormitorios && d.dormitorios === b.dormitorios) s += 3;
  return s;
}

export type NivelBusqueda = "todo" | "exacto" | "descripcion" | "aproximado" | "nada";

export interface ResultadoBusqueda<T> {
  items: T[];
  interpretacion: BusquedaInterpretada;
  /**
   * exacto: todo coincide · descripcion: alguna palabra está solo en la descripción ·
   * aproximado: ninguna cumple todo, son las que cumplen la mayoría (DECIRLO en pantalla) ·
   * nada: sin resultados · todo: búsqueda vacía.
   */
  nivel: NivelBusqueda;
}

/**
 * Busca en una lista y la devuelve ordenada por relevancia (a igual relevancia, en el orden en
 * que vino: el que llama decide si eso es "más nuevas primero").
 */
export function buscarEn<T>(
  items: T[],
  consulta: string | BusquedaInterpretada,
  aDatos: (item: T) => DatosBuscables,
  vocabulario?: Vocabulario,
): ResultadoBusqueda<T> {
  const b = typeof consulta === "string" ? interpretarBusqueda(consulta, vocabulario) : consulta;
  if (busquedaVacia(b)) return { items, interpretacion: b, nivel: "todo" };
  const filas = items.map((item, i) => ({ item, i, d: aDatos(item) }));
  const ordenar = (lista: typeof filas, extra?: (f: (typeof filas)[number]) => number) =>
    lista
      .map((f) => ({ ...f, s: puntaje(b, f.d) + (extra ? extra(f) * 100 : 0) }))
      .sort((x, y) => y.s - x.s || x.i - y.i)
      .map((f) => f.item);

  const exactos = filas.filter((f) => coincideBusqueda(b, f.d, false));
  if (exactos.length) return { items: ordenar(exactos), interpretacion: b, nivel: "exacto" };

  const palabras = palabrasLibres(b);
  if (palabras.length) {
    const conDescripcion = filas.filter((f) => coincideBusqueda(b, f.d, true));
    if (conDescripcion.length) return { items: ordenar(conDescripcion), interpretacion: b, nivel: "descripcion" };
  }
  if (palabras.length >= 2) {
    const minimo = Math.ceil(palabras.length / 2);
    const cuantas = (f: (typeof filas)[number]) => palabras.filter((w) => coincidePalabra(w, f.d, true)).length;
    const parecidas = filas.filter((f) => cumpleEstructura(b, f.d) && cuantas(f) >= minimo);
    if (parecidas.length) return { items: ordenar(parecidas, cuantas), interpretacion: b, nivel: "aproximado" };
  }
  return { items: [], interpretacion: b, nivel: "nada" };
}

const NOMBRE_COMODIDAD: Record<string, string> = {
  credito: "apto crédito", estrenar: "a estrenar", aire: "con aire acondicionado", mascotas: "apto mascotas",
  financiado: "con financiación", escritura: "con escritura", permuta: "acepta permuta", gas: "con gas natural",
  country: "en country", esquina: "en esquina", jardin: "con jardín", balcon: "con balcón", galeria: "con galería",
  calefaccion: "con calefacción", amoblado: "amoblado", luminoso: "luminoso", sum: "con SUM",
};

/** "Buscando: departamento · alquiler · 3+ amb. · moreno" — para mostrar qué se entendió. */
export function describirBusqueda(b: BusquedaInterpretada): string[] {
  const fmt = (n: number) => n.toLocaleString("es-AR");
  const partes: string[] = [];
  if (b.tipo) partes.push(b.tipo);
  if (b.operacion) partes.push(b.operacion === "venta" ? "Venta" : "Alquiler");
  if (b.ambientes) partes.push(`${b.ambientes}+ amb.`);
  if (b.dormitorios) partes.push(`${b.dormitorios}+ dorm.`);
  if (b.banos) partes.push(`${b.banos}+ baños`);
  if (b.cocheras === 0) partes.push("sin cochera");
  else if (b.cocheras) partes.push(b.cocheras > 1 ? `${b.cocheras}+ cocheras` : "con cochera");
  const mon = b.moneda === "ars" ? "$" : "USD";
  if (b.precioMin != null && b.precioMax != null) partes.push(`${mon} ${fmt(b.precioMin)} a ${fmt(b.precioMax)}`);
  else if (b.precioMax != null) partes.push(`hasta ${mon} ${fmt(b.precioMax)}`);
  else if (b.precioMin != null) partes.push(`desde ${mon} ${fmt(b.precioMin)}`);
  for (const c of b.comodidades ?? []) partes.push(NOMBRE_COMODIDAD[c] ?? `con ${c}`);
  for (const c of b.sinComodidades ?? []) partes.push(`sin ${c}`);
  if (b.texto) partes.push(`"${b.texto}"`);
  return partes;
}

// ─── Opciones de filtros a partir del stock ────────────────────────────────────────────────

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
    Array.from(variantes.entries()).sort(
      ([a, na], [b, nb]) =>
        Number(a === a.toUpperCase() && a !== a.toLowerCase()) -
          Number(b === b.toUpperCase() && b !== b.toLowerCase()) ||
        nb - na ||
        Number(a[0] !== a[0].toUpperCase()) - Number(b[0] !== b[0].toUpperCase()),
    )[0][0];
  return Array.from(grupos.values()).map(elegir).sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Tipos para los filtros: los del stock (sin duplicados) más los que se reconocen por
 * título (Dúplex, Chalet…) si hay alguno así, aunque esté cargado con otro tipo.
 */
export function tiposDelStock(props: { titulo?: string | null; tipo_propiedad?: string | null }[]): string[] {
  const tipos = opcionesUnicas(props.map((p) => p.tipo_propiedad));
  for (const t of TIPOS) {
    if (!t.enTitulo || tipos.some((x) => normalizar(x) === normalizar(t.valor))) continue;
    const re = t.enTitulo;
    if (props.some((p) => re.test(textoBuscable(p.titulo)))) tipos.push(t.valor);
  }
  return tipos.sort((a, b) => a.localeCompare(b, "es"));
}
