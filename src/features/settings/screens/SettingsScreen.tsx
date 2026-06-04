import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppTabBar } from "@/components/ui/AppTabBar";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { signOut } from "@/features/auth/services/auth.service";
import { changeLanguage } from "@/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const profile = useAuthStore((state) => state.profile);
  const resetAuth = useAuthStore((state) => state.reset);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const logout = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      resetAuth();
      router.replace("/auth/login");
    }
  });

  const onLanguage = async (next: "es" | "en") => {
    setLanguage(next);
    await changeLanguage(next);
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenShell title={t("settings")} subtitle={profile?.email ?? profile?.username ?? "Closetly"}>
        <View className="gap-3 rounded-card bg-surface p-4">
          <Text className="text-sm font-semibold text-gray-900">{t("language")}</Text>
          <View className="flex-row gap-2">
            <Button title="ES" variant={language === "es" ? "primary" : "secondary"} className="flex-1" onPress={() => onLanguage("es")} />
            <Button title="EN" variant={language === "en" ? "primary" : "secondary"} className="flex-1" onPress={() => onLanguage("en")} />
          </View>
        </View>
        <View className="mt-4 gap-3 rounded-card bg-surface p-4">
          <Text className="text-sm font-semibold text-gray-900">Plan</Text>
          <Text className="text-base text-gray-500">{profile?.subscription_tier ?? "free"}</Text>
        </View>
        <View className="mt-6">
          <Button title={t("signOut")} variant="danger" loading={logout.isPending} onPress={() => logout.mutate()} />
        </View>
      </ScreenShell>
      <AppTabBar />
    </View>
  );
};
