import type { SignedKeyRequestResponse, SignerStatusResponse } from '@litecast/types';

export async function createSignedKeyRequestWeb(publicKey: string): Promise<SignedKeyRequestResponse> {
  const res = await fetch('/api/signer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Signer request failed: ${res.status}`);
  }
  return data as SignedKeyRequestResponse;
}

export async function pollSignerStatusWeb(
  token: string,
  options: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<SignerStatusResponse> {
  const { intervalMs = 2000, timeoutMs = 300_000 } = options;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`/api/signer?token=${encodeURIComponent(token)}`);
    const status = (await res.json()) as SignerStatusResponse & { error?: string };
    if (!res.ok) {
      throw new Error(status.error || `Poll failed: ${res.status}`);
    }
    if (status.state === 'completed' || status.state === 'approved') {
      return status;
    }
    if (status.state === 'revoked') {
      throw new Error('Signer request was revoked');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Signer approval timed out');
}
