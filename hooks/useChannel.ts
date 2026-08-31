import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '../lib/farcaster';
import { useHidden } from '../providers/HiddenProvider';
import { useSession } from '../providers/SessionProvider';

export function useChannel(key?: string) {
  const { client } = useSession();
  return useQuery({
    queryKey: ['channel', key],
    enabled: Boolean(key),
    queryFn: async () => (await client.getChannel(key!)).result.channel,
  });
}

export function useChannelCasts(key?: string) {
  const { client, session } = useSession();
  const { isHidden } = useHidden();

  const query = useQuery({
    queryKey: ['channelCasts', key, Boolean(session?.token?.secret)],
    enabled: Boolean(key),
    queryFn: async () => {
      if (session?.token?.secret) {
        const response = await client.getFeedItems({
          feedKey: key!,
          feedType: 'default',
          updateState: false,
        });
        return (response.result.items ?? []).map((item) => item.cast);
      }
      const response = await client.searchCasts({ q: `/${key}`, limit: DEFAULT_PAGE_SIZE });
      return response.result.casts ?? [];
    },
  });

  const casts = (query.data ?? []).filter((cast) => !isHidden(cast.hash, cast.author.fid));
  return { ...query, casts };
}

export function useAllChannels() {
  const { client } = useSession();
  return useQuery({
    queryKey: ['allChannels'],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => ((await client.getAllChannels()).result.channels ?? []).slice(0, 80),
  });
}
