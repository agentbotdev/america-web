"use client";

import { useEffect } from "react";
import { useWaContexto } from "@/lib/wa-contexto";

/** No dibuja nada: mientras la ficha está abierta, el botón flotante consulta por ESTA propiedad. */
export function WhatsappPropiedad({ mensaje }: { mensaje: string }) {
  const setMensaje = useWaContexto((s) => s.setMensaje);
  useEffect(() => {
    setMensaje(mensaje);
    return () => setMensaje(null);
  }, [mensaje, setMensaje]);
  return null;
}
