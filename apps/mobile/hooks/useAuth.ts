import { useState, useEffect, useCallback } from 'react';
import { hasActiveSigner, getStoredSigner } from '../lib/farcaster/signer';
import type { LitecastSession, StoredSigner } from '@litecast/types';
import { canWrite } from '@litecast/types';
import { loadOrMigrateLitecastSession } from '../lib/litecast/session';

export function useAuth() {
  const [session, setSession] = useState<LitecastSession | null>(null);
  const [signer, setSigner] = useState<StoredSigner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const hasSigner = await hasActiveSigner();
      if (!hasSigner) {
        setSession(null);
        setSigner(null);
        return;
      }
      const storedSigner = await getStoredSigner();
      setSigner(storedSigner);
      const s = await loadOrMigrateLitecastSession();
      setSession(s);
    } catch (error) {
      console.error('Auth check error:', error);
      setSession(null);
      setSigner(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = !!session?.identity?.fid;

  return {
    session,
    isAuthenticated,
    signer,
    canWrite: canWrite(session),
    isLoading,
    refetch: checkAuth,
  };
}
