import {
  FarcasterNetwork,
  Message,
  NobleEd25519Signer,
  ReactionType,
  hexStringToBytes,
  makeReactionAdd,
} from '@farcaster/core';
import { privateKeyHexToBytes } from './hex';

function castHashToBytes(hex: string): Uint8Array {
  const h = hex.startsWith('0x') || hex.startsWith('0X') ? hex : `0x${hex}`;
  const r = hexStringToBytes(h);
  if (r.isErr()) {
    throw new Error(r.error.message);
  }
  return r.value;
}

export async function buildSignedReactionAddJson(params: {
  fid: number;
  signerPrivateKeyHex: string;
  targetFid: number;
  targetHash: string;
  reactionType: 'like' | 'recast';
}): Promise<Record<string, unknown>> {
  const { fid, signerPrivateKeyHex, targetFid, targetHash, reactionType } = params;
  const signer = new NobleEd25519Signer(privateKeyHexToBytes(signerPrivateKeyHex));
  const type = reactionType === 'like' ? ReactionType.LIKE : ReactionType.RECAST;

  const body = {
    type,
    targetCastId: { fid: targetFid, hash: castHashToBytes(targetHash) },
  };

  const result = await makeReactionAdd(body, { fid, network: FarcasterNetwork.MAINNET }, signer);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return Message.toJSON(result.value) as Record<string, unknown>;
}
