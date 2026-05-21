import axios from "axios";

import { env } from "@/constants/env";
import { supabase } from "@/services/supabase";
import { addBreadcrumb, captureError } from "@/services/observability";
import { createRequestId } from "@/utils/requestId";

export const api = axios.create({
  baseURL: `${env.supabaseUrl}/functions/v1`,
  timeout: 45000
});

api.interceptors.request.use(async (config) => {
  const requestId = createRequestId();
  const session = (await supabase.auth.getSession()).data.session;

  config.headers.set("x-request-id", requestId);
  config.headers.set("apikey", env.supabaseAnonKey);
  config.headers.set("x-client-info", "closetly-mobile");

  if (session?.access_token) {
    config.headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  addBreadcrumb("api.request", {
    requestId,
    url: config.url,
    method: config.method
  });

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    captureError(error, {
      layer: "edge-function",
      status: String(error.response?.status ?? "unknown")
    });
    return Promise.reject(error);
  }
);
