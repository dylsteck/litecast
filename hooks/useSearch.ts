import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '../lib/farcaster';
import { useSession } from '../providers/SessionProvider';

export function useSearch(query: string) {
  const { client } = useSession();
  const q = query.trim();

  const casts = useQuery({
    queryKey: ['search', 'casts', q],
    enabled: q.length > 0,
    queryFn: async () => (await client.searchCasts({ q, limit: DEFAULT_PAGE_SIZE })).result.casts ?? [],
  });

  const users = useQuery({
    queryKey: ['search', 'users', q],
    enabled: q.length > 1,
    queryFn: async () => (await client.searchUsers({ q, limit: 12 })).result.users ?? [],
  });

  const channels = useQuery({
    queryKey: ['search', 'channels', q],
    enabled: q.length > 1,
    queryFn: async () => (await client.searchChannels({ q, limit: 12 })).result.channels ?? [],
  });

  return { casts, users, channels };
}
