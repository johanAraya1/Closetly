import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { trackCriticalEvent } from "@/services/analytics";
import { supabase } from "@/services/supabase";

export const useChatRealtime = (chatId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return undefined;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: [...queryKeys.chats, chatId] });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          void trackCriticalEvent("realtime_failure", { chatId });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);
};
