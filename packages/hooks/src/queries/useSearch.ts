import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  SearchCastsResponse,
  SearchUsersResponse,
  SearchFramesResponse,
} from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export function useSearchCasts(query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['searchCasts', query],
    queryFn: async ({ pageParam }) => {
      return apiRequest<SearchCastsResponse>(API_ENDPOINTS.SEARCH_CASTS, {
        q: query,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.result.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!query && query.length > 0,
  });
}

export function useSearchUsers(query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['searchUsers', query],
    queryFn: async ({ pageParam }) => {
      return apiRequest<SearchUsersResponse>(API_ENDPOINTS.SEARCH_USERS, {
        q: query,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.result.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!query && query.length > 0,
  });
}

export function useSearchFrames(query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['searchFrames', query],
    queryFn: async ({ pageParam }) => {
      return apiRequest<SearchFramesResponse>(API_ENDPOINTS.SEARCH_FRAMES, {
        q: query,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!query && query.length > 0,
  });
}
