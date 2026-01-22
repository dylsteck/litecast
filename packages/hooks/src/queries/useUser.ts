import { useQuery } from '@tanstack/react-query';
import type { NeynarUserResponse } from '@litecast/types';
import { apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export function useUser(fidOrUsername: number | string) {
  return useQuery({
    queryKey: ['user', fidOrUsername],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (typeof fidOrUsername === 'number') {
        params.fid = fidOrUsername;
      } else {
        params.username = fidOrUsername;
      }
      return apiRequest<NeynarUserResponse>(API_ENDPOINTS.USER, params);
    },
    enabled: !!fidOrUsername,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
