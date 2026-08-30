import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HIDDEN_CASTS_STORAGE_KEY, MUTED_FIDS_STORAGE_KEY } from '../lib/farcaster';

type HiddenContextValue = {
  hiddenHashes: Set<string>;
  mutedFids: Set<number>;
  hideCast: (hash: string) => void;
  muteFid: (fid: number) => void;
  unmuteFid: (fid: number) => void;
  isHidden: (hash: string, fid: number) => boolean;
};

const HiddenContext = createContext<HiddenContextValue | null>(null);

export function HiddenProvider({ children }: { children: React.ReactNode }) {
  const [hiddenHashes, setHiddenHashes] = useState<Set<string>>(new Set());
  const [mutedFids, setMutedFids] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      const [hiddenRaw, mutedRaw] = await Promise.all([
        AsyncStorage.getItem(HIDDEN_CASTS_STORAGE_KEY),
        AsyncStorage.getItem(MUTED_FIDS_STORAGE_KEY),
      ]);
      if (hiddenRaw) setHiddenHashes(new Set(JSON.parse(hiddenRaw)));
      if (mutedRaw) setMutedFids(new Set(JSON.parse(mutedRaw)));
    })();
  }, []);

  const hideCast = useCallback((hash: string) => {
    setHiddenHashes((current) => {
      const next = new Set(current);
      next.add(hash);
      void AsyncStorage.setItem(HIDDEN_CASTS_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const muteFid = useCallback((fid: number) => {
    setMutedFids((current) => {
      const next = new Set(current);
      next.add(fid);
      void AsyncStorage.setItem(MUTED_FIDS_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const unmuteFid = useCallback((fid: number) => {
    setMutedFids((current) => {
      const next = new Set(current);
      next.delete(fid);
      void AsyncStorage.setItem(MUTED_FIDS_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isHidden = useCallback(
    (hash: string, fid: number) => hiddenHashes.has(hash) || mutedFids.has(fid),
    [hiddenHashes, mutedFids],
  );

  const value = useMemo(
    () => ({ hiddenHashes, mutedFids, hideCast, muteFid, unmuteFid, isHidden }),
    [hiddenHashes, mutedFids, hideCast, muteFid, unmuteFid, isHidden],
  );

  return <HiddenContext.Provider value={value}>{children}</HiddenContext.Provider>;
}

export function useHidden() {
  const value = useContext(HiddenContext);
  if (!value) throw new Error('useHidden must be used within HiddenProvider');
  return value;
}
