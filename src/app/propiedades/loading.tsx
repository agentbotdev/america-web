// Skeleton instantáneo mientras el catálogo de propiedades resuelve
// (feedback de carga = la web se siente más rápida). Replica la estructura real:
// hero oscuro + barra de filtros + grid de cards.
export default function Loading() {
  return (
    <>
      {/* Hero oscuro (matchea el heading real de la page) */}
      <div className="section-dark border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-11 w-64 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-prose animate-pulse rounded bg-white/5" />
          <div className="mt-2 h-4 w-2/3 max-w-prose animate-pulse rounded bg-white/5" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-5 w-48 animate-pulse rounded bg-white/10" />

        {/* Barra de filtros */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:flex-wrap">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-white/5 sm:min-w-56" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-white/5 sm:w-32" />
          ))}
        </div>

        {/* Grid de cards */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="aspect-[4/3] animate-pulse bg-white/5" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
                <div className="h-9 w-full animate-pulse rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
