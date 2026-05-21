import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";

import { listMyChats } from "../services/chat.service";

export const useChats = () =>
  useQuery({
    queryKey: queryKeys.chats,
    queryFn: listMyChats
  });
