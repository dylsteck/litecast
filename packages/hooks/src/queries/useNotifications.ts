import { useInfiniteQuery } from '@tanstack/react-query';
import type { NeynarNotificationsResponse, NotificationType } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface UseNotificationsOptions {
  fid: number;
  type?: NotificationType[];
}

export function useNotifications(options: UseNotificationsOptions) {
  const { fid, type } = options;

  return useInfiniteQuery({
    queryKey: ['notifications', fid, type],
    queryFn: async ({ pageParam }) => {
      return apiRequest<NeynarNotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS, {
        fid,
        type: type?.join(','),
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next?.cursor || undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!fid,
  });
}
