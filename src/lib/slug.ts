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
  // Las propiedades cargadas a mano en el CRM (post-Tokko) tienen tokko_id
  // "manual-<uuid>" — CON guiones. El split de abajo se quedaba solo con el último
  // pedazo del uuid y la ficha daba 404 para TODAS las manuales (23 al 18/09).
  // El patrón exacto al final del slug evita falsos positivos con títulos que
  // contengan la palabra "manual".
  const manual = slug.match(/manual-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (manual) return manual[0];
  return slug.split("-").pop() ?? slug;
}
