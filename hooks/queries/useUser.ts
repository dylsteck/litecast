import { useQuery } from '@tanstack/react-query';
import { NeynarUserResponse } from '../../lib/neynar/types';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS } from '../../lib/neynar/constants';

async function fetchUser(fidOrUsername: string | number): Promise<NeynarUserResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neynar API key not configured');
  }

  let url: string;
  
  if (typeof fidOrUsername === 'number') {
    const params = new URLSearchParams({ fids: fidOrUsername.toString() });
    url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.USER_BY_FID}?${params.toString()}`;
  } else {
    const params = new URLSearchParams({ username: fidOrUsername });
    url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.USER_BY_USERNAME}?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  const data = await response.json();
  
  // If fetching by FID, extract first user from bulk response
  if (typeof fidOrUsername === 'number') {
    return { user: data.users[0] };
  }
  
  return data;
}

export function useUser(fidOrUsername: string | number) {
  return useQuery({
    queryKey: ['user', fidOrUsername],
    queryFn: () => fetchUser(fidOrUsername),
    enabled: !!fidOrUsername,
    staleTime: 1000 * 60 * 10, // 10 minutes (user data changes less frequently)
  });
}

