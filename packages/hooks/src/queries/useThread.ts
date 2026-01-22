import { useQuery } from '@tanstack/react-query';
import type { NeynarThreadResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export function useThread(hash: string) {
  return useQuery({
    queryKey: ['thread', hash],
    queryFn: async () => {
      return apiRequest<NeynarThreadResponse>(API_ENDPOINTS.THREAD, {
        hash,
      });
    },
    enabled: !!hash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
