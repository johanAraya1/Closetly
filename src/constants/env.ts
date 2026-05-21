import Constants from "expo-constants";

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  posthogKey?: string;
  posthogHost?: string;
  sentryDsn?: string;
  appEnv?: "development" | "preview" | "production";
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const env = {
  appEnv: extra.appEnv ?? "development",
  supabaseUrl: extra.supabaseUrl ?? "",
  supabaseAnonKey: extra.supabaseAnonKey ?? "",
  posthogKey: extra.posthogKey ?? "",
  posthogHost: extra.posthogHost ?? "https://us.i.posthog.com",
  sentryDsn: extra.sentryDsn ?? ""
};

export const isConfigured = env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
