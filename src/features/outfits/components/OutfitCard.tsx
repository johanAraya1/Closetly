import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import type { Outfit } from "@/types";

type OutfitCardProps = {
  outfit: Outfit;
};

export const OutfitCard = ({ outfit }: OutfitCardProps) => (
  <View className="mb-3 rounded-card bg-surface p-4">
    <View className="flex-row items-center gap-2">
      {outfit.is_ai_generated ? <Sparkles size={17} color="#8B5CF6" /> : null}
      <Text className="flex-1 text-base font-semibold text-ink">{outfit.name}</Text>
    </View>
    <Text className="mt-2 text-sm text-stone-500" numberOfLines={2}>
      {[outfit.occasion, outfit.season, outfit.style_tags?.join(", ")].filter(Boolean).join(" / ") || "Manual"}
    </Text>
  </View>
);
