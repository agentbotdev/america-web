"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Tag, Landmark, Calculator } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { AGENCIA } from "@/data/agencia";
import { FavoritesSheet } from "@/components/favoritos/favorites-sheet";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { mensajeGeneral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// Solapas en MAYÚSCULA (pedido de la dueña, tipografía como la del footer).
// Renombres: Propiedades→INMUEBLES, Crédito→FINANCIAMOS. Nueva: EMPRENDIMIENTOS.
// Reunión 18/09: "Calculadora" sale del nav (vive DENTRO de Financiamos, con
// sub-navegación cruzada entre las dos herramientas) y "Nosotros" pasa a
// llamarse "Administración" (quiénes somos + cómo administramos, pedido de Moria).
const NAV = [
  { href: "/propiedades", label: "Inmuebles" },
  { href: "/emprendimientos", label: "Emprendimientos" },
  { href: "/credito-hipotecario", label: "Financiamos" },
  { href: "/vende-tu-propiedad", label: "Vendé tu propiedad" },
  { href: "/administracion", label: "Administración" },
];

// Accesos rápidos SIEMPRE VISIBLES en mobile (pedido del cliente: los pills
// rojos del hero quedaban abajo de todo — acá viven fijos en el top bar).
// En md+ desaparecen: la nav de escritorio ya tiene estos destinos.
// `label` es el texto de escritorio; `corto` el de la barra mobile.
// Medido a 375px: con los textos largos los tres accesos pedían 481px contra
// 343px disponibles — sobraban 138px y había que deslizar la fila para ver el
// tercero (el cliente lo marcó). Con los cortos entran los tres de una.
const ACCESOS_MOBILE = [
  { href: "/vende-tu-propiedad", label: "Vendé tu propiedad", corto: "Vender", icon: Tag },
  { href: "/credito-hipotecario", label: "Financiamos", corto: "Crédito", icon: Landmark },
  { href: "/calculadora-alquiler", label: "Calculadora", corto: "Alquiler", icon: Calculator },
];

// Marca un item como activo cuando estamos en su ruta o en una subruta de ella.
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Logo REAL de la marca, SOLO el círculo (pedido del cliente: sin el wordmark
// de texto al lado — el badge ya dice "AMERICA CARDOZO VENDE"). Un poco más
// grande para que el texto interno se lea.
function Logo() {
  return (
    <Link
      href="/"
      aria-label={AGENCIA.nombre}
      className="group flex items-center"
    >
      {/* Versión FLAT (sin el círculo crema): el fondo de la página ES el crema
          del logo, así que el texto se apoya directo — fusión perfecta, sin
          borde visible sea cual sea el tono de pantalla. */}
      <Image
        src="/marca/america-cardozo-flat.png"
        alt=""
        width={329}
        height={204}
        priority
        className="h-12 w-auto shrink-0 transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    // Header SÓLIDO, sin `backdrop-filter` — por dos razones que ya se pagaron:
    // 1) Un fondo translúcido dejaba ver el contenido sangrando por debajo al
    //    scrollear (se corrigió en el commit m6jUQbY con fondo sólido).
    // 2) Al ser sticky, su backdrop-filter obligaba a recomponer todo lo que
    //    pasa por detrás en CADA frame: era el mayor costo de scroll de la web.
    // Sólido resuelve las dos de una: se ve mejor y no cuesta nada.
    // Hairline inferior: en el lenguaje sobrio el borde fino ES la estructura.
    // (No es el caso de los "cortes" que marcó el cliente — aquello eran bandas
    // de color distinto entre secciones, no una línea de 1px bajo el header.)
    <header className="sticky top-0 z-50 border-b border-foreground/[0.07] bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* MAYÚSCULA + tracking (tipografía como los títulos del footer),
            texto un punto más chico para que entren las 6 solapas. */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-7">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
                className={cn(
                  "nav-underline text-xs font-semibold uppercase tracking-wider transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <FavoritesSheet />
          {/* `lg:` y no `sm:`: a 768–1023px las 6 solapas + el corazón ya llenan
              la fila y este botón era EL elemento que desbordaba el viewport
              (medido: scrollWidth 802 vs 768 — quedaba cortado por el clip).
              En ese rango el WhatsApp vive en el FAB flotante y en cada card. */}
          <div className="hidden lg:block">
            <WhatsappButton
              numero={AGENCIA.whatsapp}
              mensaje={mensajeGeneral(AGENCIA)}
              label="WhatsApp"
              size="sm"
            />
          </div>

          {/* Menú mobile (Base UI: Trigger es el button; cierre controlado) */}
          <Sheet open={open} onOpenChange={setOpen}>
            {/* Hamburguesa MÁS GRANDE y con caja visible (pedido del cliente:
                "poner las tres líneas más grandes o que se vean mejor en
                mobile"). Antes era un ícono de 20px suelto sobre el fondo crema:
                se perdía. Ahora 26px dentro de una pastilla con borde — se lee
                como un botón y el área táctil pasa de 40 a 44px. */}
            <SheetTrigger
              aria-label="Abrir menú"
              className="inline-flex size-11 items-center justify-center rounded-md border border-foreground/15 bg-white text-foreground shadow-sm transition-colors hover:border-foreground/30 md:hidden"
            >
              <Menu className="size-[26px]" strokeWidth={2.25} />
            </SheetTrigger>
            {/* `bg-background`: la sidebar va en el CREMA de marca, no en el
                blanco del popover (pedido del cliente: "la sidebar que sea
                también amarillita"). */}
            <SheetContent side="left" className="w-80 max-w-[85vw] gap-0 bg-background p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2.5">
                  <Image
                    src="/marca/america-cardozo-flat.png"
                    alt=""
                    width={329}
                    height={204}
                    className="h-9 w-auto shrink-0"
                  />
                  <span className="wordmark text-sm uppercase leading-none tracking-[0.14em]">
                    {AGENCIA.logoTexto}
                  </span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menú de navegación de {AGENCIA.nombre}
                </SheetDescription>
              </SheetHeader>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                {NAV.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <SheetClose
                      key={item.href}
                      // El close es un <Link> (<a>), no un <button>: hay que
                      // declararlo o Base UI loguea un error de semántica.
                      nativeButton={false}
                      render={
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                            active
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      }
                    />
                  );
                })}
              </nav>

              <div className="border-t border-border p-4">
                <WhatsappButton
                  numero={AGENCIA.whatsapp}
                  mensaje={mensajeGeneral(AGENCIA)}
                  fullWidth
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Accesos rápidos FIJOS en el top bar — SOLO mobile (en md+ la nav ya
          los tiene). Scroll horizontal si no entran; sin scrollbar visible. */}
      {/* ACCESOS MÁS GRANDES (pedido del cliente). Antes: texto de 12px con
          padding de 6px → 27px de alto, por debajo del mínimo táctil y difíciles
          de leer de un vistazo. Ahora 14px de texto y 44px de alto, que es el
          mínimo cómodo para el dedo.
          `snap-x` + `snap-start`: al arrastrar la fila, las pastillas encajan en
          el borde en vez de quedar cortadas por la mitad — era una de las cosas
          que el cliente marcó como "se ve corrido" en mobile.
          `scroll-px-4`: el snap respeta el padding lateral y la primera pastilla
          no queda pegada al borde de la pantalla. */}
      {/* GRID de 3 columnas iguales, sin scroll horizontal.
          Antes era una fila con `overflow-x-auto`: los tres accesos pedían
          481px contra 343px de pantalla, así que el tercero quedaba fuera y
          había que deslizar para descubrirlo — un acceso que no se ve no es un
          acceso. Con `grid-cols-3` cada uno recibe exactamente un tercio y los
          tres entran siempre, en cualquier celular.
          Se conserva `h-11` (44px) porque es el mínimo táctil cómodo: lo que se
          achica es el ANCHO y el texto, no el alto. */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-3 md:hidden">
        {ACCESOS_MOBILE.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            // `min-w-0` + `truncate`: si algún label creciera, se corta con
            // puntos suspensivos en vez de desbordar la columna y reventar la
            // grilla (que es como aparecían los cortes laterales).
            className="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-md border border-brand/40 bg-white px-2 text-xs font-semibold text-brand-text transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
          >
            <l.icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{l.corto}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}
