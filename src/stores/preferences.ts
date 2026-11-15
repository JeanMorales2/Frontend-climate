"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language, Theme, Unit } from "@/types/weather";

type Preferences = {
  unit: Unit;
  theme: Theme;
  language: Language;
  recent: string[];
  setUnit: (unit: Unit) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  addRecent: (city: string) => void;
  removeRecent: (city: string) => void;
  clearRecent: () => void;
};

export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      unit: "celsius",
      theme: "system",
      language: "es",
      recent: [],
      setUnit: (unit) => set({ unit }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      addRecent: (city) =>
        set((state) => ({
          recent: [
            city.trim(),
            ...state.recent.filter((item) => item.toLowerCase() !== city.trim().toLowerCase()),
          ].slice(0, 6),
        })),
      removeRecent: (city) =>
        set((state) => ({ recent: state.recent.filter((item) => item !== city) })),
      clearRecent: () => set({ recent: [] }),
    }),
    { name: "clima-preferencias" },
  ),
);
