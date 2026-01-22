import { useInfiniteQuery } from '@tanstack/react-query';
import type { NeynarFeedResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface UseChannelFeedOptions {
  channelId?: string;
  parentUrl?: string;
}

export function useChannelFeed(options: UseChannelFeedOptions) {
  const { channelId, parentUrl } = options;

  return useInfiniteQuery({
    queryKey: ['channelFeed', channelId, parentUrl],
    queryFn: async ({ pageParam }) => {
      return apiRequest<NeynarFeedResponse>(API_ENDPOINTS.FEED_CHANNEL, {
        channel_id: channelId,
        parent_url: parentUrl,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!(channelId || parentUrl),
  });
}
