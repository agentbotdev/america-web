// Slug SEO para propiedades. La tabla no tiene columna `slug` → lo generamos en
// la web a partir del título y SIEMPRE terminamos en el `tokko_id` (PK estable).
// Al resolver la ruta /propiedad/[slug] extraemos el id del final.

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** "PH | 3 AMB | G. RODRÍGUEZ" + "7836578" → "ph-3-amb-g-rodriguez-7836578" */
export function propiedadSlug(titulo: string, id: string): string {
  const base = slugify(titulo || "propiedad");
  return base ? `${base}-${id}` : id;
}

/** Extrae el tokko_id del final del slug. */
export function idFromSlug(slug: string): string {
  return slug.split("-").pop() ?? slug;
}
