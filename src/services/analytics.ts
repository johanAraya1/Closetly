import { PostHog } from "posthog-react-native";

import { env, isConfigured } from "@/constants/env";
import { supabase } from "@/services/supabase";

let client: PostHog | null = null;

type AnalyticsJson =
  | string
  | number
  | boolean
  | null
  | AnalyticsJson[]
  | { [key: string]: AnalyticsJson };

type AnalyticsProperties = Record<string, AnalyticsJson>;

const toAnalyticsProperties = (properties?: Record<string, unknown>): AnalyticsProperties | undefined => {
  if (!properties) return undefined;

  const normalized: AnalyticsProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
      normalized[key] = value as AnalyticsJson;
      continue;
    }

    try {
      normalized[key] = JSON.parse(JSON.stringify(value)) as AnalyticsJson;
    } catch {
      normalized[key] = String(value);
    }
  }

  return normalized;
};

export const initAnalytics = () => {
  if (!env.posthogKey || client) return client;
  client = new PostHog(env.posthogKey, {
    host: env.posthogHost,
    captureNativeAppLifecycleEvents: true,
    flushAt: 10,
    flushInterval: 30000
  });
  return client;
};

export const identifyUser = async (userId: string, properties?: Record<string, unknown>) => {
  client?.identify(userId, toAnalyticsProperties(properties));
};

export const track = async (event: string, properties?: Record<string, unknown>) => {
  client?.capture(event, toAnalyticsProperties(properties));
};

export const trackCriticalEvent = async (
  event: string,
  properties: Record<string, unknown> = {}
) => {
  await track(event, properties);
  if (!isConfigured) return;

  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase.from("analytics_events").insert({
    user_id: data.user.id,
    event_name: event,
    properties,
    source: "mobile"
  });
};
