import { useQuery } from '@tanstack/react-query';
import { NeynarThreadResponse } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS } from '../../lib/neynar/constants';

async function fetchThread(hash: string): Promise<NeynarThreadResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    identifier: hash,
    type: 'hash',
    reply_depth: '10',
    include_chronological_parent_casts: 'true',
  });
  
  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.CAST_CONVERSATION}?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch thread');
  }
  
  return response.json();
}

export function useThread(hash: string) {
  return useQuery({
    queryKey: ['thread', hash],
    queryFn: () => fetchThread(hash),
    enabled: !!hash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

