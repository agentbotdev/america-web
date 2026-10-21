import { Video } from "lucide-react";
import { VideoYoutube } from "@/components/video-youtube";
import type { VideoPropiedad } from "@/types";

// Videos de la ficha (YouTube). Hasta ahora la web solo decía "Video disponible" y no los
// mostraba: la vista pública no traía la columna. El player recién se carga al tocar play.
export function FichaVideos({ videos, titulo }: { videos: VideoPropiedad[]; titulo: string }) {
  if (videos.length === 0) return null;
  return (
    <section id="videos" aria-labelledby="titulo-videos" className="mt-8 scroll-mt-24">
      <h2 id="titulo-videos" className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Video className="size-5 text-brand-text" aria-hidden /> {videos.length > 1 ? "Videos" : "Video"}
      </h2>
      <div className="grid gap-4">
        {videos.map((v, i) => (
          <div key={`${v.url}-${i}`} className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
            <VideoYoutube url={v.url} titulo={v.titulo || titulo} sizes="(max-width: 1024px) 100vw, 60vw" />
          </div>
        ))}
      </div>
    </section>
  );
}
