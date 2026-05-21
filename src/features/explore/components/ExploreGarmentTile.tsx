import { Image } from "expo-image";
import { Heart } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { ExploreGarment } from "@/types";

type ExploreGarmentTileProps = {
  garment: ExploreGarment;
  onSave: () => void;
};

export const ExploreGarmentTile = ({ garment, onSave }: ExploreGarmentTileProps) => {
  const image = garment.background_removed_url ?? garment.thumbnail_url;

  return (
    <View className="mb-4 overflow-hidden rounded-card bg-surface">
      <View className="aspect-[4/5] bg-muted">
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : null}
      </View>
      <View className="flex-row items-center justify-between p-3">
        <View className="flex-1 pr-2">
          <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
            {garment.category ?? "Look"}
          </Text>
          <Text className="text-xs text-stone-500" numberOfLines={1}>
            {[garment.style, garment.color_primary, garment.visibility].filter(Boolean).join(" / ")}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save garment"
          onPress={onSave}
          className="h-10 w-10 items-center justify-center rounded-full bg-canvas"
        >
          <Heart size={18} color="#8B5CF6" />
        </Pressable>
      </View>
    </View>
  );
};
