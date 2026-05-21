import { View } from "react-native";

export const LoadingSkeleton = () => (
  <View className="gap-3">
    <View className="h-44 rounded-card bg-muted opacity-40" />
    <View className="h-44 rounded-card bg-muted opacity-30" />
    <View className="h-44 rounded-card bg-muted opacity-20" />
  </View>
);
