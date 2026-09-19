"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

// Fachada liviana para videos de YouTube (reunión 18/09: los emprendimientos
// llevan video — renders/recorridos animados). El iframe del player recién se
// monta cuando el usuario toca play: N videos en la grilla cuestan CERO en el
// load (un iframe de YouTube pesa ~1 MB y bloquea el hilo principal).

/** Extrae el id (11 chars) de cualquier formato de URL de YouTube. */
function youtubeId(url: string): string | null {
  const m = /(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/.exec(url);
  return m ? m[1] : null;
}

export function VideoYoutube({
  url,
  titulo,
  poster,
  sizes,
}: {
  url: string;
  titulo: string;
  /** Imagen propia como portada; sin ella se usa el thumbnail de YouTube. */
  poster?: string;
  sizes?: string;
}) {
  const [reproducir, setReproducir] = useState(false);
  const id = youtubeId(url);
  if (!id) return null;

  if (reproducir) {
    return (
      <iframe
        // nocookie: mismo player, sin cookies de tracking hasta que se reproduce.
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={`Video: ${titulo}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setReproducir(true)}
      aria-label={`Reproducir video de ${titulo}`}
      className="group/video absolute inset-0 cursor-pointer"
    >
      <Image
        src={poster ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
        className="object-cover"
      />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover/video:bg-black/35" />
      <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg transition-transform group-hover/video:scale-110">
        <Play className="size-6 fill-current" aria-hidden />
      </span>
    </button>
  );
}
