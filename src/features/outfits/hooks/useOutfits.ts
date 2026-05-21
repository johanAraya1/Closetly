import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";

import { listMyOutfits } from "../services/outfits.service";

export const useOutfits = () =>
  useQuery({
    queryKey: queryKeys.outfits,
    queryFn: listMyOutfits
  });
