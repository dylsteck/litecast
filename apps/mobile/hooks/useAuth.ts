import { useState, useEffect, useCallback } from 'react';
import { hasActiveSigner, getStoredSigner } from '../lib/farcaster/signer';
import type { StoredSigner } from '@litecast/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [signer, setSigner] = useState<StoredSigner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const hasSigner = await hasActiveSigner();
      if (hasSigner) {
        const storedSigner = await getStoredSigner();
        setSigner(storedSigner);
        setIsAuthenticated(true);
      } else {
        setSigner(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setSigner(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    signer,
    isLoading,
    refetch: checkAuth,
  };
}
