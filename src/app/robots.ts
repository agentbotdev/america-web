import type { MetadataRoute } from "next";

import { SITE_URL as SITE } from "@/lib/site";
const BASE = SITE;

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
