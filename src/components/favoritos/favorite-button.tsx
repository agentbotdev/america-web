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
        variant === "floating" &&
          "size-9 border border-white/15 bg-black/35 text-white shadow-md backdrop-blur-md hover:bg-black/55",
        variant === "inline" && "size-10 border border-border hover:bg-secondary",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          active ? "fill-red-500 text-red-500" : "text-foreground/70",
        )}
      />
    </button>
  );
}
