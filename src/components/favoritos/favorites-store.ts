"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Favoritos del cliente SIN login (persistidos en localStorage por sesión).
// Agnóstico al dominio: guarda `ids: string[]` (los tokko_id de propiedades).
// Cuando haya backend, se sincroniza por session_id. Al consultar, se mandan
// TODOS a WhatsApp con contexto.

interface FavoritesState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "america-favoritos" },
  ),
);

/** Evita hydration mismatch: el estado persistido recién está tras montar. */
import { useMounted } from "@/lib/use-client-hooks";
export function useHydratedFavorites() {
  const ids = useFavorites((s) => s.ids);
  const hydrated = useMounted();
  return { ids: hydrated ? ids : [], hydrated };
}
