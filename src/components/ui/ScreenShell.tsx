import { ReactNode } from "react";
import { View, Text, StatusBar } from "react-native";

type ScreenShellProps = {
  title: string;
  children: ReactNode;
};

export function ScreenShell({ title, children }: ScreenShellProps) {
  return (
    <View className="flex-1 bg-background pt-6">
      <StatusBar style="dark" />
      <View className="px-4 pb-4">
        <Text className="text-2xl font-bold text-text">{title}</Text>
      </View>
      {children}
    </View>
  );
}
