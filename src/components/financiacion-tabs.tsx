import Link from "next/link";
import { Landmark, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

// Reunión 18/09: la calculadora vive DENTRO de Financiación — una sola entrada
// en el nav ("Financiamos") y las dos herramientas hermanadas con esta
// sub-navegación cruzada. Cada página conserva su URL y su SEO propio.
const TABS = [
  { href: "/credito-hipotecario", label: "Crédito hipotecario", icon: Landmark },
  { href: "/calculadora-alquiler", label: "Gastos de alquiler", icon: Calculator },
] as const;

export function FinanciacionTabs({ activa }: { activa: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Herramientas de financiación" className="mb-8">
      <div className="inline-flex flex-wrap gap-1.5 rounded-lg border border-border bg-white p-1.5">
        {TABS.map((t) => {
          const esActiva = t.href === activa;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={esActiva ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
                esActiva
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <t.icon className="size-4" aria-hidden />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
