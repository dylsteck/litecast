import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { configureApi, type ApiConfig } from '../api/client';

interface ApiContextValue {
  baseUrl: string;
  isConfigured: boolean;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export interface ApiProviderProps {
  config: ApiConfig;
  children: React.ReactNode;
}

export function ApiProvider({ config, children }: ApiProviderProps) {
  useEffect(() => {
    configureApi(config);
  }, [config]);

  const value = useMemo(
    () => ({
      baseUrl: config.baseUrl,
      isConfigured: !!config.baseUrl,
    }),
    [config.baseUrl]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApiContext(): ApiContextValue {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}
