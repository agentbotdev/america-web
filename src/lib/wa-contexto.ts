import { create } from "zustand";

// Mensaje de WhatsApp "de contexto" para el botón flotante. Por defecto es nulo (el botón
// manda el mensaje general); la ficha de una propiedad lo setea con el mensaje de ESA
// propiedad, así quien toca el botón de abajo consulta directo por lo que está mirando
// (la inmo, 20/10: "el botón de WhatsApp de abajo manda general, no la propiedad").
interface WaContexto {
  mensaje: string | null;
  setMensaje: (m: string | null) => void;
}

export const useWaContexto = create<WaContexto>((set) => ({
  mensaje: null,
  setMensaje: (mensaje) => set({ mensaje }),
}));
