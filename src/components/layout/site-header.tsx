"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ClipboardCheck, Building2, Landmark } from "lucide-react";
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
// Reunión 06/10: son los SERVICIOS de la inmobiliaria — Tasación, Emprendimientos
// (va a ser su fuerte) y Crédito. La calculadora de alquiler ya no tiene acceso
// propio: vive dentro de Crédito, en la solapa hermana (FinanciacionTabs).
const ACCESOS_MOBILE = [
  { href: "/vende-tu-propiedad", label: "Tasación", corto: "Tasación", icon: ClipboardCheck },
  { href: "/emprendimientos", label: "Emprendimientos", corto: "Emprendimientos", icon: Building2 },
  { href: "/credito-hipotecario", label: "Crédito", corto: "Crédito", icon: Landmark },
];

// Marca un item como activo cuando estamos en su ruta o en una subruta de ella.
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ISOTIPO "AC" (pedido de Nacho 08/10: "usamos ese en casi todos lados"). Reemplaza al
// logo largo AMERICA CARDOZO VENDE, que en el celular competía con los accesos.
// Es negro: sobre la foto del hero no se lee, así que ahí va sobre una placa blanca. La
// caja mide lo mismo con y sin placa (la placa achica el logo por dentro): así el resto
// del renglón no salta cuando el header deja de ser transparente.
function Logo({ sobreFoto = false }: { sobreFoto?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={AGENCIA.nombre}
      className={cn(
        "group flex h-7 w-[51px] shrink-0 items-center justify-center rounded-md transition-colors md:h-10 md:w-[73px]",
        sobreFoto && "bg-white/95 p-[3px] shadow-[0_2px_10px_rgb(0_0_0/0.25)]",
      )}
    >
      <Image
        src="/marca/isotipo-ac.png"
        alt=""
        width={720}
        height={397}
        priority
        className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // HOME: el header va ENCIMA del hero, transparente, para que la foto y el video lleguen
  // hasta el borde de arriba (reunión 06/10, pedido de Nacho 08/10: "sacar la barra
  // blanca"). Cuando el hero termina vuelve a ser el header sólido de siempre.
  const esHome = pathname === "/";
  const [sobreHero, setSobreHero] = useState(esHome);

  useEffect(() => {
    // Fuera de la home no hay hero: `transparente` ya da false por `esHome`.
    if (!esHome) return;
    let cuadro = 0;
    const revisar = () => {
      cuadro = 0;
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const alto = document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
      setSobreHero(!!hero && hero.getBoundingClientRect().bottom > alto);
    };
    const alScrollear = () => {
      if (!cuadro) cuadro = requestAnimationFrame(revisar);
    };
    alScrollear();
    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    return () => {
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
      cancelAnimationFrame(cuadro);
    };
  }, [esHome]);

  const transparente = esHome && sobreHero;

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
    // `data-site-header`: el hero de la home mide este alto para dejarle lugar al título.
    // En la home es `fixed` (fuera del flujo, así el hero arranca en el borde de arriba);
    // en el resto, `sticky` como siempre.
    <header
      data-site-header
      className={cn(
        "z-50 border-b transition-colors duration-300",
        esHome ? "fixed inset-x-0 top-0" : "sticky top-0",
        transparente
          ? "border-transparent bg-transparent text-white"
          : "border-foreground/[0.07] bg-background",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-1.5 px-3 sm:px-6 md:h-16 md:gap-4 lg:px-8">
        <Logo sobreFoto={transparente} />

        {/* ACCESOS DEL CELULAR en el MISMO renglón del logo (Nacho, 08/10: antes eran un
            segundo renglón y se comían el alto de la pantalla). Cards más bajas y con menos
            padding, pero la letra NO se achica. Medido: los tres textos suman 201px; con el
            isotipo a 28px de alto y la hamburguesa de 36px entran desde 360px de pantalla.
            `flex-auto` reparte el sobrante, así en un celular más ancho crecen parejas. Los
            íconos recién entran desde 440px. En md+ la nav ya tiene estos destinos. */}
        <nav aria-label="Accesos rápidos" className="flex min-w-0 flex-1 gap-1 md:hidden">
          {ACCESOS_MOBILE.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              className="inline-flex h-8 min-w-0 flex-auto items-center justify-center gap-1 rounded-md border border-brand/40 bg-white px-1 text-xs font-semibold text-brand-text shadow-sm transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground min-[390px]:px-1.5"
            >
              <l.icon className="hidden size-3.5 shrink-0 min-[440px]:block" aria-hidden />
              <span className="truncate">{l.corto}</span>
            </Link>
          ))}
        </nav>

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
                  "nav-underline text-xs font-semibold uppercase tracking-wider transition-colors",
                  transparente
                    ? active ? "text-white" : "text-white/85 hover:text-white"
                    : active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* El corazón no entra en el renglón del celular (ahí van los accesos): en el
              celular los favoritos se abren desde el menú. */}
          <div className="hidden md:block">
            <FavoritesSheet />
          </div>
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
              className="inline-flex size-9 items-center justify-center rounded-md border border-foreground/15 bg-white text-foreground shadow-sm transition-colors hover:border-foreground/30 md:hidden"
            >
              <Menu className="size-6" strokeWidth={2.25} />
            </SheetTrigger>
            {/* `bg-background`: la sidebar va en el CREMA de marca, no en el
                blanco del popover (pedido del cliente: "la sidebar que sea
                también amarillita"). */}
            <SheetContent side="left" className="w-80 max-w-[85vw] gap-0 bg-background p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2.5">
                  <Image
                    src="/marca/isotipo-ac.png"
                    alt=""
                    width={720}
                    height={397}
                    className="h-8 w-auto shrink-0"
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
                <FavoritesSheet enMenu />
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

    </header>
  );
}
