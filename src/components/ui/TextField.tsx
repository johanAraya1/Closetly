import { Text, TextInput, type TextInputProps, View } from "react-native";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export const TextField = ({ label, error, className, ...props }: TextFieldProps) => (
  <View className="gap-2">
    <Text className="text-sm font-semibold text-ink">{label}</Text>
    <TextInput
      placeholderTextColor="#8A817C"
      className={`min-h-12 rounded-card border border-muted bg-surface px-4 text-base text-ink ${className ?? ""}`}
      autoCapitalize="none"
      {...props}
    />
    {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
  </View>
);
