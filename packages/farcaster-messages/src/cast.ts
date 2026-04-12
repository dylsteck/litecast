import {
  CastType,
  FarcasterNetwork,
  Message,
  NobleEd25519Signer,
  hexStringToBytes,
  makeCastAdd,
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

export type CastEmbedInput =
  | { url: string }
  | { castId: { fid: number; hash: string } };

export async function buildSignedCastAddJson(params: {
  fid: number;
  signerPrivateKeyHex: string;
  text: string;
  parent?: { fid: number; hash: string };
  embeds?: CastEmbedInput[];
}): Promise<Record<string, unknown>> {
  const { fid, signerPrivateKeyHex, text, parent, embeds = [] } = params;
  const signer = new NobleEd25519Signer(privateKeyHexToBytes(signerPrivateKeyHex));

  const embedBodies = embeds.map((e) => {
    if ('url' in e) {
      return { url: e.url };
    }
    return {
      castId: { fid: e.castId.fid, hash: castHashToBytes(e.castId.hash) },
    };
  });

  const body = {
    type: CastType.CAST,
    text,
    embeds: embedBodies,
    embedsDeprecated: [] as string[],
    mentions: [] as number[],
    mentionsPositions: [] as number[],
    parentCastId: parent
      ? { fid: parent.fid, hash: castHashToBytes(parent.hash) }
      : undefined,
  };

  const result = await makeCastAdd(body, { fid, network: FarcasterNetwork.MAINNET }, signer);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return Message.toJSON(result.value) as Record<string, unknown>;
}
