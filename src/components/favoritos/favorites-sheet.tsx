"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, FileDown, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useFavorites, useHydratedFavorites } from "./favorites-store";
import { AGENCIA } from "@/data/agencia";
import { mensajeFavoritos } from "@/lib/whatsapp";
import { WhatsappButton } from "../whatsapp/whatsapp-button";
import { PropertyImage } from "../propiedades/property-image";
import { formatPrecio, tituloPropiedad } from "@/lib/format";
import type { Propiedad } from "@/types";

function precioFav(p: Propiedad) {
  if (!p.precio_visible || p.precio == null) return "Consultar";
  const base = formatPrecio(p.precio, p.moneda ?? "USD");
  return p.tipo_operacion === "alquiler" ? `${base}/mes` : base;
}

export function FavoritesSheet() {
  const { ids } = useHydratedFavorites();
  const remove = useFavorites((s) => s.remove);

  // Lee el catálogo REAL (endpoint) para resolver los favoritos con datos correctos.
  const [todos, setTodos] = useState<Propiedad[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let activo = true;
    fetch("/api/propiedades")
      .then((r) => {
        if (!r.ok) throw new Error("fetch favoritos");
        return r.json();
      })
      .then((d: Propiedad[]) => activo && setTodos(Array.isArray(d) ? d : []))
      .catch(() => {
        if (activo) {
          setTodos([]);
          setError(true);
        }
      });
    return () => {
      activo = false;
    };
  }, []);

  const favs = (todos ?? []).filter((p) => ids.includes(p.id));
  const cargando = todos === null;
  const count = ids.length; // contador siempre correcto, aunque el fetch no haya vuelto

  return (
    <Sheet>
      {/* Base UI: el Trigger YA es un <button>, no se anida otro */}
      <SheetTrigger
        aria-label="Ver favoritos"
        className="relative inline-flex size-10 items-center justify-center rounded-full hover:bg-secondary"
      >
        <Heart className="size-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-medium text-brand-foreground">
            {count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="size-5 text-brand" />
            Mis favoritos {count > 0 && `(${count})`}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {count === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-brand/10">
                <Heart className="size-8 text-brand/70" />
              </span>
              <p className="text-sm text-muted-foreground">
                Todavía no guardaste ninguna propiedad.
                <br />
                Tocá el <Heart className="inline size-3.5 -translate-y-px fill-red-500 text-red-500" /> en las que te gusten.
              </p>
              <Link
                href="/propiedades"
                className="glow-brand inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
              >
                Explorar propiedades
              </Link>
            </div>
          ) : cargando ? (
            <div className="flex h-full items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-brand" />
            </div>
          ) : error && favs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <Heart className="size-9 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No pudimos cargar tus favoritos ahora.
                <br />
                Probá de nuevo en un momento.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {favs.map((p) => {
                const portada = p.fotos.find((f) => f.es_portada) ?? p.fotos[0];
                return (
                  <li
                    key={p.id}
                    className="flex gap-3 rounded-xl border border-border p-2"
                  >
                    <Link
                      href={`/propiedad/${p.slug}`}
                      className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      <PropertyImage
                        foto={portada}
                        titulo={p.titulo}
                        tipo={p.tipo_propiedad}
                        sizes="96px"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <Link
                        href={`/propiedad/${p.slug}`}
                        className="truncate text-sm font-medium hover:text-brand"
                      >
                        {tituloPropiedad(p)}
                      </Link>
                      <span className="font-mono text-sm text-brand">
                        {precioFav(p)}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Quitar"
                      onClick={() => remove(p.id)}
                      className="self-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {count > 0 && (
          <SheetFooter className="border-t">
            <WhatsappButton
              numero={AGENCIA.whatsapp}
              mensaje={mensajeFavoritos(AGENCIA, favs)}
              label={`Consultar ${count} ${count === 1 ? "propiedad" : "propiedades"} por WhatsApp`}
              size="lg"
              fullWidth
            />
            <Link
              href="/favoritos"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium transition hover:bg-secondary"
            >
              <FileDown className="size-4" /> Ver selección y exportar PDF
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              Te llevamos al WhatsApp con todos tus favoritos cargados.
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
