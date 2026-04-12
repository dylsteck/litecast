import type { StoredSigner } from './signer';

/** Profile fields from Sign in with Farcaster (AuthKit / auth-client). */
export interface FarcasterIdentity {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  custody?: string;
  verifications?: string[];
}

/**
 * Combined session: SIWF identity plus optional app signer for writes.
 * @see SIGNER_FLOW.md — identity and signer are separate; posting requires both with matching FID.
 */
export interface LitecastSession {
  identity: FarcasterIdentity;
  signer: StoredSigner | null;
  updatedAt: string;
}

export const LITECAST_SESSION_KEY = 'litecast.session.v2';

export function canWrite(session: LitecastSession | null): boolean {
  if (!session?.identity?.fid) return false;
  if (!session.signer?.fid) return false;
  return session.identity.fid === session.signer.fid;
}
