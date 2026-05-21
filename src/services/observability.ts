import * as Application from "expo-application";
import * as Sentry from "@sentry/react-native";

import { env } from "@/constants/env";
import { createRequestId } from "@/utils/requestId";

let bootRequestId = createRequestId();

export const getBootRequestId = () => bootRequestId;

export const resetBootRequestId = () => {
  bootRequestId = createRequestId();
  return bootRequestId;
};

export const initSentry = () => {
  if (!env.sentryDsn) return;

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    release: `${Application.applicationId ?? "closetly"}@${Application.nativeApplicationVersion ?? "0.1.0"}`,
    tracesSampleRate: env.appEnv === "production" ? 0.15 : 1
  });
};

export const captureError = (error: unknown, tags?: Record<string, string>) => {
  if (tags) {
    for (const [key, value] of Object.entries(tags)) {
      Sentry.setTag(key, value);
    }
  }
  Sentry.captureException(error);
};

export const addBreadcrumb = (message: string, data?: Record<string, unknown>) => {
  Sentry.addBreadcrumb({
    category: "closetly",
    message,
    data
  });
};
