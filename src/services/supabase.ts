import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { env, isConfigured } from "@/constants/env";
import { AppError } from "@/utils/errors";

export const getMissingSupabaseConfigError = () =>
  new AppError(
    "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before building the app.",
    "SUPABASE_CONFIG_MISSING",
    false
  );

const createUnavailableSupabaseClient = () =>
  new Proxy({} as SupabaseClient, {
    get() {
      throw getMissingSupabaseConfigError();
    }
  });

export const supabase = isConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          "x-client-info": "closetly-mobile"
        }
      }
    })
  : createUnavailableSupabaseClient();
