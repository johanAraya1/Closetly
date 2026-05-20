import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenShell } from "@components/ui/ScreenShell";
import { Button } from "@components/ui/Button";

export default function ClosetScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell title={t("closetTitle")}>
      <ScrollView className="flex-1 px-4 space-y-4">
        <Text className="text-base text-text">{t("closetSubtitle")}</Text>
        <Button title={t("addGarment")} />
        <View className="rounded-3xl bg-surface p-4 shadow-sm">
          <Text className="text-sm text-secondary">{t("closetEmpty")}</Text>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
