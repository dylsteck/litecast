import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE, DISCOVER_FIDS, uniqueByHash, type Cast } from '../lib/farcaster';
import { useHidden } from '../providers/HiddenProvider';
import { useSession } from '../providers/SessionProvider';

export function useDiscoverFeed() {
  const { client } = useSession();
  const { isHidden } = useHidden();

  const query = useQuery({
    queryKey: ['discoverFeed', ...DISCOVER_FIDS],
    staleTime: 1000 * 60 * 3,
    queryFn: async () => {
      const pages = await Promise.all(
        DISCOVER_FIDS.map((fid) =>
          client.getUserCasts({ fid, limit: DEFAULT_PAGE_SIZE }).catch(() => ({ result: { casts: [] as Cast[] } })),
        ),
      );
      return uniqueByHash(pages.flatMap((page) => page.result.casts ?? [])).sort((a, b) => b.timestamp - a.timestamp);
    },
  });

  const casts = (query.data ?? []).filter((cast) => !isHidden(cast.hash, cast.author.fid));
  return { ...query, casts };
}
