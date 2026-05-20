import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenShell } from "@components/ui/ScreenShell";
import { Button } from "@components/ui/Button";

export default function OutfitsScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell title={t("outfitsTitle")}>
      <ScrollView className="flex-1 px-4 space-y-4">
        <Text className="text-base text-text">{t("outfitsSubtitle")}</Text>
        <Button title={t("createOutfit")} />
        <View className="rounded-3xl bg-surface p-4 shadow-sm">
          <Text className="text-sm text-secondary">{t("outfitsEmpty")}</Text>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
