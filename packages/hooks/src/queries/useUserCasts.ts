import { useInfiniteQuery } from '@tanstack/react-query';
import type { NeynarFeedResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface UseUserCastsOptions {
  fid: number;
  includeReplies?: boolean;
}

export function useUserCasts(options: UseUserCastsOptions) {
  const { fid, includeReplies = true } = options;

  return useInfiniteQuery({
    queryKey: ['userCasts', fid, includeReplies],
    queryFn: async ({ pageParam }) => {
      return apiRequest<NeynarFeedResponse>(API_ENDPOINTS.USER_CASTS, {
        fid,
        include_replies: includeReplies,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!fid,
  });
}
