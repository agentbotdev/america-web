import type { MetadataRoute } from "next";
import { getPropiedades } from "@/lib/supabase/queries";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://america-cardozo.vercel.app";

// Sitemap con las propiedades REALES (Supabase) + rutas estáticas de la web.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();

  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/propiedades`, lastModified: ahora, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/credito-hipotecario`, lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/calculadora-alquiler`, lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/vende-tu-propiedad`, lastModified: ahora, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/nosotros`, lastModified: ahora, changeFrequency: "monthly", priority: 0.5 },
  ];

  const propiedades = await getPropiedades();
  const dinamicas: MetadataRoute.Sitemap = propiedades.map((p) => ({
    url: `${BASE}/propiedad/${p.slug}`,
    lastModified: ahora,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...estaticas, ...dinamicas];
}
