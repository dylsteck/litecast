/** Ed25519 seed / private key: 32 bytes = 64 hex chars (no 0x in stored signer). */
export function privateKeyHexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/i, '');
  if (clean.length !== 64) {
    throw new Error('Invalid Ed25519 private key hex length');
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
