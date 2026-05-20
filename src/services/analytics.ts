import { PostHog } from "posthog-react-native";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const posthog = new PostHog({
  apiKey: String(extra.posthogApiKey ?? ""),
  host: "https://app.posthog.com"
});

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}
