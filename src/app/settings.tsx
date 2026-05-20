import { View, Text, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenShell } from "@components/ui/ScreenShell";
import { useSettingsStore } from "@store/useSettingsStore";
import { Button } from "@components/ui/Button";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, darkMode, toggleDarkMode } = useSettingsStore();

  return (
    <ScreenShell title={t("settingsTitle")}>
      <View className="space-y-6 px-4">
        <View className="rounded-3xl bg-surface p-4 shadow-sm">
          <Text className="text-sm font-semibold text-text mb-2">{t("appPreferences")}</Text>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-text">{t("darkMode")}</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-text">{t("language")}</Text>
            <Button title={language.toUpperCase()} variant="ghost" onPress={() => setLanguage(language === "es" ? "en" : "es")} />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}
