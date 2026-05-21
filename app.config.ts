import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Closetly",
  slug: "closetly",
  scheme: "closetly",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  jsEngine: "hermes",
  owner: process.env.EXPO_OWNER,
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: process.env.EXPO_PUBLIC_EAS_UPDATE_URL
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
      backgroundColor: "#F8F8F8"
    },
    permissions: ["CAMERA", "READ_MEDIA_IMAGES", "POST_NOTIFICATIONS"]
  },
  plugins: [
    "expo-router",
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
      projectId: process.env.EAS_PROJECT_ID
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? "development"
  }
};

export default config;
