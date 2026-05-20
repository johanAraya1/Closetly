import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsState = {
  language: "es" | "en";
  darkMode: boolean;
  setLanguage: (value: "es" | "en") => Promise<void>;
  toggleDarkMode: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  language: "es",
  darkMode: false,
  setLanguage: async (value) => {
    await AsyncStorage.setItem("closetly-language", value);
    set({ language: value });
  },
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
}));
