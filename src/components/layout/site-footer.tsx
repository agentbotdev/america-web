import Link from "next/link";
import { MapPin, Clock, Mail } from "lucide-react";
import { AGENCIA } from "@/data/agencia";

// lucide-react removió los íconos de marca (Instagram/Facebook). Usamos SVG inline.
function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const NAV = [
  { href: "/propiedades", label: "Propiedades" },
  { href: "/credito-hipotecario", label: "Crédito hipotecario" },
  { href: "/calculadora-alquiler", label: "Calculadora de alquiler" },
  { href: "/vende-tu-propiedad", label: "Vendé tu propiedad" },
  { href: "/nosotros", label: "Nosotros" },
];

export function SiteFooter() {
  const a = AGENCIA;
  const tieneRedes = Boolean(a.redes.instagram || a.redes.facebook);
  const tieneContacto = Boolean(a.direccion || a.horario || a.email);

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <span className="text-lg font-bold uppercase tracking-[0.2em] text-foreground">
            {a.logoTexto}
          </span>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {a.tagline}. Te acompañamos a encontrar tu próxima propiedad en{" "}
            {a.zona_operacion} con transparencia y asesoría real.
          </p>
          {tieneRedes && (
            <div className="mt-5 flex gap-3">
              {a.redes.instagram && (
                <a
                  href={a.redes.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:bg-background"
                >
                  <InstagramGlyph className="size-4" />
                </a>
              )}
              {a.redes.facebook && (
                <a
                  href={a.redes.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:bg-background"
                >
                  <FacebookGlyph className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium">Navegá</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {tieneContacto && (
          <div>
            <h3 className="text-sm font-medium">Contacto</h3>
            <ul className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
              {(a.direccion || a.ciudad) && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{a.direccion ? `${a.direccion}, ${a.ciudad}` : a.ciudad}</span>
                </li>
              )}
              {a.horario && (
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0" />
                  <span>{a.horario}</span>
                </li>
              )}
              {a.email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0" />
                  <a href={`mailto:${a.email}`} className="hover:text-foreground">{a.email}</a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Inmobiliaria América Cardozo. Todos los derechos reservados.</p>
          <p>Propiedades en {a.zona_operacion} · Precios sujetos a confirmación.</p>
        </div>
      </div>
    </footer>
  );
}
