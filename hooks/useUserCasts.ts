import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE, pageFromCasts } from '../lib/farcaster';
import { useHidden } from '../providers/HiddenProvider';
import { useSession } from '../providers/SessionProvider';

export function useUserCasts(fid?: number) {
  const { client } = useSession();
  const { isHidden } = useHidden();

  const query = useInfiniteQuery({
    queryKey: ['userCasts', fid],
    enabled: typeof fid === 'number',
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      pageFromCasts(await client.getUserCasts({ fid: fid!, cursor: pageParam, limit: DEFAULT_PAGE_SIZE })),
    getNextPageParam: (last) => last.cursor,
  });

  const casts = (query.data?.pages.flatMap((page) => page.items) ?? []).filter(
    (cast) => !isHidden(cast.hash, cast.author.fid),
  );

  return { ...query, casts };
}
