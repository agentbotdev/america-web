/**
 * Dominio OFICIAL de la web (20/10: americacardozo.com.ar ya está conectado en Vercel). Única
 * fuente para canonical, sitemap, robots, Open Graph y los links que se mandan por WhatsApp.
 *
 * Con `www.`: el dominio sin `www` redirige (308) ahí, así que los links salen directo y sin
 * un salto de más. No se lee de `NEXT_PUBLIC_SITE_URL` a propósito: esa variable en Vercel era
 * de cuando la web vivía en un dominio de prueba y, si queda con un valor viejo, vuelve a
 * mandar los links (y los previews de WhatsApp) al lugar equivocado.
 */
export const SITE_URL = "https://www.americacardozo.com.ar";
