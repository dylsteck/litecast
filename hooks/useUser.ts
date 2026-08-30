import { useQuery } from '@tanstack/react-query';
import { useSession } from '../providers/SessionProvider';

export function useUserByFid(fid?: number) {
  const { client } = useSession();
  return useQuery({
    queryKey: ['user', 'fid', fid],
    enabled: typeof fid === 'number',
    queryFn: async () => (await client.getUserByFid(fid!)).result.user,
  });
}

export function useUserByUsername(username?: string) {
  const { client } = useSession();
  return useQuery({
    queryKey: ['user', 'username', username],
    enabled: Boolean(username),
    queryFn: async () => (await client.getUserByUsername(username!)).result.user,
  });
}
