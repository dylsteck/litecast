import { ed25519, x25519 } from '@noble/curves/ed25519.js';
import { gcm } from '@noble/ciphers/aes.js';
import { sha256, sha512 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { tokenFromApi } from './auth';
import { base64ToBytes, bytesToBase64, fromUtf8, toBase64Url, utf8 } from './bytes';
import { FARCASTER_API_BASE_URL } from './config';
import { FarcasterApiError, messageFromApiErrorBody } from './errors';
import type { AuthToken } from './types';

const WINDOW_MS = 30_000;
const POLL_MS = 1000;
const HANDSHAKE_MS = 1000 * 60 * 3;

type SyncMessage = {
  channelId: string;
  messageHash: string;
  message: string;
  base64PublicKey: string;
  base64Signature: string;
};

type ChannelKeys = {
  seed: Uint8Array;
  x25519Public: string;
  ed25519Public: string;
};

export function companionLoginUrl(channelId: string): string {
  return `https://farcaster.xyz/login-web?channel-id=${channelId}`;
}

export async function waitForCompanionSession({
  deviceId,
  onChannel,
  signal,
}: {
  deviceId: string;
  onChannel: (input: { channelId: string; url: string }) => void;
  signal: AbortSignal;
}): Promise<AuthToken> {
  const channelId = crypto.randomUUID();
  const keys = createChannelKeys();
  onChannel({ channelId, url: companionLoginUrl(channelId) });

  await postSyncMessage(deviceId, formatPublicKeyMessage(channelId, keys));

  const seen = new Set<string>();
  let aesKey: Uint8Array | undefined;
  const started = Date.now();
  let lastAnnounce = Date.now();

  while (!signal.aborted) {
    if (Date.now() - started > HANDSHAKE_MS) {
      throw new Error('Timed out waiting for the Farcaster app. Refresh the QR and try again.');
    }

    await sleep(POLL_MS, signal);
    const messages = await getSyncMessages(deviceId, channelId, keys).catch(() => [] as SyncMessage[]);

    for (const message of messages) {
      if (seen.has(message.messageHash)) continue;
      const bundle = decodeBundle(message.message);
      if (!bundle) {
        seen.add(message.messageHash);
        continue;
      }

      if (bundle.type === 'PublicKey' && bundle.payload && bundle.payload !== keys.x25519Public) {
        aesKey = sha256(x25519.getSharedSecret(keys.seed, base64ToBytes(bundle.payload)));
        seen.add(message.messageHash);
        await markRead(deviceId, channelId, keys, message.messageHash).catch(() => undefined);
        continue;
      }

      if (bundle.type === 'SymmetricKey' && aesKey && bundle.payload) {
        const unwrapped = unwrapKey(aesKey, bundle.payload);
        if (unwrapped) aesKey = unwrapped;
        seen.add(message.messageHash);
        continue;
      }

      if (bundle.type === 'string' && aesKey && bundle.payload) {
        const token = decryptAuthToken(aesKey, bundle.payload);
        if (token) return token;
        seen.add(message.messageHash);
      }
    }

    if (!aesKey && Date.now() - lastAnnounce > 8_000) {
      await postSyncMessage(deviceId, formatPublicKeyMessage(channelId, keys)).catch(() => undefined);
      lastAnnounce = Date.now();
    }
  }

  throw new DOMException('Login cancelled', 'AbortError');
}

function createChannelKeys(): ChannelKeys {
  const seed = randomBytes(32);
  return {
    seed,
    x25519Public: bytesToBase64(x25519.getPublicKey(seed)),
    ed25519Public: bytesToBase64(ed25519.getPublicKey(seed)),
  };
}

function epochWindow(offset = 0): number {
  return Math.floor((Date.now() + offset * WINDOW_MS) / WINDOW_MS);
}

function formatPublicKeyMessage(channelId: string, keys: ChannelKeys): SyncMessage {
  return formatSyncMessage(channelId, keys, keys.x25519Public, 'PublicKey');
}

function formatSyncMessage(channelId: string, keys: ChannelKeys, payload: string, type: string): SyncMessage {
  const message = bytesToBase64(utf8(JSON.stringify({ payload, type })));
  const hash = sha512(utf8(JSON.stringify({ channelId, message, base64PublicKey: keys.ed25519Public })));
  const window = String(epochWindow());
  const signature = ed25519.sign(utf8(`${bytesToBase64(hash)}${window}`), keys.seed);
  return {
    channelId,
    messageHash: `0x${toHex(hash)}`,
    message,
    base64PublicKey: keys.ed25519Public,
    base64Signature: bytesToBase64(signature),
  };
}

function decodeBundle(message: string): { type?: string; payload?: string } | null {
  try {
    return JSON.parse(fromUtf8(base64ToBytes(message))) as { type?: string; payload?: string };
  } catch {
    return null;
  }
}

function unwrapKey(aesKey: Uint8Array, payload: string): Uint8Array | undefined {
  try {
    return decryptBytes(aesKey, JSON.parse(payload) as Ciphertext);
  } catch {
    return undefined;
  }
}

function decryptAuthToken(aesKey: Uint8Array, payload: string): AuthToken | undefined {
  try {
    const ciphertext = JSON.parse(fromUtf8(base64ToBytes(payload))) as Ciphertext;
    const decoded = JSON.parse(fromUtf8(decryptBytes(aesKey, ciphertext))) as {
      secret?: string;
      expiresAt?: number;
      authToken?: { secret?: string; expiresAt?: number };
    };
    return tokenFromApi(decoded.authToken ?? decoded);
  } catch {
    return undefined;
  }
}

type Ciphertext = {
  base64Ciphertext: string;
  base64IV: string;
  base64AssociatedData?: string;
};

function decryptBytes(aesKey: Uint8Array, ciphertext: Ciphertext): Uint8Array {
  const iv = base64ToBytes(ciphertext.base64IV);
  const aad = ciphertext.base64AssociatedData ? base64ToBytes(ciphertext.base64AssociatedData) : undefined;
  return gcm(aesKey, iv, aad).decrypt(base64ToBytes(ciphertext.base64Ciphertext));
}

async function postSyncMessage(deviceId: string, body: SyncMessage) {
  return api(deviceId, '/v2/sync-channel', { method: 'POST', body });
}

async function getSyncMessages(deviceId: string, channelId: string, keys: ChannelKeys): Promise<SyncMessage[]> {
  const window = String(epochWindow());
  const signature = ed25519.sign(utf8(channelId + window), keys.seed);
  const data = await api<{ result?: { messages?: SyncMessage[] } }>(deviceId, '/v2/sync-channel', {
    method: 'GET',
    query: {
      channelId,
      base64PublicKey: toBase64Url(keys.ed25519Public),
      base64Signature: toBase64Url(bytesToBase64(signature)),
    },
  });
  return data.result?.messages ?? [];
}

async function markRead(deviceId: string, channelId: string, keys: ChannelKeys, messageHash: string) {
  const hashBase64 = bytesToBase64(fromHex(messageHash.replace(/^0x/, '')));
  const signature = ed25519.sign(utf8(channelId + hashBase64 + String(epochWindow())), keys.seed);
  await api(deviceId, '/v2/sync-channel-read', {
    method: 'POST',
    body: {
      channelId,
      messageHash,
      base64PublicKey: keys.ed25519Public,
      base64Signature: bytesToBase64(signature),
    },
  });
}

async function api<T>(
  deviceId: string,
  path: string,
  options: { method: 'GET' | 'POST'; query?: Record<string, string>; body?: unknown },
): Promise<T> {
  const params = new URLSearchParams(options.query ?? {});
  const qs = params.size ? `?${params}` : '';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'FC-DEVICE-ID': deviceId,
  };
  if (options.method !== 'GET') headers['Idempotency-Key'] = crypto.randomUUID();

  const response = await fetch(`${FARCASTER_API_BASE_URL}${path}${qs}`, {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new FarcasterApiError({
      status: response.status,
      path,
      message: messageFromApiErrorBody(data, `Farcaster API ${response.status}`),
    });
  }
  return data as T;
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Login cancelled', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Login cancelled', 'AbortError'));
      },
      { once: true },
    );
  });
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
