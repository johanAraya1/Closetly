import { useInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";

import { listExploreGarments } from "../services/explore.service";

export const useExploreGarments = () =>
  useInfiniteQuery({
    queryKey: queryKeys.exploreGarments,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => listExploreGarments(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });
