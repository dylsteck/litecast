import { useQuery } from '@tanstack/react-query';
import { NEYNAR_API_BASE_URL, NEYNAR_ENDPOINTS } from '../../lib/neynar/constants';
import { SearchCastsResponse, SearchUsersResponse, SearchFramesResponse } from '../../lib/neynar/types';

async function searchCasts(query: string): Promise<SearchCastsResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    q: query,
    limit: '10',
  });

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.SEARCH_CASTS}?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to search casts');
  }
  
  return response.json();
}

async function searchUsers(query: string): Promise<SearchUsersResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    q: query,
    limit: '10',
  });

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.SEARCH_USERS}?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to search users');
  }
  
  return response.json();
}

async function searchFrames(query: string): Promise<SearchFramesResponse> {
  const apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neynar API key not configured');
  }

  const params = new URLSearchParams({
    q: query,
    limit: '10',
  });

  const url = `${NEYNAR_API_BASE_URL}${NEYNAR_ENDPOINTS.SEARCH_FRAMES}?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to search frames');
  }
  
  return response.json();
}

export function useSearch(query: string) {
  const castsQuery = useQuery({
    queryKey: ['search', 'casts', query],
    queryFn: () => searchCasts(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const usersQuery = useQuery({
    queryKey: ['search', 'users', query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const framesQuery = useQuery({
    queryKey: ['search', 'frames', query],
    queryFn: () => searchFrames(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    casts: castsQuery.data?.result?.casts ?? [],
    users: usersQuery.data?.result?.users ?? [],
    frames: framesQuery.data?.frames ?? [],
    isLoading: castsQuery.isLoading || usersQuery.isLoading || framesQuery.isLoading,
    error: castsQuery.error || usersQuery.error || framesQuery.error,
  };
}

