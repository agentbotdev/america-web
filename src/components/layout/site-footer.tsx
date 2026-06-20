import Link from "next/link";
import { MapPin, Clock, Mail } from "lucide-react";
import { AGENCIA } from "@/data/agencia";
import { WhatsappButton } from "@/components/whatsapp/whatsapp-button";
import { mensajeGeneral } from "@/lib/whatsapp";

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
  // Datos de contacto reales (NO inventar). El WhatsApp siempre está disponible.
  const tieneContacto = Boolean(a.direccion || a.horario || a.email);

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
        {/* Marca + tagline + redes */}
        <div className="md:col-span-5">
          <span className="wordmark inline-block text-lg uppercase tracking-[0.16em]">
            {a.logoTexto}
          </span>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {a.tagline}. Te acompañamos a encontrar tu próxima propiedad en{" "}
            {a.zona_operacion} con transparencia y asesoría real.
          </p>

          <div className="mt-5">
            <WhatsappButton
              numero={a.whatsapp}
              mensaje={mensajeGeneral(a)}
              label="Escribinos por WhatsApp"
              size="sm"
            />
          </div>

          {tieneRedes && (
            <div className="mt-5 flex gap-3">
              {a.redes.instagram && (
                <a
                  href={a.redes.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-background"
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
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-background"
                >
                  <FacebookGlyph className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Navegación */}
        <div className="md:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Navegá
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto + cobertura */}
        <div className="md:col-span-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Contacto
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>
                {a.direccion ? `${a.direccion}, ${a.ciudad}` : a.zona_operacion}
              </span>
            </li>
            {a.horario && (
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0" />
                <span>{a.horario}</span>
              </li>
            )}
            {a.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <a href={`mailto:${a.email}`} className="transition-colors hover:text-foreground">
                  {a.email}
                </a>
              </li>
            )}
          </ul>
          {/* tieneContacto se reserva para datos confirmados a futuro. */}
          {!tieneContacto && (
            <p className="mt-3 text-xs text-muted-foreground/80">
              Coordinamos visitas y consultas por WhatsApp.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {a.nombre}. Todos los derechos reservados.</p>
          <p>Propiedades en {a.zona_operacion} · Precios sujetos a confirmación.</p>
        </div>
      </div>
    </footer>
  );
}
