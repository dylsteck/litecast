import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LitecastSession, StoredSigner } from '@litecast/types';
import { LITECAST_SESSION_KEY } from '@litecast/types';

const LEGACY_SIGNER_KEY = 'FARCASTER_SIGNER';

export async function getLitecastSession(): Promise<LitecastSession | null> {
  try {
    const raw = await AsyncStorage.getItem(LITECAST_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw) as LitecastSession;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLitecastSession(session: LitecastSession | null): Promise<void> {
  if (session) {
    await AsyncStorage.setItem(LITECAST_SESSION_KEY, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(LITECAST_SESSION_KEY);
  }
}

/** When signer gains an FID, keep Litecast session in sync (mobile “identity” = signer FID until SIWF exists). */
export async function persistLitecastSessionFromSigner(signer: StoredSigner): Promise<void> {
  if (!signer.fid) return;
  const session: LitecastSession = {
    identity: { fid: signer.fid },
    signer,
    updatedAt: new Date().toISOString(),
  };
  await setLitecastSession(session);
}

export async function loadOrMigrateLitecastSession(): Promise<LitecastSession | null> {
  let session = await getLitecastSession();
  if (session) return session;

  try {
    const legacy = await AsyncStorage.getItem(LEGACY_SIGNER_KEY);
    if (!legacy) return null;
    const signer = JSON.parse(legacy) as StoredSigner;
    if (!signer.fid) return null;
    session = {
      identity: { fid: signer.fid },
      signer,
      updatedAt: new Date().toISOString(),
    };
    await setLitecastSession(session);
    return session;
  } catch {
    return null;
  }
}
