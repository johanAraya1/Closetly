import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "@/i18n/resources";

export const initI18n = async () => {
  const saved = await AsyncStorage.getItem("closetly-language");
  const deviceLanguage = Localization.getLocales()[0]?.languageCode;

  await i18n.use(initReactI18next).init({
    resources,
    lng: saved ?? (deviceLanguage === "en" ? "en" : "es"),
    fallbackLng: "es",
    interpolation: {
      escapeValue: false
    }
  });
};

export const changeLanguage = async (language: "es" | "en") => {
  await AsyncStorage.setItem("closetly-language", language);
  await i18n.changeLanguage(language);
};

export { i18n };
