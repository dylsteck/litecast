import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  DEVICE_ID_STORAGE_KEY,
  FarcasterClient,
  SESSION_STORAGE_KEY,
  ViewEventBuffer,
  createAuthChannel,
  pollAuthChannel,
  type AuthToken,
  type Session,
  type User,
} from '../lib/farcaster';

type SessionContextValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  isSignedIn: boolean;
  client: FarcasterClient;
  views: ViewEventBuffer;
  signInWithFarcaster: () => Promise<{ url: string; cancel: () => void }>;
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

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const views = useMemo(() => new ViewEventBuffer(), []);
  const tokenRef = useRef<AuthToken | null>(null);
  const fidRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    tokenRef.current = session?.token ?? null;
    fidRef.current = session?.user.fid;
  }, [session]);

  const client = useMemo(
    () =>
      new FarcasterClient({
        getToken: () => tokenRef.current,
        getDeviceId: () => deviceId,
        getFid: () => fidRef.current,
      }),
    [deviceId],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await loadOrCreateDeviceId();
      if (cancelled) return;
      setDeviceId(id);

      const envSecret = process.env.EXPO_PUBLIC_FC_SESSION_TOKEN;
      const envExpires = Number(process.env.EXPO_PUBLIC_FC_SESSION_EXPIRES_AT ?? 0);
      if (envSecret) {
        tokenRef.current = { secret: envSecret, expiresAt: envExpires || Date.now() + 1000 * 60 * 60 * 24 };
        try {
          const me = await new FarcasterClient({
            getToken: () => tokenRef.current,
            getDeviceId: () => id,
          }).getMe();
          const next = { token: tokenRef.current, user: me.result.user };
          if (!cancelled) {
            setSession(next);
            await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
            setReady(true);
          }
          return;
        } catch {
          tokenRef.current = null;
        }
      }

      const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (raw && !cancelled) {
        try {
          const parsed = JSON.parse(raw) as Session;
          if (parsed.user?.fid) {
            fidRef.current = parsed.user.fid;
            const liveToken =
              parsed.token?.secret && parsed.token.expiresAt > Date.now() ? parsed.token : undefined;
            tokenRef.current = liveToken ?? null;
            if (liveToken) {
              try {
                const me = await new FarcasterClient({
                  getToken: () => liveToken,
                  getDeviceId: () => id,
                  getFid: () => parsed.user.fid,
                }).getMe();
                const next = { token: liveToken, user: me.result.user };
                setSession(next);
                await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
              } catch {
                setSession({ user: parsed.user, token: liveToken });
              }
            } else {
              setSession({ user: parsed.user });
            }
          } else {
            await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } catch {
          await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Session | null) => {
    setSession(next);
    if (next) {
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const signInWithFarcaster = useCallback(async () => {
    const domain = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.host : 'litecast.app';
    const siweUri = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : 'https://litecast.app';
    const channel = await createAuthChannel({ domain, siweUri });
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        const status = await pollAuthChannel(channel.channelToken);
        if (status.state === 'completed') {
          const user = (
            await client.getUserByFid(status.fid)
          ).result.user;
          // SIWF proves identity. Ranked feeds + writes still need a client.farcaster.xyz session.
          await persist({ user });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    };

    void poll();
    return {
      url: channel.url,
      cancel: () => {
        cancelled = true;
      },
    };
  }, [client, persist]);

  const signOut = useCallback(async () => {
    tokenRef.current = null;
    fidRef.current = undefined;
    await persist(null);
  }, [persist]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      isSignedIn: Boolean(session?.user),
      client,
      views,
      signInWithFarcaster,
      signOut,
    }),
    [client, ready, session, signInWithFarcaster, signOut, views],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used within SessionProvider');
  return value;
}
