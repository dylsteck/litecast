import { mnemonicToAccount } from 'viem/accounts';

import { HTTP_STATUS } from '../../../service/httpStatus';

const FARCASTER_DEVELOPER_FID = 'YOUR_FARCASTER_DEVELOPER_FID';
const FARCASTER_DEVELOPER_MNEMONIC = 'YOUR_FARCASTER_DEVELOPER_MNEMONIC';

async function generateSignature(publicKey) {
  const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    chainId: 10,
    name: 'Farcaster SignedKeyRequestValidator',
    verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553',
    version: '1',
  };

  const SIGNED_KEY_REQUEST_TYPE = [
    { name: 'requestFid', type: 'uint256' },
    { name: 'key', type: 'bytes' },
    { name: 'deadline', type: 'uint256' },
  ];

  const account = mnemonicToAccount(FARCASTER_DEVELOPER_MNEMONIC);
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  const signature = await account.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: 'SignedKeyRequest',
    message: {
      requestFid: BigInt(FARCASTER_DEVELOPER_FID),
      key: publicKey,
      deadline: BigInt(deadline),
    },
  });

  return { deadline, signature };
}

export async function POST() {
  try {
    const createSignerResponse = await fetch('https://api.neynar.com/v2/farcaster/signer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
    });
    const createSignerData = await createSignerResponse.json();

    const { deadline, signature } = await generateSignature(createSignerData.public_key);

    const signedKeyResponse = await fetch('https://api.neynar.com/v2/farcaster/signer/signed_key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        signer_uuid: createSignerData.signer_uuid,
        app_fid: FARCASTER_DEVELOPER_FID,
        deadline,
        signature,
      }),
    });
    const signedKeyData = await signedKeyResponse.json();

    return new Response(
      JSON.stringify(signedKeyData),
      {
        status: HTTP_STATUS.OK,
      },
    );
  } catch (error) {
    console.error('Error in POST /api/signer:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      },
    );
  }
}

export const runtime = 'edge';