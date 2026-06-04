import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { Chat } from "@/types";

export const ChatListItem = ({ chat }: { chat: Chat }) => (
  <View className="mb-3 flex-row items-center gap-3 rounded-card bg-surface p-4">
    <View className="h-11 w-11 items-center justify-center rounded-full bg-canvas">
      <Ionicons name="chatbubble-ellipses-outline" size={20} color="#62D9C7" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">Chat</Text>
      <Text className="text-sm text-gray-500" numberOfLines={1}>
        {chat.last_message_preview ?? "Sin mensajes todavia"}
      </Text>
    </View>
  </View>
);
