import { MessageCircle } from "lucide-react-native";
import { Text, View } from "react-native";

import type { Chat } from "@/types";

export const ChatListItem = ({ chat }: { chat: Chat }) => (
  <View className="mb-3 flex-row items-center gap-3 rounded-card bg-surface p-4">
    <View className="h-11 w-11 items-center justify-center rounded-full bg-canvas">
      <MessageCircle size={20} color="#8B5CF6" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-ink">Chat</Text>
      <Text className="text-sm text-stone-500" numberOfLines={1}>
        {chat.last_message_preview ?? "Sin mensajes todavia"}
      </Text>
    </View>
  </View>
);
