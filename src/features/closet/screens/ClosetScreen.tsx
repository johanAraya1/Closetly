import { Plus } from "lucide-react-native";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppTabBar } from "@/components/ui/AppTabBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useAuthStore } from "@/store/useAuthStore";
import { getErrorMessage } from "@/utils/errors";

import { GarmentCard } from "../components/GarmentCard";
import { useGarments } from "../hooks/useGarments";
import { useUploadGarment } from "../hooks/useUploadGarment";

export const ClosetScreen = () => {
  const { t } = useTranslation();
  const profile = useAuthStore((state) => state.profile);
  const garments = useGarments();
  const upload = useUploadGarment();

  return (
    <View className="flex-1 bg-canvas">
      <ScreenShell
        title={t("closet")}
        subtitle={profile?.username ? `@${profile.username}` : "Closet privado por defecto"}
      >
        <Button
          title={upload.isPending ? "Subiendo..." : t("uploadGarment")}
          loading={upload.isPending}
          onPress={() => upload.mutate()}
        />
        {upload.error ? <Text className="mt-3 text-sm text-red-600">{getErrorMessage(upload.error)}</Text> : null}

        <View className="mt-6">
          {garments.isLoading ? <LoadingSkeleton /> : null}
          {!garments.isLoading && garments.data?.length === 0 ? (
            <EmptyState title={t("emptyCloset")} description="WebP, thumbnails y analisis IA corren en pipeline de bajo costo." />
          ) : null}
          <View className="flex-row flex-wrap justify-between">
            {garments.data?.map((garment) => <GarmentCard key={garment.id} garment={garment} />)}
          </View>
        </View>

        <View className="mt-2 flex-row items-center gap-2 rounded-card bg-surface p-3">
          <Plus size={18} color="#8B5CF6" />
          <Text className="flex-1 text-sm text-stone-600">
            Las prendas nuevas quedan privadas hasta que cambies su visibilidad.
          </Text>
        </View>
      </ScreenShell>
      <AppTabBar />
    </View>
  );
};
