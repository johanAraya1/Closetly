import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <View className="items-center justify-center rounded-card border border-dashed border-muted bg-surface p-6">
    <Text className="text-center text-lg font-semibold text-ink">{title}</Text>
    {description ? <Text className="mt-2 text-center text-sm text-stone-500">{description}</Text> : null}
  </View>
);
