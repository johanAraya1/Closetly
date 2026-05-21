import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { supabase } from "@/services/supabase";
import { trackCriticalEvent } from "@/services/analytics";

export const registerPushToken = async () => {
  if (!Device.isDevice) return null;

  const existing = await Notifications.getPermissionsAsync();
  const finalStatus =
    existing.status === "granted"
      ? existing.status
      : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== "granted") return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return token;

  const { error } = await supabase.from("notification_devices").upsert({
    user_id: user.id,
    expo_push_token: token,
    platform: Device.osName ?? "unknown"
  });

  if (error) {
    await trackCriticalEvent("push_token_failure", { reason: error.message });
  }

  return token;
};
