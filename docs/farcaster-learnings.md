# Farcaster Account Operations - Technical Reference

A comprehensive guide compiled from various implementations (Quorum, Nook, Supercast, farcaster-signer-tools) for Farcaster account operations.

---

## Table of Contents

1. [Key Concepts](#key-concepts)
2. [Seed Phrase to Private Key](#seed-phrase-to-private-key)
3. [Signer Creation Flow](#signer-creation-flow)
4. [Auth Token Generation](#auth-token-generation)
5. [Signing & Submitting Messages](#signing--submitting-messages)
6. [EIP-712 Signatures](#eip-712-signatures)
7. [SIWE (Sign-In with Ethereum)](#siwe-sign-in-with-ethereum)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Libraries & Dependencies](#libraries--dependencies)

---

## Key Concepts

### Two Types of Keys in Farcaster

| Key Type | Curve | Purpose | Derivation |
|----------|-------|---------|------------|
| **Custody Key** | secp256k1 (Ethereum) | Owns the FID, signs EIP-712 requests, SIWE | BIP-44: `m/44'/60'/0'/0/0` |
| **Signer Key** | Ed25519 | Signs casts, reactions, follows | Random or SLIP-0010 derivation |

### Key Relationships

```
Seed Phrase (12/24 words)
    │
    ├──► Custody Address (Ethereum) ──► Owns FID
    │    - Signs signer requests (EIP-712)
    │    - Signs SIWE messages
    │    - Can add/revoke signers
    │
    └──► Signer Key (Ed25519) ──► Signs Messages
         - Signs casts, reactions, links
         - Registered on-chain via custody key
         - Multiple signers per FID allowed
```

---

## Seed Phrase to Private Key

### Using viem (Simplest)

```typescript
import { mnemonicToAccount } from "viem/accounts";

// Derives custody key using BIP-44 path: m/44'/60'/0'/0/0
const account = mnemonicToAccount(mnemonic, { accountIndex: 0 });

// Now you can sign messages
const signature = await account.signTypedData({ ... });
const personalSig = await account.signMessage({ message: "..." });
```

### Manual Ethereum Key Derivation (Without viem)

```typescript
import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha2';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

const HARDENED_OFFSET = 0x80000000;
const BITCOIN_SEED_KEY = new TextEncoder().encode('Bitcoin seed');

function deriveEthereumKey(mnemonic: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  // Master key
  const masterKey = hmac(sha512, BITCOIN_SEED_KEY, seed);
  let key = masterKey.slice(0, 32);
  let chainCode = masterKey.slice(32);
  
  // BIP-44 path: m/44'/60'/0'/0/0
  const path = [
    44 + HARDENED_OFFSET,  // purpose
    60 + HARDENED_OFFSET,  // coin type (ETH)
    0 + HARDENED_OFFSET,   // account
    0,                      // change
    0,                      // address index
  ];
  
  for (const index of path) {
    // ... derive child key (see quorum-mobile/farcasterService.ts)
  }
  
  // Get Ethereum address
  const publicKey = secp256k1.getPublicKey(key, false);
  const hash = keccak_256(publicKey.slice(1));
  const address = '0x' + bytesToHex(hash.slice(-20));
  
  return { address, privateKey: bytesToHex(key) };
}
```

### Ed25519 Signer Key Derivation (Deterministic from Seed)

```typescript
import { ed25519 } from '@noble/curves/ed25519';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha2';
import * as bip39 from '@scure/bip39';

const ED25519_SEED_KEY = new TextEncoder().encode('ed25519 seed');

function deriveSignerKey(mnemonic: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  // SLIP-0010 for ed25519
  const masterKey = hmac(sha512, ED25519_SEED_KEY, seed);
  let key = masterKey.slice(0, 32);
  let chainCode = masterKey.slice(32);
  
  // Hardened path (ed25519 only supports hardened)
  const path = [
    44 + HARDENED_OFFSET,
    60 + HARDENED_OFFSET,
    0 + HARDENED_OFFSET,
    0 + HARDENED_OFFSET,
    0 + HARDENED_OFFSET,
  ];
  
  for (const index of path) {
    const data = concatBytes(new Uint8Array([0]), key, ser32(index));
    const I = hmac(sha512, chainCode, data);
    key = I.slice(0, 32);
    chainCode = I.slice(32);
  }
  
  const publicKey = ed25519.getPublicKey(key);
  return { privateKey: bytesToHex(key), publicKey: bytesToHex(publicKey) };
}
```

---

## Signer Creation Flow

### Overview

```
1. Generate Ed25519 keypair (client-side)
2. Sign EIP-712 request with app's custody key (server-side)
3. POST to Farcaster API → get deeplink URL + token
4. User opens deeplink → approves in Warpcast
5. Poll for completion
6. Store signer locally
```

### Step 1: Generate Keypair

```typescript
import * as ed25519 from '@noble/ed25519';

const privateKey = ed25519.utils.randomPrivateKey();
const publicKey = await ed25519.getPublicKeyAsync(privateKey);

// Store as hex strings
const keyPair = {
  privateKey: Buffer.from(privateKey).toString('hex'),
  publicKey: Buffer.from(publicKey).toString('hex'),
};
```

### Step 2: Sign EIP-712 Request

```typescript
import { mnemonicToAccount } from 'viem/accounts';

const SIGNED_KEY_REQUEST_DOMAIN = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10, // Optimism
  verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553',
} as const;

const SIGNED_KEY_REQUEST_TYPE = [
  { name: 'requestFid', type: 'uint256' },
  { name: 'key', type: 'bytes' },
  { name: 'deadline', type: 'uint256' },
] as const;

async function signKeyRequest(publicKey: string, appFid: number, appMnemonic: string) {
  const account = mnemonicToAccount(appMnemonic);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24h
  
  const signature = await account.signTypedData({
    domain: SIGNED_KEY_REQUEST_DOMAIN,
    types: { SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE },
    primaryType: 'SignedKeyRequest',
    message: {
      requestFid: BigInt(appFid),
      key: `0x${publicKey}` as `0x${string}`,
      deadline,
    },
  });
  
  return { signature, deadline: Number(deadline) };
}
```

### Step 3: POST to Farcaster API

```typescript
const response = await fetch('https://api.farcaster.xyz/v2/signed-key-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: `0x${publicKey}`,
    signature,
    requestFid: appFid,
    deadline,
  }),
});

const { result } = await response.json();
// result.signedKeyRequest contains: { token, deeplinkUrl, state }
```

### Step 4: Poll for Completion

```typescript
async function pollSignerStatus(token: string): Promise<{ state: string; userFid?: number }> {
  const response = await fetch(
    `https://api.farcaster.xyz/v2/signed-key-request?token=${token}`
  );
  const { result } = await response.json();
  return {
    state: result.signedKeyRequest.state,
    userFid: result.signedKeyRequest.userFid,
  };
}

// Poll until state === 'completed'
```

---

## Auth Token Generation

For direct Farcaster API access (not Hub), generate an auth token from the custody key.

### Flow

```typescript
import { mnemonicToAccount } from 'viem/accounts';

// 1. Build payload
const payload = {
  method: 'generateToken',
  params: {
    timestamp: Date.now(),
    expiresAt: Date.now() + 1000 * 24 * 60 * 60 * 1000, // 1000 days
  },
};

// 2. Canonicalize (sort keys alphabetically)
function canonicalize(obj: unknown): string {
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalize).join(',') + ']';
  }
  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => 
      JSON.stringify(k) + ':' + canonicalize((obj as any)[k])
    ).join(',') + '}';
  }
  return JSON.stringify(obj);
}

const canonical = canonicalize(payload);

// 3. Sign with EIP-191 personal sign
const account = mnemonicToAccount(mnemonic);
const signature = await account.signMessage({ message: canonical });

// 4. Create bearer token
const sigHex = signature.slice(2);
const bytes = hexToBytes(sigHex);
const base64Sig = btoa(String.fromCharCode(...bytes));
const bearerToken = `eip191:${base64Sig}`;

// 5. Exchange for JWT
const response = await fetch('https://client.farcaster.xyz/v2/onboarding-state', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ authRequest: payload }),
});

