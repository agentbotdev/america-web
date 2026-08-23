import { Marquee } from "@/components/ui/marquee";

// Cinta de PROFESIONALES ALIADOS: la red con la que trabaja la inmobiliaria
// (arquitectura, diseño, renders). Es distinta de la futura cinta de PORTALES
// (Zonaprop, MercadoLibre) y de la de instituciones (Colegio de Martilleros):
// esas van en la página de Tasaciones y en el footer, respectivamente.
//
// TRATAMIENTO VISUAL: los logos entran en GRIS y se pintan al hover. Es el
// patrón estándar de "logo wall" — unifica marcas de estilos distintos sin que
// compitan entre sí ni con el rojo de América Cardozo.
//
// ⚠️ REQUISITO DE LOS ARCHIVOS: deben tener FONDO TRANSPARENTE (SVG o PNG con
// alfa). No hay CSS que borre un fondo sólido: un JPG con fondo negro se va a
// ver como un rectángulo negro, en gris o en color. Preferir SVG — escala sin
// pixelarse en retina y pesa menos.
//
// ⚠️ EXCEPCIÓN: un logo cuya identidad ES el color (por ejemplo una acuarela
// multicolor) se destruye en escala de grises. Para esos, poner
// `mantieneColor: true` y quedan a color siempre.

type Aliado = {
  nombre: string;
  rubro: string;
  /** Ruta dentro de /public. SVG o PNG con canal alfa. */
  logo: string;
  /** Ancho intrínseco para el layout (la altura se fija por CSS). */
  ancho: number;
  /** Alto intrínseco (para que next/image conozca el aspect real). */
  alto: number;
  /** Clase de altura: sellos cuadrados h-10; wordmarks anchos h-6/h-7. */
  claseAlto?: string;
  /** `true` = no se convierte a gris (logos donde el color ES la marca). */
  mantieneColor?: boolean;
  href?: string;
};

// INSTITUCIONES de las que forma parte la martillera (pedido de la dueña en el
// boceto: "adjuntar los logos a los que forma parte — Colegio de Martilleros,
// Grupo PRIN"). Los PNG salen de Drive con el fondo recortado por script
// (flood-fill desde los bordes: el blanco INTERNO de cada logo se conserva).
//
// PENDIENTES (profesionales aliados): Jorge Mignolo (arquitecto), Cecilia
// Mignolo (diseño gráfico), migserendersBim (renders). Falta que pasen los
// archivos; se suman acá con la misma mecánica.
const ALIADOS: Aliado[] = [
  {
    nombre: "Colegio de Martilleros y Corredores Públicos",
    rubro: "Depto. Judicial Moreno – Gral. Rodríguez",
    logo: "/aliados/colegio-martilleros.png",
    ancho: 170,
    alto: 169,
  },
  {
    nombre: "CEMAPCI",
    rubro: "Centro de Martilleros y Corredores — Moreno",
    logo: "/aliados/cemapci.png",
    ancho: 498,
    alto: 488,
  },
  {
    nombre: "Grupo PRIN",
    rubro: "Profesionales Inmobiliarios",
    logo: "/aliados/grupo-prin.png",
    ancho: 640,
    alto: 428,
  },
  // Portales donde publica la inmobiliaria (VERIFICADO: perfil activo en
  // Zonaprop desde 2010 — id 17068225 —, MercadoLibre y Argenprop). Los tres
  // logos son los REALES de los CDN oficiales de cada portal.
  {
    nombre: "Mercado Libre",
    rubro: "Portal — publicaciones activas",
    logo: "/aliados/mercado-libre.png",
    ancho: 269,
    alto: 69,
    claseAlto: "h-6", // wordmark apaisado: a h-10 quedaba gigante
  },
  {
    nombre: "Zonaprop",
    rubro: "Portal — publicaciones activas",
    logo: "/aliados/zonaprop.png",
    ancho: 400,
    alto: 174,
    claseAlto: "h-7", // wordmark apaisado, como el de ML
  },
  {
    nombre: "Argenprop",
    rubro: "Portal — publicaciones activas",
    logo: "/aliados/argenprop.png",
    ancho: 512,
    alto: 512,
  },
];

export function AlliesStrip() {
  if (ALIADOS.length === 0) return null;

  return (
    // Sin banda ni bordes: fondo uniforme con el resto de la página.
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Respaldo institucional y portales
        </p>
        <p className="mx-auto mt-2 max-w-md text-balance text-center text-sm text-muted-foreground">
          Martillera matriculada, miembro de las instituciones del sector.
          Publicamos en los principales portales del país.
        </p>
      </div>

      {/* PERFORMANCE — esta cinta era el mayor peso de la home.
          Medido en producción: 84 de las 96 imágenes del HTML eran estos logos
          (6 logos × repeat 7 × 2 copias que el marquee duplica para el loop), y
          cada <img> de next/image aporta ~561 bytes de markup con su srcset.
          Solos explicaban buena parte de los 307 KB de HTML.

          El repeat alto existía para que la cinta no mostrara hueco en pantallas
          anchas: el track debe medir al menos el ancho del viewport. Pero eso se
          consigue igual con MENOS COPIAS y MÁS AIRE — 6 logos más grandes con
          gap de 6rem miden ~1.5k px por set, y con repeat 2 el track pasa los
          2.9k px, suficiente hasta QHD. De 84 imágenes a 24: −71%.
          Bonus: los logos se ven más grandes, que era mejor de todos modos. */}
      <Marquee className="mt-6" duration={52} gap="6rem" repeat={2}>
        {ALIADOS.map((a) => {
          const claseAlto = a.claseAlto ?? "h-12";
          // <img> NATIVO, no next/image, y es a propósito. El optimizador genera
          // un srcset de 8 anchos por imagen — útil para una foto de propiedad
          // que se ve a 400px o a 1200px, inútil para un logo que SIEMPRE se
          // muestra a 48px de alto. Acá el srcset era puro markup: ~561 bytes por
          // logo contra ~90 del <img> plano, multiplicado por las copias del
          // marquee. Los PNG ya están recortados y pesan poco.
          // `decoding="async"` evita que el decodificado bloquee el hilo.
          const logo = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={a.logo}
              alt={`${a.nombre} — ${a.rubro}`}
              width={a.ancho}
              height={a.alto}
              loading="lazy"
              decoding="async"
              className={
                a.mantieneColor
                  ? `${claseAlto} w-auto object-contain`
                  : `${claseAlto} w-auto object-contain grayscale opacity-55 transition duration-500 hover:grayscale-0 hover:opacity-100`
              }
            />
          );

          return (
            <li key={a.nombre} className="flex shrink-0 items-center">
              {a.href ? (
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${a.nombre} — ${a.rubro}`}
                  className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {logo}
                </a>
              ) : (
                logo
              )}
            </li>
          );
        })}
      </Marquee>
    </section>
  );
}
