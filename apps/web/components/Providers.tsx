'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@litecast/hooks';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { useMemo, useState } from 'react';
import { LitecastSessionProvider } from './LitecastSessionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      })
  );

  const apiConfig = useMemo(
    () => ({
      baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
    }),
    []
  );

  const authConfig = useMemo(
    () => ({
      relay:
        process.env.NEXT_PUBLIC_FARCASTER_RELAY_URL?.trim() || 'https://relay.farcaster.xyz',
      domain: process.env.NEXT_PUBLIC_APP_DOMAIN?.trim() || 'localhost:3000',
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider config={apiConfig}>
        <AuthKitProvider config={authConfig}>
          <LitecastSessionProvider>{children}</LitecastSessionProvider>
        </AuthKitProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
