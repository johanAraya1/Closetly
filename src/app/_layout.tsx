import { Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nextProvider } from "react-i18next";
import { useInitializeI18n } from "@services/i18n";
import { ThemeProvider } from "nativewind";

const queryClient = new QueryClient();

export default function Layout() {
  const i18n = useInitializeI18n();

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
              </Stack>
              <StatusBar style="auto" />
              <Slot />
            </QueryClientProvider>
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