const { result } = await response.json();
const jwtToken = result.token.secret; // Use this for API calls
```

---

## Signing & Submitting Messages

### Using @farcaster/hub-nodejs (Recommended)

```typescript
import {
  NobleEd25519Signer,
  makeCastAdd,
  makeReactionAdd,
  makeLinkAdd,
  FarcasterNetwork,
} from '@farcaster/hub-nodejs';
import { hexToBytes } from 'viem';

const signer = new NobleEd25519Signer(hexToBytes(privateKey));

// Create a cast
const castAdd = await makeCastAdd(
  {
    text: 'Hello Farcaster!',
    embeds: [],
    embedsDeprecated: [],
    mentions: [],
    mentionsPositions: [],
  },
  { fid: userFid, network: FarcasterNetwork.MAINNET },
  signer
);

// Submit to Hub
const result = await hubClient.submitMessage(castAdd.value);
```

### Manual Message Signing (Without hub-nodejs)

```typescript
import { blake3 } from '@noble/hashes/blake3';
import * as ed25519 from '@noble/ed25519';

async function signMessageData(messageData: MessageData, privateKeyHex: string) {
  const dataBytes = MessageData.encode(messageData).finish();
  const hash = blake3(dataBytes, { dkLen: 20 });
  
  const privateKey = hexToBytes(privateKeyHex);
  const signature = await ed25519.signAsync(hash, privateKey);
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  
  return Message.create({
    data: messageData,
    hash,
    hashScheme: HashScheme.BLAKE3,
    signature,
    signatureScheme: SignatureScheme.ED25519,
    signer: publicKey,
  });
}
```

### Submitting to Hub

```typescript
async function submitMessage(message: Message, hubUrl: string) {
  const messageBytes = Buffer.from(Message.encode(message).finish());
  
  const response = await fetch(`${hubUrl}/v1/submitMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: messageBytes,
  });
  
  return response.json();
}
```

---

## EIP-712 Signatures

### SignedKeyRequest (Signer Registration)

```typescript
const domain = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10,
  verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553',
};

const types = {
  SignedKeyRequest: [
    { name: 'requestFid', type: 'uint256' },
    { name: 'key', type: 'bytes' },
    { name: 'deadline', type: 'uint256' },
  ],
};
```

---

## SIWE (Sign-In with Ethereum)

For mini app authentication:

```typescript
function createSiweMessage(params: {
  domain: string;
  address: string;
  uri: string;
  fid: number;
  nonce?: string;
}): string {
  const now = new Date();
  const checksumAddress = toChecksumAddress(params.address);
  
  const lines = [
    `${params.domain} wants you to sign in with your Ethereum account:`,
    checksumAddress,
    '',
    'Farcaster Auth',
    '',
    `URI: ${params.uri}`,
    `Version: 1`,
    `Chain ID: 10`,
    params.nonce ? `Nonce: ${params.nonce}` : null,
    `Issued At: ${now.toISOString()}`,
    `Resources:`,
    `- farcaster://fid/${params.fid}`,
  ].filter(Boolean);
  
  return lines.join('\n');
}

