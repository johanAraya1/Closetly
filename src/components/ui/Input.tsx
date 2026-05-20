import { TextInput, Text, View, TextInputProps } from "react-native";

type InputProps = TextInputProps & {
  label: string;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <View className="space-y-2">
      <Text className="text-sm font-medium text-text">{label}</Text>
      <TextInput
        className={`rounded-3xl border border-secondary bg-surface px-4 py-3 text-text ${className ?? ""}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
}
