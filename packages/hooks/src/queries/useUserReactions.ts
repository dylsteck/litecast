import { useInfiniteQuery } from '@tanstack/react-query';
import type { UserReactionsResponse, ReactionType } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface UseUserReactionsOptions {
  fid: number;
  type: ReactionType;
}

export function useUserReactions(options: UseUserReactionsOptions) {
  const { fid, type } = options;

  return useInfiniteQuery({
    queryKey: ['userReactions', fid, type],
    queryFn: async ({ pageParam }) => {
      return apiRequest<UserReactionsResponse>(API_ENDPOINTS.USER_REACTIONS, {
        fid,
        type,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!fid,
  });
}
