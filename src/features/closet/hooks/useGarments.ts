import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";

import { listMyGarments } from "../services/closet.service";

export const useGarments = () =>
  useQuery({
    queryKey: queryKeys.garments,
    queryFn: listMyGarments
  });
