import * as ed25519 from '@noble/ed25519';

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateSignerKeypairWeb(): Promise<{ privateKey: string; publicKey: string }> {
  const privateKeyBytes = ed25519.utils.randomPrivateKey();
  const publicKeyBytes = await ed25519.getPublicKeyAsync(privateKeyBytes);
  return {
    privateKey: uint8ArrayToHex(privateKeyBytes),
    publicKey: uint8ArrayToHex(publicKeyBytes),
  };
}
