import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import type { ExpoConfig } from "expo/config";

// Load .env from project root. Dotenv's default resolves from CWD,
// but Gradle may run from android/, so we point explicitly.
dotenvConfig({ path: resolve(__dirname, ".env") });

const getEnv = (key: string) => {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
};

const EAS_PROJECT_ID = getEnv("EAS_PROJECT_ID") ?? "2e92ed2e-9d74-4a40-8af7-a064109310ca";
const EAS_UPDATE_URL = getEnv("EXPO_PUBLIC_EAS_UPDATE_URL") ?? `https://u.expo.dev/${EAS_PROJECT_ID}`;
const APP_ENV = getEnv("EXPO_PUBLIC_APP_ENV") ?? "development";
const EAS_UPDATE_CHANNEL = getEnv("EAS_UPDATE_CHANNEL") ?? (APP_ENV === "production" ? "production" : "preview");

const expoConfig: ExpoConfig = {
  name: "Closetly",
  slug: "closetly",
  scheme: "closetly",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  jsEngine: "hermes",
  owner: getEnv("EXPO_OWNER") ?? "juan_topo",
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: EAS_UPDATE_URL,
    requestHeaders: {
      "expo-channel-name": EAS_UPDATE_CHANNEL
    },
    checkAutomatically: "NEVER"
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.closetly.app",
    infoPlist: {
      NSCameraUsageDescription: "Closetly uses the camera to add garments to your closet.",
      NSPhotoLibraryUsageDescription: "Closetly uses your photos to upload garment images."
    }
  },
  android: {
    package: "com.closetly.app",
    adaptiveIcon: {
      backgroundColor: "#62D9C7"
    },
    permissions: ["CAMERA", "READ_MEDIA_IMAGES", "POST_NOTIFICATIONS"]
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-localization",
    "expo-notifications",
    [
      "@sentry/react-native/expo",
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID
    },
    supabaseUrl: getEnv("EXPO_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
    posthogHost: getEnv("EXPO_PUBLIC_POSTHOG_HOST"),
    posthogKey: getEnv("EXPO_PUBLIC_POSTHOG_KEY"),
    sentryDsn: getEnv("EXPO_PUBLIC_SENTRY_DSN"),
    appEnv: APP_ENV
  }
};

export default expoConfig;
