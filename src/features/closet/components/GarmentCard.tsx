import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { Garment } from "@/types";

type GarmentCardProps = {
  garment: Garment;
};

export const GarmentCard = ({ garment }: GarmentCardProps) => {
  const image = garment.background_removed_url ?? garment.thumbnail_url;

  return (
    <View className="mb-4 w-[48%] overflow-hidden rounded-card bg-surface">
      <View className="aspect-[3/4] bg-muted">
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
          />
        ) : null}
      </View>
      <View className="gap-1 p-3">
        <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
          {garment.name ?? garment.category ?? "Prenda"}
        </Text>
        <Text className="text-xs text-stone-500" numberOfLines={1}>
          {[garment.color_primary, garment.season, garment.style].filter(Boolean).join(" / ") || garment.ai_status}
        </Text>
      </View>
    </View>
  );
};
