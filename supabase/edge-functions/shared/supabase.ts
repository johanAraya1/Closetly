import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

import { HttpError } from "./http.ts";

export const createServiceClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

export const createUserClient = (req: Request) =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? ""
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

export const requireUser = async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token", "UNAUTHORIZED");
  }

  const userClient = createUserClient(req);
  const { data, error } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data.user) {
    throw new HttpError(401, "Invalid token", "UNAUTHORIZED");
  }

  return {
    user: data.user,
    userClient,
    serviceClient: createServiceClient()
  };
};

export const assertRateLimit = async (
  userClient: ReturnType<typeof createUserClient>,
  scope: string,
  limit: number,
  windowSeconds: number
) => {
  const { data, error } = await userClient.rpc("check_rate_limit", {
    p_scope: scope,
    p_limit: limit,
    p_window_seconds: windowSeconds
  });

  if (error) throw error;
  if (!data) throw new HttpError(429, "Rate limit exceeded", "RATE_LIMITED");
};
