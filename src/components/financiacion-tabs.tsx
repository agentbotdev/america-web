import Link from "next/link";
import { Landmark, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

// Reunión 18/09: la calculadora vive DENTRO de Financiación — una sola entrada
// en el nav ("Financiamos") y las dos herramientas hermanadas con esta
// sub-navegación cruzada. Cada página conserva su URL y su SEO propio.
// Reunión 06/10: el acceso "Crédito" del celular lleva acá, y adentro están las
// dos herramientas con estos nombres (pedido de Nacho).
const TABS = [
  { href: "/credito-hipotecario", label: "Crédito / Financiación", icon: Landmark },
  { href: "/calculadora-alquiler", label: "Calculadora de alquiler", icon: Calculator },
] as const;

export function FinanciacionTabs({ activa }: { activa: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Herramientas de financiación" className="mb-8">
      {/* Celular: dos mitades iguales, como el selector Dólares/Pesos de abajo.
          Con los nombres largos las dos pastillas no entran en una fila (piden
          417px contra 331px a 375px de ancho) y apiladas quedaban de distinto
          ancho. Cada mitad parte su nombre en dos renglones. */}
      <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-white p-1.5 sm:inline-flex sm:flex-wrap">
        {TABS.map((t) => {
          const esActiva = t.href === activa;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={esActiva ? "page" : undefined}
              className={cn(
                "inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-left text-sm font-semibold leading-tight transition-colors sm:h-10 sm:min-h-0 sm:px-4 sm:py-0",
                esActiva
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <t.icon className="size-4 shrink-0" aria-hidden />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
