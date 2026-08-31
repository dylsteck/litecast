import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { FarcasterApiError } from '../lib/farcaster';
import { useHidden } from '../providers/HiddenProvider';
import { useSession } from '../providers/SessionProvider';

function needsSession(error: unknown) {
  return error instanceof FarcasterApiError && error.isUnauthorized;
}

export function useCastActions() {
  const { client, isSignedIn } = useSession();
  const { hideCast, muteFid } = useHidden();
  const queryClient = useQueryClient();
  const canWrite = isSignedIn;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['feedItems'] });
    void queryClient.invalidateQueries({ queryKey: ['discoverFeed'] });
    void queryClient.invalidateQueries({ queryKey: ['thread'] });
    void queryClient.invalidateQueries({ queryKey: ['userCasts'] });
  };

  const requireWrite = () => {
    if (!canWrite) {
      Alert.alert('Sign in', 'Scan the Farcaster QR or connect your custody wallet to cast.');
      return false;
    }
    return true;
  };

  const compose = useMutation({
    mutationFn: async (input: { text: string; parentHash?: string; channelKey?: string }) => {
      if (!requireWrite()) throw new Error('Not signed in');
      return client.createCast({
        text: input.text,
        parent: input.parentHash ? { hash: input.parentHash } : undefined,
        channelKey: input.channelKey,
      });
    },
    onSuccess: invalidate,
    onError: (error) => {
      Alert.alert('Could not cast', needsSession(error) ? 'Farcaster API session required.' : String(error));
    },
  });

  const like = useMutation({
    mutationFn: async ({ hash, liked }: { hash: string; liked: boolean }) => {
      if (!requireWrite()) throw new Error('Not signed in');
      return liked ? client.unlikeCast(hash) : client.likeCast(hash);
    },
    onSuccess: invalidate,
  });

  const recast = useMutation({
    mutationFn: async ({ hash, recasted }: { hash: string; recasted: boolean }) => {
      if (!requireWrite()) throw new Error('Not signed in');
      return recasted ? client.unrecast(hash) : client.recast(hash);
    },
    onSuccess: invalidate,
  });

  const follow = useMutation({
    mutationFn: async ({ fid, following }: { fid: number; following: boolean }) => {
      if (!requireWrite()) throw new Error('Not signed in');
      return following ? client.unfollow(fid) : client.follow(fid);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    canWrite,
    compose,
    like,
    recast,
    follow,
    hideCast,
    muteFid,
  };
}
