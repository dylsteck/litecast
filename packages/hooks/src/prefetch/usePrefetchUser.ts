import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NeynarUserResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Hook to prefetch user profile data.
 * Use this when a user is about to navigate to a profile page,
 * or when rendering a user avatar to prefetch in the background.
 * 
 * Example usage:
 * ```tsx
 * const prefetchUser = usePrefetchUser();
 * 
 * const handleAvatarPress = (fid: number) => {
 *   prefetchUser(fid); // Start fetching immediately
 *   navigation.navigate('Profile', { fid });
 * };
 * ```
 */
export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return useCallback((fidOrUsername: number | string) => {
    if (!fidOrUsername) return;

    const params: Record<string, unknown> = {};
    if (typeof fidOrUsername === 'number') {
      params.fid = fidOrUsername;
    } else {
      params.username = fidOrUsername;
    }

    queryClient.prefetchQuery({
      queryKey: ['user', fidOrUsername],
      queryFn: async () => {
        return apiRequest<NeynarUserResponse>(API_ENDPOINTS.USER, params);
      },
      staleTime: 1000 * 60 * 10, // 10 minutes - user profiles don't change often
    });
  }, [queryClient]);
}

/**
 * Hook that automatically prefetches a user's profile when rendered.
 * Useful for avatar components - prefetch profile data in the background.
 * 
 * Example usage:
 * ```tsx
 * function UserAvatar({ fid, imageUrl }) {
 *   usePrefetchUserOnMount(fid);
 *   return <Image source={{ uri: imageUrl }} />;
 * }
 * ```
 */
export function usePrefetchUserOnMount(fidOrUsername: number | string | undefined) {
  const prefetchUser = usePrefetchUser();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Only prefetch once per mount and only if we have a valid fid/username
    if (fidOrUsername && !hasPrefetched.current) {
      hasPrefetched.current = true;
      prefetchUser(fidOrUsername);
    }
  }, [fidOrUsername, prefetchUser]);
}
