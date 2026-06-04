import "react-native-gesture-handler";
import "../../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useAuthBootstrap } from "@/features/auth/hooks/useAuthBootstrap";
import { useOtaUpdates } from "@/hooks/useOtaUpdates";
import { initI18n, i18n } from "@/i18n";
import { queryClient } from "@/lib/queryClient";
import { initAnalytics } from "@/services/analytics";
import { initSentry } from "@/services/observability";
import { useAuthStore } from "@/store/useAuthStore";

void SplashScreen.preventAutoHideAsync();

const AuthGate = ({ children }: { children: ReactNode }) => {
  useAuthBootstrap();
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const isReady = useAuthStore((state) => state.isReady);

  useEffect(() => {
    if (!isReady) return;
    const isAuthRoute = pathname.startsWith("/auth");

    if (!session && !isAuthRoute) {
      router.replace("/auth/login");
    }

    if (session && isAuthRoute) {
      router.replace("/closet");
    }
  }, [isReady, pathname, session]);

  useEffect(() => {
    if (isReady) void SplashScreen.hideAsync();
  }, [isReady]);

  return children;
};

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  useOtaUpdates();

  useEffect(() => {
    initSentry();
    initAnalytics();
    void initI18n().finally(() => setI18nReady(true));
  }, []);

  if (!i18nReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <AuthGate>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/register" />
                <Stack.Screen name="closet/index" />
                <Stack.Screen name="outfits/index" />
                <Stack.Screen name="explore/index" />
                <Stack.Screen name="chat/index" />
                <Stack.Screen name="settings" />
              </Stack>
            </AuthGate>
          </QueryClientProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
