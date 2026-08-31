import { addressFromPrivateKey, custodyFromMnemonic, localSignMessage } from './signers';
import { buildGenerateTokenRequest, canonicalize, eip191Bearer, isLiveToken } from './auth';
import { hexToBytes } from './bytes';

describe('auth', () => {
  it('canonicalizes objects with sorted keys', () => {
    expect(canonicalize({ method: 'generateToken', params: { timestamp: 2, expiresAt: 1 } })).toBe(
      '{"method":"generateToken","params":{"expiresAt":1,"timestamp":2}}',
    );
  });

  it('builds a generateToken request', () => {
    const request = buildGenerateTokenRequest(1000);
    expect(request).toEqual({
      method: 'generateToken',
      params: { timestamp: 1000, expiresAt: 1000 + 1000 * 24 * 60 * 60 * 1000 },
    });
  });

  it('derives the known custody address from the test mnemonic', () => {
    const custody = custodyFromMnemonic('test test test test test test test test test test test junk');
    expect(custody.address).toBe('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
    expect(addressFromPrivateKey(custody.privateKey)).toBe(custody.address);
  });

  it('produces an eip191 bearer from a hex signature', () => {
    const signature = localSignMessage('hello', custodyFromMnemonic('test test test test test test test test test test test junk').privateKey);
    expect(signature.startsWith('0x')).toBe(true);
    expect(hexToBytes(signature)).toHaveLength(65);
    expect(eip191Bearer(signature).startsWith('eip191:')).toBe(true);
  });

  it('treats missing expiry as live and expired tokens as dead', () => {
    expect(isLiveToken({ secret: 'x', expiresAt: Date.now() + 1000 })).toBe(true);
    expect(isLiveToken({ secret: 'x', expiresAt: Date.now() - 1000 })).toBe(false);
    expect(isLiveToken(undefined)).toBe(false);
  });
});
