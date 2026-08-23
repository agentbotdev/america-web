"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

// Descripción de la propiedad en card, colapsada por defecto.
//
// POR QUÉ: los textos que llegan de Tokko no tienen largo acotado — algunos son
// dos renglones y otros veinte. Los largos empujaban la ficha técnica y el mapa
// tan abajo que en el celular parecía que la página terminaba ahí. Ahora se
// muestra un bloque de altura fija con un "Ver más" que lo expande.
//
// DECISIÓN: el texto completo SIEMPRE está en el HTML, sólo se recorta
// visualmente con `line-clamp`. No se corta el string en JS. Dos motivos:
// Google indexa la descripción completa (es contenido valioso para el SEO de
// una propiedad), y quien use lector de pantalla accede a todo sin depender de
// activar un botón.

const LINEAS_VISIBLES = 6;

export function DescripcionCard({ texto }: { texto: string }) {
  const [abierta, setAbierta] = useState(false);

  // Umbral por caracteres: por debajo de esto el texto entra entero en las
  // líneas visibles y el botón "Ver más" no tendría nada que expandir.
  const esLarga = texto.trim().length > 420;

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <FileText className="size-4 text-brand" aria-hidden />
        Descripción
      </h2>

      <div className="card-premium mt-3 rounded-2xl p-5">
        <p
          className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground"
          style={
            !abierta && esLarga
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: LINEAS_VISIBLES,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {texto}
        </p>

        {esLarga && (
          <button
            type="button"
            onClick={() => setAbierta((v) => !v)}
            aria-expanded={abierta}
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full border border-brand/40 px-4 text-sm font-semibold text-brand-text transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
          >
            {abierta ? "Ver menos" : "Ver más"}
            <ChevronDown
              className={`size-4 transition-transform ${abierta ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        )}
      </div>
    </section>
  );
}
