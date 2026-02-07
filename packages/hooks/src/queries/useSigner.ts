import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  SignedKeyRequestResponse,
  SignerStatusResponse,
} from '@litecast/types';
import { apiPost, apiRequest } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Mutation hook for creating a signed key request
 */
export function useCreateSigner() {
  return useMutation({
    mutationFn: async (publicKey: string) => {
      return apiPost<SignedKeyRequestResponse>(
        API_ENDPOINTS.SIGNER,
        { publicKey }
      );
    },
  });
}

/**
 * Query hook for polling signer status
 */
export function useSignerStatus(
  token: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) {
  return useQuery({
    queryKey: ['signer', 'status', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token is required');
      }
      return apiRequest<SignerStatusResponse>(API_ENDPOINTS.SIGNER, {
        token,
      });
    },
    enabled: options?.enabled ?? !!token,
    refetchInterval: options?.refetchInterval ?? 2000,
  });
}
