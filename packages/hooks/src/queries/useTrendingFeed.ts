import { useInfiniteQuery } from '@tanstack/react-query';
import type { NeynarFeedResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface UseTrendingFeedOptions {
  timeWindow?: '1h' | '6h' | '12h' | '24h' | '7d';
}

export function useTrendingFeed(options: UseTrendingFeedOptions = {}) {
  const { timeWindow = '24h' } = options;

  return useInfiniteQuery({
    queryKey: ['trendingFeed', timeWindow],
    queryFn: async ({ pageParam }) => {
      return apiRequest<NeynarFeedResponse>(API_ENDPOINTS.FEED_TRENDING, {
        time_window: timeWindow,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
