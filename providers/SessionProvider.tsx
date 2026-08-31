import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isLiveToken, mintSession } from '../lib/farcaster/auth';
import { waitForCompanionSession } from '../lib/farcaster/companion';
import {
  DEVICE_ID_STORAGE_KEY,
  FarcasterClient,
  SESSION_STORAGE_KEY,
  TOKEN_REFRESH_WINDOW_MS,
  ViewEventBuffer,
  type AuthToken,
  type Session,
  type User,
} from '../lib/farcaster';
import {
  connectWallet,
  custodyFromMnemonic,
  getInjectedWallet,
  localSignMessage,
  walletSignMessage,
} from '../lib/farcaster/signers';

type SessionContextValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  isSignedIn: boolean;
  hasWallet: boolean;
  client: FarcasterClient;
  views: ViewEventBuffer;
  signInWithCompanion: (onChannel: (input: { url: string }) => void) => Promise<void>;
  signInWithWallet: () => Promise<void>;
  signInWithPhrase: (phrase: string) => Promise<void>;
  cancelCompanion: () => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function loadOrCreateDeviceId() {
  const existing = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, next);
  return next;
}

function parseStoredSession(raw: string): Session | null {
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.user?.fid || !isLiveToken(parsed.token)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const views = useMemo(() => new ViewEventBuffer(), []);
  const tokenRef = useRef<AuthToken | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const deviceRef = useRef('');
  const companionAbort = useRef<AbortController | null>(null);

  const persist = useCallback(async (next: Session | null) => {
    sessionRef.current = next;
    tokenRef.current = next?.token ?? null;
    setSession(next);
    if (next) await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const refreshSession = useCallback(async (): Promise<AuthToken | null> => {
    const current = sessionRef.current;
    const id = deviceRef.current;
    if (!current?.custodyAddress || !id) return null;
    try {
      const next = await mintSession({
        deviceId: id,
        custodyAddress: current.custodyAddress,
        signMessage: (message) => walletSignMessage(message, current.custodyAddress!),
      });
      await persist(next);
      return next.token;
    } catch {
      return null;
    }
  }, [persist]);

  const client = useMemo(
    () =>
      new FarcasterClient({
        getToken: () => tokenRef.current,
        getDeviceId: () => deviceRef.current || deviceId,
        getFid: () => sessionRef.current?.user.fid,
        refreshSession,
      }),
    [deviceId, refreshSession],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await loadOrCreateDeviceId();
      if (cancelled) return;
      deviceRef.current = id;
      setDeviceId(id);

      const envSecret = process.env.EXPO_PUBLIC_FC_SESSION_TOKEN;
      if (envSecret) {
        tokenRef.current = {
          secret: envSecret,
          expiresAt: Number(process.env.EXPO_PUBLIC_FC_SESSION_EXPIRES_AT) || Date.now() + 86_400_000,
        };
        try {
          const me = await new FarcasterClient({
            getToken: () => tokenRef.current,
            getDeviceId: () => id,
          }).getMe();
          if (!cancelled) {
            await persist({ token: tokenRef.current, user: me.result.user });
            setReady(true);
          }
          return;
        } catch {
          tokenRef.current = null;
        }
      }

      const stored = parseStoredSession((await AsyncStorage.getItem(SESSION_STORAGE_KEY)) ?? '');
      if (stored && !cancelled) {
        tokenRef.current = stored.token;
        sessionRef.current = stored;
        const needsRefresh =
          Boolean(stored.custodyAddress) && stored.token.expiresAt - Date.now() < TOKEN_REFRESH_WINDOW_MS;
        try {
          if (needsRefresh) {
            const refreshed = await refreshSession();
            if (refreshed) {
              setReady(true);
              return;
            }
          }
          const me = await new FarcasterClient({
            getToken: () => stored.token,
            getDeviceId: () => id,
            getFid: () => stored.user.fid,
          }).getMe();
          await persist({ ...stored, user: me.result.user });
        } catch {
          await persist(stored);
        }
      } else if (!cancelled) {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      companionAbort.current?.abort();
    };
  }, [persist, refreshSession]);

  const signInWithCompanion = useCallback(
    async (onChannel: (input: { url: string }) => void) => {
      companionAbort.current?.abort();
      const controller = new AbortController();
      companionAbort.current = controller;
      const token = await waitForCompanionSession({
        deviceId: deviceRef.current,
        signal: controller.signal,
        onChannel,
      });
      tokenRef.current = token;
      const me = await client.getMe();
      await persist({ token, user: me.result.user });
    },
    [client, persist],
  );

  const signInWithWallet = useCallback(async () => {
    companionAbort.current?.abort();
    const address = await connectWallet();
    await persist(
      await mintSession({
        deviceId: deviceRef.current,
        custodyAddress: address,
        signMessage: (message) => walletSignMessage(message, address),
      }),
    );
  }, [persist]);

  const signInWithPhrase = useCallback(
    async (phrase: string) => {
      companionAbort.current?.abort();
      const custody = custodyFromMnemonic(phrase);
      await persist(
        await mintSession({
          deviceId: deviceRef.current,
          custodyAddress: custody.address,
          signMessage: async (message) => localSignMessage(message, custody.privateKey),
        }),
      );
    },
    [persist],
  );

  const cancelCompanion = useCallback(() => {
    companionAbort.current?.abort();
  }, []);

  const signOut = useCallback(async () => {
    cancelCompanion();
    await persist(null);
  }, [cancelCompanion, persist]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      isSignedIn: Boolean(session?.token.secret),
      hasWallet: Boolean(getInjectedWallet()),
      client,
      views,
      signInWithCompanion,
      signInWithWallet,
      signInWithPhrase,
      cancelCompanion,
      signOut,
    }),
    [cancelCompanion, client, ready, session, signInWithCompanion, signInWithPhrase, signInWithWallet, signOut, views],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used within SessionProvider');
  return value;
}
