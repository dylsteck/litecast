import { useQuery } from '@tanstack/react-query';
import { useSession } from '../providers/SessionProvider';

export function useInbox() {
  const { client, isSignedIn, session } = useSession();
  return useQuery({
    queryKey: ['inbox', session?.user.fid],
    enabled: isSignedIn && Boolean(session?.token?.secret),
    queryFn: async () => (await client.getInbox()).result.conversations ?? [],
  });
}
