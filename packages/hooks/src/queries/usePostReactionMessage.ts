import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export function usePostReactionMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: Record<string, unknown>) =>
      apiPost<unknown>(API_ENDPOINTS.WRITE_REACTION, { message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['forYouFeed'] });
      qc.invalidateQueries({ queryKey: ['trendingFeed'] });
      qc.invalidateQueries({ queryKey: ['thread'] });
    },
  });
}
