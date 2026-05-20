import { useRouter } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@components/ui/Button";
import { ScreenShell } from "@components/ui/ScreenShell";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScreenShell title={t("welcomeTitle")}>      
      <ScrollView className="flex-1 px-4">
        <Text className="text-xl font-semibold text-text mb-3">{t("homeSubtitle")}</Text>
        <View className="space-y-3">
          <Button title={t("goCloset")} onPress={() => router.push("/closet")} />
          <Button title={t("goOutfits")} onPress={() => router.push("/outfits")} />
          <Button title={t("goExplore")} variant="secondary" onPress={() => router.push("/explore")} />
          <Button title={t("goChat")} variant="secondary" onPress={() => router.push("/chat")} />
          <Button title={t("goSettings")} variant="ghost" onPress={() => router.push("/settings")} />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
