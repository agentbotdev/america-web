"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { AGENCIA } from "@/data/agencia";
import { FavoritesSheet } from "@/components/favoritos/favorites-sheet";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { mensajeGeneral } from "@/lib/whatsapp";

const NAV = [
  { href: "/propiedades", label: "Propiedades" },
  { href: "/credito-hipotecario", label: "Crédito" },
  { href: "/calculadora-alquiler", label: "Calculadora" },
  { href: "/vende-tu-propiedad", label: "Vendé tu propiedad" },
  { href: "/nosotros", label: "Nosotros" },
];

// Logo tipográfico: el activo /press-logo.png es de la web de autos y no sirve.
// Usamos el wordmark de la agencia hasta tener el logo definitivo.
function Logo() {
  return (
    <Link
      href="/"
      aria-label={AGENCIA.nombre}
      className="flex items-center gap-2"
    >
      <span className="text-base font-bold uppercase tracking-[0.2em] text-foreground sm:text-lg">
        {AGENCIA.logoTexto}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
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
              className="inline-flex size-10 items-center justify-center rounded-full hover:bg-secondary md:hidden"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <span className="text-base font-bold uppercase tracking-[0.2em] text-foreground">
                    {AGENCIA.logoTexto}
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-4">
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
