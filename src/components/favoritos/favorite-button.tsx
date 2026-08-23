"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "./favorites-store";
import { useMounted } from "@/lib/use-client-hooks";
import { cn } from "@/lib/utils";

// Botón corazón para guardar/quitar una propiedad de favoritos.
// preventDefault para funcionar dentro de cards que son <Link>.

interface FavoriteButtonProps {
  id: string;
  className?: string;
  variant?: "floating" | "inline";
}

export function FavoriteButton({
  id,
  className,
  variant = "floating",
}: FavoriteButtonProps) {
  const toggle = useFavorites((s) => s.toggle);
  const ids = useFavorites((s) => s.ids);
  const mounted = useMounted();
  const active = mounted && ids.includes(id);

  return (
    <button
      type="button"
      aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all active:scale-90",
        // Sin `backdrop-blur`: son 6+ botones simultáneos sobre las cards y cada
        // uno es una capa de composición extra que se recalcula al scrollear.
        // Subiendo la opacidad del fondo se lee igual de bien, gratis.
        //
        // PASTILLA CLARA, no negra. Era `bg-black/55` y el cliente la marcó como
        // "muy oscura": manchaba la foto y desentonaba con el resto del sitio,
        // que es claro. Además había un bug de contraste real — el fondo era
        // negro/55 pero el corazón inactivo es `text-foreground/70` (negro
        // suave), o sea negro sobre negro: prácticamente no se veía.
        // Blanco/85 da contraste sobre cualquier foto y deja ver el corazón.
        // size-9 → size-10: acerca el área táctil al mínimo cómodo en mobile.
        variant === "floating" &&
          "size-10 border border-white/80 bg-white/85 shadow-[0_2px_10px_-2px_rgba(60,50,25,0.5)] hover:bg-white",
        variant === "inline" && "size-10 border border-border hover:bg-secondary",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          active ? "fill-brand text-brand" : "text-foreground/70",
        )}
      />
    </button>
  );
}
