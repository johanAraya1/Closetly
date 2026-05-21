import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLanguage = "es" | "en";
export type AppTheme = "system" | "light" | "dark";

type SettingsState = {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "es",
      theme: "system",
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: "closetly-settings",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
