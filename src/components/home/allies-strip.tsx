import Image from "next/image";
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
  // Portales donde publica la inmobiliaria. El de Mercado Libre es el REAL
  // del CDN oficial (logo_large_25years@2x). Zonaprop PENDIENTE: no existe
  // fuente utilizable — pedir el archivo al cliente o a su kit de prensa.
  {
    nombre: "Mercado Libre",
    rubro: "Portal — publicaciones activas",
    logo: "/aliados/mercado-libre.png",
    ancho: 269,
    alto: 69,
    claseAlto: "h-6", // wordmark apaisado: a h-10 quedaba gigante
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

      {/* Paso ágil y continuo, logos CHICOS (feedback: estaban muy grandes y
          pasaban lento). El gris→color al hover queda. */}
      {/* repeat=7: cada set de 5 logos mide ~386px (medido) — para que la cinta
          no muestre HUECO en monitores anchos, la mitad del track debe superar
          el viewport: 7 × 386 ≈ 2.7k px → cubre hasta QHD (2560). La duración
          escala con el track: 91s/7 = mismos 13s por set que eligió el cliente. */}
      <Marquee className="mt-6" duration={91} gap="1.75rem" repeat={7}>
        {ALIADOS.map((a) => {
          const claseAlto = a.claseAlto ?? "h-10";
          const logo = (
            <Image
              src={a.logo}
              alt={`${a.nombre} — ${a.rubro}`}
              width={a.ancho}
              height={a.alto}
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
