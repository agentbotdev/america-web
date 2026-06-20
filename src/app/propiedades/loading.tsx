// Skeleton instantáneo mientras el catálogo de propiedades resuelve
// (feedback de carga = la web se siente más rápida).
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-white/10" />
        <div className="h-4 w-56 animate-pulse rounded bg-white/5" />
      </div>
      <div className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="aspect-[4/3] animate-pulse bg-white/5" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                <div className="h-3 w-full animate-pulse rounded bg-white/5" />
              </div>
              <div className="h-9 w-full animate-pulse rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
