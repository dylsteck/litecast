import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE, FEED_STALE_TIME_MS, type FeedItem } from '../lib/farcaster';
import { FarcasterApiError } from '../lib/farcaster/errors';
import { useHidden } from '../providers/HiddenProvider';
import { useSession } from '../providers/SessionProvider';

export function useRankedFeed(feedKey: 'home' | 'following') {
  const { client, views, isSignedIn, session } = useSession();
  const { isHidden } = useHidden();

  const query = useInfiniteQuery({
    queryKey: ['feedItems', feedKey, session?.user.fid],
    enabled: isSignedIn,
    initialPageParam: undefined as { olderThan?: number; latestMainCastTimestamp?: number; excludeItemIdPrefixes?: string[] } | undefined,
    staleTime: FEED_STALE_TIME_MS,
    retry: (count, error) => {
      if (error instanceof FarcasterApiError && (error.isUnauthorized || error.isRateLimited)) return false;
      return count < 2;
    },
    queryFn: async ({ pageParam }) => {
      const castViewEvents = views.drain();
      try {
        const response = await client.getFeedItems({
          feedKey,
          feedType: 'default',
          updateState: true,
          includeUserSuggestions: feedKey === 'home',
          includeTrendingTopics: feedKey === 'home',
          olderThan: pageParam?.olderThan,
          latestMainCastTimestamp: pageParam?.latestMainCastTimestamp,
          excludeItemIdPrefixes: pageParam?.excludeItemIdPrefixes,
          castViewEvents,
        });
        return response;
      } catch (error) {
        views.restore(castViewEvents);
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const items = lastPage.result.items ?? [];
      if (items.length === 0) return undefined;
      const oldest = items[items.length - 1];
      const prefixes = allPages.flatMap((page) =>
        (page.result.items ?? []).map((item) => item.id.slice(2, 10).toLowerCase()),
      );
      return {
        olderThan: oldest.timestamp,
        latestMainCastTimestamp: lastPage.result.latestMainCastTimestamp,
        excludeItemIdPrefixes: prefixes,
      };
    },
  });

  const items = (query.data?.pages.flatMap((page) => page.result.items ?? []) ?? []).filter(
    (item) => !isHidden(item.cast.hash, item.cast.author.fid),
  ) as FeedItem[];

  return { ...query, items };
}
