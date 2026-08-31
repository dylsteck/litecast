import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '../lib/farcaster';
import { useSession } from '../providers/SessionProvider';

export function useNotifications(tab = 'all') {
  const { client, isSignedIn, session } = useSession();

  const query = useInfiniteQuery({
    queryKey: ['notifications', tab, session?.user.fid],
    enabled: isSignedIn,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await client.getNotifications({ tab, cursor: pageParam, limit: DEFAULT_PAGE_SIZE });
      return {
        items: response.result.notifications ?? [],
        cursor: response.next?.cursor,
      };
    },
    getNextPageParam: (last) => last.cursor,
  });

  const notifications = query.data?.pages.flatMap((page) => page.items) ?? [];
  return { ...query, notifications };
}
