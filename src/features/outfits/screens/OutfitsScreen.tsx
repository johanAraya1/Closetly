import { useMutation, useQueryClient } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { AppTabBar } from "@/components/ui/AppTabBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/useAuthStore";
import { getErrorMessage } from "@/utils/errors";

import { OutfitCard } from "../components/OutfitCard";
import { useOutfits } from "../hooks/useOutfits";
import { generateAiOutfit } from "../services/outfits.service";

export const OutfitsScreen = () => {
  const { t } = useTranslation();
  const profile = useAuthStore((state) => state.profile);
  const queryClient = useQueryClient();
  const outfits = useOutfits();
  const generate = useMutation({
    mutationFn: () => generateAiOutfit("casual"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.outfits })
  });
  const isPremium = profile?.subscription_tier === "premium";

  return (
    <View className="flex-1 bg-canvas">
      <ScreenShell title={t("outfits")} subtitle="Manual gratis, IA automatica para premium.">
        <Button
          title={isPremium ? t("generateOutfit") : `${t("premium")} / ${t("generateOutfit")}`}
          loading={generate.isPending}
          onPress={() => generate.mutate()}
        />
        {!isPremium ? <Text className="mt-2 text-sm text-gray-500">El backend valida premium; el cliente solo muestra la pista visual.</Text> : null}
        {generate.error ? <Text className="mt-2 text-sm text-red-600">{getErrorMessage(generate.error)}</Text> : null}
        <View className="mt-6">
          {outfits.isLoading ? <LoadingSkeleton /> : null}
          {!outfits.isLoading && outfits.data?.length === 0 ? (
            <EmptyState title="Sin outfits aun" message="Crea combinaciones manuales desde tus prendas o genera una premium." />
          ) : null}
          {outfits.data?.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)}
        </View>
      </ScreenShell>
      <AppTabBar />
    </View>
  );
};
