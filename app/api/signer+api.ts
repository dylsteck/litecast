import { ExpoRequest, ExpoResponse } from 'expo-router/server';
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';

const FARCASTER_API_BASE = 'https://api.farcaster.xyz';

// EIP-712 domain for Farcaster Signed Key Requests
// From: https://docs.farcaster.xyz/reference/warpcast/signer-requests
const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10, // Optimism
  verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553' as `0x${string}`,
} as const;

const SIGNED_KEY_REQUEST_TYPE = [
  { name: 'requestFid', type: 'uint256' },
  { name: 'key', type: 'bytes' },
  { name: 'deadline', type: 'uint256' },
] as const;

export async function POST(request: ExpoRequest): Promise<ExpoResponse> {
  try {
    // Get app credentials from environment
    // Support both mnemonic (preferred) and private key
    const appFid = process.env.FARCASTER_APP_FID;
    const appMnemonic = process.env.FARCASTER_APP_MNEMONIC;
    const appPrivateKey = process.env.FARCASTER_APP_PRIVATE_KEY;

    if (!appFid) {
      return ExpoResponse.json(
        { error: 'FARCASTER_APP_FID not configured.' },
        { status: 500 }
      );
    }

    if (!appMnemonic && !appPrivateKey) {
      return ExpoResponse.json(
        { error: 'Farcaster app credentials not configured. Set FARCASTER_APP_MNEMONIC or FARCASTER_APP_PRIVATE_KEY.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { publicKey } = body;

    if (!publicKey) {
      return ExpoResponse.json(
        { error: 'publicKey is required' },
        { status: 400 }
      );
    }

    // Create account from mnemonic (preferred) or private key
    const account = appMnemonic 
      ? mnemonicToAccount(appMnemonic)
      : privateKeyToAccount(appPrivateKey as `0x${string}`);

    // Deadline: 24 hours from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);

    // Convert public key to bytes (0x prefixed hex)
    const keyBytes = `0x${publicKey}` as `0x${string}`;

    // Sign the EIP-712 typed data for Signed Key Request
    const signature = await account.signTypedData({
      domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
      types: {
        SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
      },
      primaryType: 'SignedKeyRequest',
      message: {
        requestFid: BigInt(appFid),
        key: keyBytes,
        deadline,
      },
    });

    // POST to Farcaster API
    const response = await fetch(`${FARCASTER_API_BASE}/v2/signed-key-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: keyBytes,
        requestFid: parseInt(appFid, 10),
        signature,
        deadline: Number(deadline),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Farcaster API error:', errorData);
      return ExpoResponse.json(
        { error: `Farcaster API error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return ExpoResponse.json(data);
  } catch (error: any) {
    console.error('Signer API error:', error);
    return ExpoResponse.json(
      { error: error.message || 'Failed to create signer request' },
      { status: 500 }
    );
  }
}

// GET endpoint to poll signer status
export async function GET(request: ExpoRequest): Promise<ExpoResponse> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return ExpoResponse.json(
        { error: 'token parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${FARCASTER_API_BASE}/v2/signed-key-request?token=${token}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return ExpoResponse.json(
        { error: `Farcaster API error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return ExpoResponse.json(data);
  } catch (error: any) {
    console.error('Signer status API error:', error);
    return ExpoResponse.json(
      { error: error.message || 'Failed to get signer status' },
      { status: 500 }
    );
  }
}
