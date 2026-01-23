import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NeynarThreadResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Hook to prefetch thread/cast detail data.
 * Use this when a user is about to navigate to a cast detail page.
 * 
 * Example usage:
 * ```tsx
 * const prefetchThread = usePrefetchThread();
 * 
 * const handlePress = (hash: string) => {
 *   prefetchThread(hash); // Start fetching immediately
 *   navigation.navigate('Cast', { hash }); // Navigate
 * };
 * ```
 */
export function usePrefetchThread() {
  const queryClient = useQueryClient();

  return useCallback((hash: string) => {
    if (!hash) return;

    queryClient.prefetchQuery({
      queryKey: ['thread', hash],
      queryFn: async () => {
        return apiRequest<NeynarThreadResponse>(API_ENDPOINTS.THREAD, { hash });
      },
      staleTime: 1000 * 60 * 5, // 5 minutes - don't re-prefetch if we already have fresh data
    });
  }, [queryClient]);
}

/**
 * Prefetch multiple threads at once (useful for visible items in a feed).
 * Has built-in throttling to prevent overfetching.
 */
export function usePrefetchThreads() {
  const queryClient = useQueryClient();

  return useCallback((hashes: string[], maxConcurrent = 3) => {
    // Only prefetch the first N items to avoid overfetching
    const hashesToPrefetch = hashes.slice(0, maxConcurrent);

    hashesToPrefetch.forEach((hash) => {
      if (!hash) return;

      queryClient.prefetchQuery({
        queryKey: ['thread', hash],
        queryFn: async () => {
          return apiRequest<NeynarThreadResponse>(API_ENDPOINTS.THREAD, { hash });
        },
        staleTime: 1000 * 60 * 5,
      });
    });
  }, [queryClient]);
}
