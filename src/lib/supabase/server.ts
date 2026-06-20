import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente PÚBLICO sin cookies: para lecturas anónimas del catálogo (RLS las permite).
// CLAVE de performance: al NO tocar cookies(), las páginas que lo usan pueden ser
// estáticas / ISR → navegación instantánea (no re-consultan la DB en cada click).
export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    },
  );
}

// Cliente Supabase para Server Components / Route Handlers (Next 16: cookies async).
// Usar SOLO cuando se necesita sesión/auth (escrituras, datos por usuario).
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll desde un Server Component sin response: ignorar (lo maneja el middleware).
          }
        },
      },
    },
  );
}
