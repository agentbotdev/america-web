import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://america-cardozo.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /favoritos es estado local del usuario y /api devuelve JSON: no indexar.
      disallow: ["/api/", "/favoritos"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
