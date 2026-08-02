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
const NAV = [
  { href: "/propiedades", label: "Inmuebles" },
  { href: "/emprendimientos", label: "Emprendimientos" },
  { href: "/credito-hipotecario", label: "Financiamos" },
  { href: "/calculadora-alquiler", label: "Calculadora" },
  { href: "/vende-tu-propiedad", label: "Vendé tu propiedad" },
  { href: "/nosotros", label: "Nosotros" },
];

// Accesos rápidos SIEMPRE VISIBLES en mobile (pedido del cliente: los pills
// rojos del hero quedaban abajo de todo — acá viven fijos en el top bar).
// En md+ desaparecen: la nav de escritorio ya tiene estos destinos.
const ACCESOS_MOBILE = [
  { href: "/vende-tu-propiedad", label: "Vendé tu propiedad", icon: Tag },
  { href: "/credito-hipotecario", label: "Financiamos", icon: Landmark },
  { href: "/calculadora-alquiler", label: "Calculadora", icon: Calculator },
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
    // Mismo color que la página, SIN línea de borde: el header se funde con el
    // fondo uniforme (el usuario marcó los "cortes" horizontales de la página).
    <header className="sticky top-0 z-50 bg-background">
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
          <div className="hidden sm:block">
            <WhatsappButton
              numero={AGENCIA.whatsapp}
              mensaje={mensajeGeneral(AGENCIA)}
              label="WhatsApp"
              size="sm"
            />
          </div>

          {/* Menú mobile (Base UI: Trigger es el button; cierre controlado) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Abrir menú"
              className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-secondary md:hidden"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 max-w-[85vw] gap-0 p-0">
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
      <div className="flex gap-2 overflow-x-auto px-4 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
        {ACCESOS_MOBILE.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-brand/35 px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
          >
            <l.icon className="size-3.5" aria-hidden />
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
