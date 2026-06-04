import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppTabBar } from "@/components/ui/AppTabBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ScreenShell } from "@/components/ui/ScreenShell";

import { ChatListItem } from "../components/ChatListItem";
import { useChats } from "../hooks/useChats";

export const ChatScreen = () => {
  const { t } = useTranslation();
  const chats = useChats();

  return (
    <View className="flex-1 bg-canvas">
      <ScreenShell title={t("chat")} subtitle="Realtime solo para mensajes y notificaciones criticas.">
        {chats.isLoading ? <LoadingSkeleton /> : null}
        {!chats.isLoading && chats.data?.length === 0 ? (
          <EmptyState title="Sin chats" message="Los chats se crean desde prendas publicadas para venta, regalo o intercambio." />
        ) : null}
        {chats.data?.map((chat) => <ChatListItem key={chat.id} chat={chat} />)}
      </ScreenShell>
      <AppTabBar />
    </View>
  );
};
