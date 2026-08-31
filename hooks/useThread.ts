import { useQuery } from '@tanstack/react-query';
import { useHidden } from '../providers/HiddenProvider';
import { useSession } from '../providers/SessionProvider';

export function useThread(hash?: string) {
  const { client } = useSession();
  const { isHidden } = useHidden();

  const query = useQuery({
    queryKey: ['thread', hash],
    enabled: Boolean(hash),
    queryFn: async () => (await client.getThread(hash!)).result.casts ?? [],
  });

  const casts = (query.data ?? []).filter((cast) => !isHidden(cast.hash, cast.author.fid));
  const root = casts[0];
  const replies = casts.slice(1);
  return { ...query, casts, root, replies };
}
