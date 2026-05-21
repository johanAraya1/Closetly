import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppTabBar } from "@/components/ui/AppTabBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ScreenShell } from "@/components/ui/ScreenShell";

import { ExploreGarmentTile } from "../components/ExploreGarmentTile";
import { useExploreGarments } from "../hooks/useExploreGarments";
import { favoriteGarment } from "../services/explore.service";

export const ExploreScreen = () => {
  const { t } = useTranslation();
  const explore = useExploreGarments();
  const favorite = useMutation({ mutationFn: favoriteGarment });
  const items = explore.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <View className="flex-1 bg-canvas">
      <ScreenShell title={t("explore")} subtitle="Closets publicos, intercambio, venta y regalo.">
        {explore.isLoading ? <LoadingSkeleton /> : null}
        {!explore.isLoading && items.length === 0 ? (
          <EmptyState title="Nada publico aun" description="El feed usa paginacion, cache y cero realtime para cuidar costos." />
        ) : null}
        <View className="gap-1">
          {items.map((garment) => (
            <ExploreGarmentTile key={garment.id} garment={garment} onSave={() => favorite.mutate(garment.id)} />
          ))}
        </View>
      </ScreenShell>
      <AppTabBar />
    </View>
  );
};
