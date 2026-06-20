"use client";

import { useState } from "react";
import { Home, Tag, MapPin, User, Phone, MessageSquare, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { AGENCIA } from "@/data/agencia";
import type { TipoPropiedad, TipoOperacion } from "@/types";

const TIPOS: TipoPropiedad[] = [
  "Casa",
  "Departamento",
  "PH",
  "Terreno",
  "Quinta",
  "Local",
  "Oficina",
  "Galpón",
  "Cochera",
  "Campo",
];

const OPERACIONES: { value: TipoOperacion; label: string }[] = [
  { value: "venta", label: "Vender" },
  { value: "alquiler", label: "Alquilar" },
];

const BENEFICIOS = [
  {
    icon: Sparkles,
    title: "Tasación sin cargo",
    desc: "Te decimos cuánto vale tu propiedad, sin compromiso.",
  },
  {
    icon: ShieldCheck,
    title: "Asesoría real",
    desc: "Acompañamiento legal y comercial de principio a fin.",
  },
  {
    icon: Clock,
    title: "Respuesta rápida",
    desc: "Te contactamos por WhatsApp para coordinar todo.",
  },
];

function mensajeVende(data: {
  tipo: TipoPropiedad;
  operacion: TipoOperacion;
  ubicacion: string;
  nombre: string;
  telefono: string;
  comentario: string;
}): string {
  const accion = data.operacion === "venta" ? "vender" : "alquilar";
  const lineas = [
    `¡Hola ${AGENCIA.nombre}! 👋 Quiero *${accion}* mi propiedad con ustedes:`,
    "",
    `🏠 *Tipo*: ${data.tipo}`,
    `🏷️ *Operación*: ${data.operacion === "venta" ? "Venta" : "Alquiler"}`,
    data.ubicacion.trim() && `📍 *Ubicación*: ${data.ubicacion.trim()}`,
    "",
    `👤 *Nombre*: ${data.nombre.trim()}`,
    `📞 *Teléfono*: ${data.telefono.trim()}`,
    data.comentario.trim() && `\n📝 ${data.comentario.trim()}`,
    "",
    "¿Coordinamos una tasación?",
  ];
  return lineas.filter(Boolean).join("\n");
}

export default function VendeTuPropiedadPage() {
  const [tipo, setTipo] = useState<TipoPropiedad>("Casa");
  const [operacion, setOperacion] = useState<TipoOperacion>("venta");
  const [ubicacion, setUbicacion] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      setError("Completá tu nombre y teléfono para que podamos contactarte.");
      return;
    }
    setError(null);
    const mensaje = mensajeVende({
      tipo,
      operacion,
      ubicacion,
      nombre,
      telefono,
      comentario,
    });
    window.open(waLink(AGENCIA.whatsapp, mensaje), "_blank", "noopener,noreferrer");
  }

  const inputBase =
    "h-11 w-full rounded-xl border border-input bg-transparent px-3.5 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 placeholder:text-muted-foreground";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="flex items-center gap-2 text-sm font-medium text-brand">
          <Home className="size-4" /> Vendé o alquilá con nosotros
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Publicá tu propiedad
        </h1>
        <p className="mt-3 text-balance text-muted-foreground">
          Contanos qué tenés y cómo querés operar. Te contactamos por WhatsApp
          con una tasación sin cargo y todo el asesoramiento en {AGENCIA.zona_operacion}.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {BENEFICIOS.map((b) => (
          <div key={b.title} className="card-premium rounded-2xl p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <b.icon className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold">{b.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="panel-glass mt-8 rounded-3xl p-6 sm:p-8"
        noValidate
      >
        {/* Operación */}
        <div className="mb-6">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Tag className="size-4 text-brand" /> ¿Qué querés hacer?
          </span>
          <div className="flex gap-2">
            {OPERACIONES.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => setOperacion(op.value)}
                className={
                  "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition " +
                  (operacion === op.value
                    ? "border-brand/60 bg-brand/10 text-foreground glow-brand"
                    : "border-border bg-transparent text-muted-foreground hover:text-foreground")
                }
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Tipo de propiedad */}
          <div>
            <label htmlFor="tipo" className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Home className="size-4 text-brand" /> Tipo de propiedad
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoPropiedad)}
              className={inputBase + " appearance-none pr-10"}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t} className="bg-popover text-popover-foreground">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="ubicacion" className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-brand" /> Ubicación / barrio
            </label>
            <input
              id="ubicacion"
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej. Moreno, Paso del Rey..."
              className={inputBase}
            />
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="mb-2 flex items-center gap-2 text-sm font-medium">
              <User className="size-4 text-brand" /> Tu nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre y apellido"
              className={inputBase}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Phone className="size-4 text-brand" /> Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              inputMode="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Tu WhatsApp / teléfono"
              className={inputBase}
            />
          </div>
        </div>

        {/* Comentario */}
        <div className="mt-6">
          <label htmlFor="comentario" className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="size-4 text-brand" /> Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Contanos más sobre tu propiedad: ambientes, m², estado, expectativa de precio..."
            className="w-full resize-none rounded-xl border border-input bg-transparent px-3.5 py-3 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 placeholder:text-muted-foreground"
          />
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-7 text-base font-medium text-white transition-all hover:brightness-95 active:scale-[0.98]"
        >
          <MessageSquare className="size-5" />
          Enviar por WhatsApp
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Se abre WhatsApp con tus datos cargados. No guardamos nada hasta que vos
          nos escribas.
        </p>
      </form>
    </div>
  );
}
