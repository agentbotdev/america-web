"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
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

const NAV = [
  { href: "/propiedades", label: "Propiedades" },
  { href: "/credito-hipotecario", label: "Crédito" },
  { href: "/calculadora-alquiler", label: "Calculadora" },
  { href: "/vende-tu-propiedad", label: "Vendé tu propiedad" },
  { href: "/nosotros", label: "Nosotros" },
];

// Marca un item como activo cuando estamos en su ruta o en una subruta de ella.
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Logo wordmark: "AMÉRICA CARDOZO" en serif bold BLANCO con una raya ROJA a la
// izquierda (evoca el logo real: serif sobre amarillo con líneas rojas).
// Mientras no tengamos el logo gráfico definitivo, este wordmark ES la marca.
function Logo() {
  return (
    <Link
      href="/"
      aria-label={AGENCIA.nombre}
      className="group flex items-center"
    >
      <span className="wordmark text-[15px] uppercase tracking-[0.16em] transition-opacity group-hover:opacity-90 sm:text-base">
        {AGENCIA.logoTexto}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-[oklch(0.11_0_0)]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
                className={cn(
                  "nav-underline text-sm font-medium transition-colors hover:text-foreground",
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
                <SheetTitle className="wordmark text-base uppercase tracking-[0.16em]">
                  {AGENCIA.logoTexto}
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
    </header>
  );
}
