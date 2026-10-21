"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Compartir la ficha: en el celular abre el menú de compartir del sistema (WhatsApp,
// mensajes, mail…); en la compu, o si el usuario lo cancela sin elegir nada, copia el link.
export function CompartirBoton({
  url,
  titulo,
  texto,
  className,
}: {
  url: string;
  titulo: string;
  texto?: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin permiso de portapapeles (algunos navegadores embebidos): se muestra para copiar a mano.
      window.prompt("Copiá el link de la propiedad:", url);
    }
  };

  const compartir = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titulo, text: texto ?? titulo, url });
        return;
      } catch (e) {
        // El usuario cerró el menú: no se copia nada por atrás.
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    await copiar();
  };

  return (
    <button
      type="button"
      onClick={compartir}
      aria-label="Compartir esta propiedad"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-white/70 px-4 text-sm font-semibold text-foreground transition hover:border-brand/50 hover:text-brand-text active:scale-[0.98]",
        className,
      )}
    >
      {copiado ? <Check className="size-4 text-brand-text" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
      <span aria-live="polite">{copiado ? "¡Link copiado!" : "Compartir"}</span>
    </button>
  );
}
