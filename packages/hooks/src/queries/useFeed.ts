import { useInfiniteQuery } from '@tanstack/react-query';
import type { NeynarFeedResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export function useFeed(fid: number) {
  return useInfiniteQuery({
    queryKey: ['feed', fid],
    queryFn: async ({ pageParam }) => {
      return apiRequest<NeynarFeedResponse>(API_ENDPOINTS.FEED, {
        fid,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!fid,
  });
}
