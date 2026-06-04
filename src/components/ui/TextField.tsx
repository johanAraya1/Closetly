import { Text, TextInput, View, type TextInputProps } from "react-native";
import { cn } from "@/utils/cn";

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const TextField = ({
  label,
  error,
  icon,
  rightIcon,
  className,
  ...props
}: TextFieldProps) => (
  <View className="mb-4">
    {label && (
      <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>
    )}
    <View
      className={cn(
        "flex-row items-center rounded-card border bg-surface px-4 py-3",
        error ? "border-error" : "border-gray-300",
      )}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <TextInput
        className={cn("flex-1 text-base text-gray-900", className)}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {rightIcon && <View className="ml-2">{rightIcon}</View>}
    </View>
    {error && <Text className="mt-1 text-xs text-error">{error}</Text>}
  </View>
);
