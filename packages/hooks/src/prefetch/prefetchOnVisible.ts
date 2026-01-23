import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NeynarThreadResponse } from '@litecast/types';
import type { ViewToken } from 'react-native';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface CastItem {
  hash: string;
  [key: string]: unknown;
}

interface ViewableItemsChangeInfo<T> {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

/**
 * Configuration for feed prefetching
 */
interface PrefetchConfig {
  /** Maximum number of items to prefetch at once */
  maxItems?: number;
  /** Debounce time in ms to prevent rapid-fire prefetches while scrolling */
  debounceMs?: number;
  /** Minimum stale time for prefetched data */
  staleTime?: number;
}

const DEFAULT_CONFIG: Required<PrefetchConfig> = {
  maxItems: 3,
  debounceMs: 150,
  staleTime: 1000 * 60 * 5, // 5 minutes
};

/**
 * Hook that returns a callback for onViewableItemsChanged to prefetch visible cast details.
 * This implements the "prefetch visible items" strategy from Base App.
 * 
 * Example usage:
 * ```tsx
 * const onViewableItemsChanged = usePrefetchVisibleCasts();
 * 
 * return (
 *   <FlatList
 *     data={casts}
 *     onViewableItemsChanged={onViewableItemsChanged}
 *     viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
 *   />
 * );
 * ```
 */
export function usePrefetchVisibleCasts(config: PrefetchConfig = {}) {
  const queryClient = useQueryClient();
  const { maxItems, debounceMs, staleTime } = { ...DEFAULT_CONFIG, ...config };
  
  // Track which hashes we've already prefetched to avoid duplicate requests
  const prefetchedHashes = useRef(new Set<string>());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doPrefetch = useCallback((hashes: string[]) => {
    hashes.forEach((hash) => {
      // Skip if we've already prefetched this hash
      if (prefetchedHashes.current.has(hash)) return;
      
      prefetchedHashes.current.add(hash);

      queryClient.prefetchQuery({
        queryKey: ['thread', hash],
        queryFn: async () => {
          return apiRequest<NeynarThreadResponse>(API_ENDPOINTS.THREAD, { hash });
        },
        staleTime,
      });
    });
  }, [queryClient, staleTime]);

  return useCallback((info: ViewableItemsChangeInfo<CastItem>) => {
    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce to avoid rapid-fire prefetches while scrolling
    debounceTimer.current = setTimeout(() => {
      const visibleHashes = info.viewableItems
        .slice(0, maxItems)
        .map((item) => (item.item as CastItem)?.hash)
        .filter(Boolean) as string[];

      if (visibleHashes.length > 0) {
        doPrefetch(visibleHashes);
      }
    }, debounceMs);
  }, [doPrefetch, maxItems, debounceMs]);
}

/**
 * Creates a viewability config for optimal prefetching.
 * Use this with usePrefetchVisibleCasts.
 */
export const PREFETCH_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 100,
} as const;
