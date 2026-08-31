import { FARCASTER_API_BASE_URL, TOKEN_TTL_MS } from './config';
import { bytesToBase64, hexToBytes } from './bytes';
import { FarcasterApiError, messageFromApiErrorBody } from './errors';
import type { AuthToken, Session, User } from './types';

export type GenerateTokenRequest = {
  method: 'generateToken';
  params: { timestamp: number; expiresAt: number };
};

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const keys = Object.keys(value as object).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize((value as Record<string, unknown>)[key])}`).join(',')}}`;
}

export function buildGenerateTokenRequest(now = Date.now()): GenerateTokenRequest {
  return {
    method: 'generateToken',
    params: { timestamp: now, expiresAt: now + TOKEN_TTL_MS },
  };
}

export function eip191Bearer(signatureHex: string): string {
  return `eip191:${bytesToBase64(hexToBytes(signatureHex))}`;
}

type OnboardingResult = {
  result?: {
    state?: { user?: User };
    token?: { secret?: string; expiresAt?: number };
  };
};

export async function mintSession(input: {
  signMessage: (message: string) => Promise<string>;
  deviceId: string;
  custodyAddress?: string;
}): Promise<Session> {
  const authRequest = buildGenerateTokenRequest();
  const signature = await input.signMessage(canonicalize(authRequest));
  const response = await fetch(`${FARCASTER_API_BASE_URL}/v2/onboarding-state`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${eip191Bearer(signature)}`,
      'FC-DEVICE-ID': input.deviceId,
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({ authRequest }),
  });

  const text = await response.text();
  const data = (text ? JSON.parse(text) : null) as OnboardingResult | null;
  if (!response.ok) {
    throw new FarcasterApiError({
      status: response.status,
      path: '/v2/onboarding-state',
      message: messageFromApiErrorBody(data, 'Could not create a Farcaster session'),
    });
  }

  const token = tokenFromApi(data?.result?.token);
  const user = data?.result?.state?.user;
  if (!token || !user?.fid) {
    throw new FarcasterApiError({
      status: 404,
      path: '/v2/onboarding-state',
      message: 'This wallet is not a Farcaster custody address',
    });
  }

  return {
    user,
    token,
    custodyAddress: input.custodyAddress?.toLowerCase(),
  };
}

export function tokenFromApi(value?: { secret?: string; expiresAt?: number } | null): AuthToken | undefined {
  if (!value?.secret) return undefined;
  return {
    secret: value.secret,
    expiresAt: typeof value.expiresAt === 'number' ? value.expiresAt : Date.now() + TOKEN_TTL_MS,
  };
}

export function isLiveToken(token?: AuthToken | null): token is AuthToken {
  if (!token?.secret) return false;
  return !token.expiresAt || token.expiresAt > Date.now();
}
