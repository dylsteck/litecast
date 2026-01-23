'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@litecast/hooks';
import { useState, useMemo } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient with useState to ensure it's stable across re-renders
  // This pattern works correctly with Next.js App Router SSR
  // 
  // Optimized settings for prefetching, inspired by Base App:
  // https://blog.base.dev/base-app-prefetching-at-scale
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
            gcTime: 1000 * 60 * 30, // 30 minutes - keep unused data in cache
            retry: 1,
            refetchOnWindowFocus: false, // Don't refetch when tab regains focus
            refetchOnMount: false, // Use cached data if fresh - enables prefetch
          },
        },
      })
  );

  // Memoize API config to avoid recreating on every render
  const apiConfig = useMemo(
    () => ({
      baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider config={apiConfig}>{children}</ApiProvider>
    </QueryClientProvider>
  );
}
