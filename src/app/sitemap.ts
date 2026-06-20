import type { MetadataRoute } from "next";
import { getPropiedades } from "@/lib/supabase/queries";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://america-cardozo.vercel.app";

// Sitemap con las propiedades REALES (Supabase) + rutas estáticas de la web.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/propiedades`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/credito-hipotecario`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/calculadora-alquiler`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/vende-tu-propiedad`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const propiedades = await getPropiedades();
  const dinamicas: MetadataRoute.Sitemap = propiedades.map((p) => ({
    url: `${BASE}/propiedad/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...estaticas, ...dinamicas];
}
