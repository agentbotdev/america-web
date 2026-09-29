// Detección de fotos PRE-OPTIMIZADAS de la migración Tokko → Supabase Storage.
//
// Esas fotos ya son WebP redimensionadas (…_w800.webp) y el bucket las sirve
// con `cache-control: max-age=31536000, immutable` desde el CDN de Supabase
// (~0,15s). Pasarlas por /_next/image era pagar un re-encode para achicar algo
// que YA está chico: cada variante (url × ancho × formato) arrancaba en MISS
// (~0,8s, y en AVIF hasta 2-3s de encode) — la causa medida de que "las fotos
// tardan 3 segundos". A estas se las sirve DIRECTO (`unoptimized`).
//
// Todo lo demás (logo, hero, thumbs de YouTube, QR) sigue por el optimizador.
export function esFotoPreOptimizada(url?: string): boolean {
  return !!url && url.includes(".supabase.co/storage/") && /_w\d+\.webp($|\?)/.test(url);
}
