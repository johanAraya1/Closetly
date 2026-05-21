import { supabase } from "@/services/supabase";
import type { Chat, Message } from "@/types";

export const listMyChats = async (): Promise<Chat[]> => {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .is("deleted_at", null)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(40);

  if (error) throw error;
  return (data ?? []) as Chat[];
};

export const listMessages = async (chatId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as Message[];
};

export const sendMessage = async (chatId: string, text: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User session required");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: userData.user.id,
      text
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Message;
};
