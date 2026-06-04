import { Text, View } from "react-native";
import { Button } from "./Button";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <View className="items-center justify-center px-8 py-10">
    {icon && <View className="mb-4">{icon}</View>}
    <Text className="mt-4 text-center text-xl font-semibold text-gray-900">
      {title}
    </Text>
    <Text className="mt-2 text-center text-base leading-6 text-gray-500">
      {message}
    </Text>
    {actionLabel && onAction && (
      <View className="mt-6">
        <Button title={actionLabel} onPress={onAction} />
      </View>
    )}
  </View>
);