// Sign with EIP-191 personal sign
const message = createSiweMessage({ ... });
const signature = await account.signMessage({ message });
```

---

## API Endpoints Reference

### Farcaster API (api.farcaster.xyz)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/signed-key-requests` | POST | Create signer request |
| `/v2/signed-key-request?token=` | GET | Poll signer status |

### Farcaster Client API (client.farcaster.xyz)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/onboarding-state` | PUT | Generate auth token |
| `/v2/feed-items` | POST | Fetch feed |
| `/v2/casts` | POST | Post a cast |
| `/v2/user-by-fid?fid=` | GET | Get user profile |

### Hub API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/submitMessage` | POST | Submit signed message |
| `/v1/castsByFid` | GET | Get casts by FID |
| `/v1/reactionsByFid` | GET | Get reactions by FID |
| `/v1/linksByFid` | GET | Get follows by FID |
| `/v1/userDataByFid` | GET | Get user data by FID |
| `/v1/verificationsByFid` | GET | Get verifications |

---

## Libraries & Dependencies

### Core Libraries

```json
{
  "@noble/ed25519": "^2.0.0",      // Ed25519 signing
  "@noble/curves": "^1.2.0",        // secp256k1, ed25519
  "@noble/hashes": "^1.3.0",        // SHA-512, Blake3, Keccak
  "@scure/bip39": "^1.2.0",         // Mnemonic handling
  "viem": "^2.0.0",                 // Ethereum utilities
  "@farcaster/hub-nodejs": "^0.11.0" // Hub message creation
}
```

### React Native Polyfills

For `@noble/ed25519` in React Native:

```typescript
import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2';
import * as Crypto from 'expo-crypto';

// Polyfill crypto.getRandomValues
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      const randomBytes = Crypto.getRandomBytes(arr.length);
      arr.set(randomBytes);
      return arr;
    },
  };
}

// Set SHA-512 implementation
ed25519.etc.sha512Sync = (...msgs) => sha512(concatBytes(...msgs));
ed25519.etc.sha512Async = async (...msgs) => sha512(concatBytes(...msgs));
```

---

## Quick Reference

### Environment Variables

```bash
# App credentials for signer creation
FARCASTER_APP_FID=12345
FARCASTER_APP_MNEMONIC="your twelve word seed phrase here"

# Optional: direct private key instead of mnemonic
FARCASTER_APP_PRIVATE_KEY=0x...
```

### Common Hex Conversions

```typescript
// Uint8Array to hex
const hex = Buffer.from(bytes).toString('hex');
const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

// Hex to Uint8Array
const bytes = Buffer.from(hex, 'hex');
const bytes = new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
```

---

## Sources

- `quorum-mobile/services/onboarding/farcasterService.ts` - Key derivation
- `supercast-dump/supercast/src/utils/signer.ts` - EIP-712 signing
- `onchain-health/lib/farcaster-auth.ts` - Auth token generation
- `nook-client/packages/signer-api/src/` - Full signer service
- `farcaster-signer-tools/src/app/utils.ts` - Message signing & submission
