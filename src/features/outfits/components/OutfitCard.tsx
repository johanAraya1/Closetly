import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { Outfit } from "@/types";

type OutfitCardProps = {
  outfit: Outfit;
};

export const OutfitCard = ({ outfit }: OutfitCardProps) => (
  <View className="mb-3 rounded-card bg-surface p-4">
    <View className="flex-row items-center gap-2">
      {outfit.is_ai_generated ? <Ionicons name="sparkles" size={17} color="#62D9C7" /> : null}
      <Text className="flex-1 text-base font-semibold text-gray-900">{outfit.name}</Text>
    </View>
    <Text className="mt-2 text-sm text-gray-500" numberOfLines={2}>
      {[outfit.occasion, outfit.season, outfit.style_tags?.join(", ")].filter(Boolean).join(" / ") || "Manual"}
    </Text>
  </View>
);
