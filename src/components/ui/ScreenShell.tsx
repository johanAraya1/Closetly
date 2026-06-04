import { KeyboardAvoidingView, Platform, ScrollView, Text, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/utils/cn";

type ScreenShellProps = ViewProps & {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
};

export const ScreenShell = ({ title, subtitle, scroll = true, children, className }: ScreenShellProps) => {
  const Content = scroll ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <Content
          className={cn("flex-1 px-5", className)}
          {...(scroll ? { contentContainerStyle: { paddingBottom: 28 } } : {})}
        >
          {title ? (
            <View className="mb-5 mt-2">
              <Text className="text-3xl font-bold text-gray-900">{title}</Text>
              {subtitle ? <Text className="mt-2 text-base text-gray-500">{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
        </Content>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
