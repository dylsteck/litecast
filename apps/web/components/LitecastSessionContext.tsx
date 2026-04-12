'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FarcasterIdentity, LitecastSession, StoredSigner } from '@litecast/types';
import { LITECAST_SESSION_KEY, canWrite as canWriteSession } from '@litecast/types';
import type { StatusAPIResponse } from '@farcaster/auth-client';

type LitecastSessionContextValue = {
  session: LitecastSession | null;
  canWrite: boolean;
  setSession: (s: LitecastSession | null) => void;
  mergeIdentityFromAuth: (res: StatusAPIResponse) => void;
  mergeSigner: (signer: StoredSigner | null) => void;
  signOutSession: () => void;
};

const LitecastSessionContext = createContext<LitecastSessionContextValue | null>(null);

function writeStorage(s: LitecastSession | null) {
  if (typeof window === 'undefined') return;
  if (s) {
    localStorage.setItem(LITECAST_SESSION_KEY, JSON.stringify(s));
  } else {
    localStorage.removeItem(LITECAST_SESSION_KEY);
  }
}

export function LitecastSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<LitecastSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LITECAST_SESSION_KEY);
      if (raw) {
        setSessionState(JSON.parse(raw) as LitecastSession);
      }
    } catch {
      setSessionState(null);
    }
  }, []);

  const setSession = useCallback((s: LitecastSession | null) => {
    writeStorage(s);
    setSessionState(s);
  }, []);

  const mergeIdentityFromAuth = useCallback((res: StatusAPIResponse) => {
    if (res.state !== 'completed' || res.fid == null) {
      return;
    }
    const identity: FarcasterIdentity = {
      fid: res.fid,
      username: res.username,
      displayName: res.displayName,
      pfpUrl: res.pfpUrl,
      bio: res.bio,
      custody: res.custody,
      verifications: res.verifications,
    };
    setSessionState((prev) => {
      const signer =
        prev?.signer && prev.signer.fid === identity.fid ? prev.signer : null;
      const next: LitecastSession = {
        identity,
        signer,
        updatedAt: new Date().toISOString(),
      };
      writeStorage(next);
      return next;
    });
  }, []);

  const mergeSigner = useCallback((signer: StoredSigner | null) => {
    setSessionState((prev) => {
      if (!prev?.identity?.fid) return prev;
      const next: LitecastSession = {
        ...prev,
        signer,
        updatedAt: new Date().toISOString(),
      };
      writeStorage(next);
      return next;
    });
  }, []);

  const signOutSession = useCallback(() => {
    writeStorage(null);
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      canWrite: canWriteSession(session),
      setSession,
      mergeIdentityFromAuth,
      mergeSigner,
      signOutSession,
    }),
    [session, setSession, mergeIdentityFromAuth, mergeSigner, signOutSession]
  );

  return (
    <LitecastSessionContext.Provider value={value}>{children}</LitecastSessionContext.Provider>
  );
}

export function useLitecastSession() {
  const ctx = useContext(LitecastSessionContext);
  if (!ctx) {
    throw new Error('useLitecastSession must be used within LitecastSessionProvider');
  }
  return ctx;
}
