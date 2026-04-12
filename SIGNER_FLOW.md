# Signer Creation Flow - Complete Documentation

## Overview

The signer creation flow allows users to connect their Farcaster account to Litecast by generating a cryptographic keypair, requesting approval from Farcaster, and storing the approved signer for future use.

---

## Complete Flow Diagram

```
User Opens App
    ↓
Check if signer exists → [Yes] → Navigate to Main App
    ↓ [No]
Show Onboarding Screen
    ↓
User Clicks "Connect Farcaster"
    ↓
┌─────────────────────────────────────────┐
│ STEP 1: Generate Ed25519 Keypair      │
│ - generateSignerKeypair()              │
│ - Creates private/public key pair     │
│ - Uses @noble/ed25519 + expo-crypto   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 2: Create Signed Key Request      │
│ - createSignedKeyRequest(publicKey)    │
│ - Calls POST /api/signer                │
│ - Web API signs with app credentials    │
│ - Returns: { token, deeplinkUrl, ... }  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 3: Store Signer Locally           │
│ - storeSigner({ privateKey, publicKey, │
│                token, createdAt })      │
│ - Saves to AsyncStorage                 │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 4: Open Farcaster Deep Link       │
│ - Linking.openURL(deeplinkUrl)          │
│ - Opens Farcaster app                  │
│ - User approves signer in Farcaster     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 5: Poll for Approval Status       │
│ - pollSignerStatus(token)               │
│ - Calls GET /api/signer?token=...       │
│ - Polls every 2 seconds                │
│ - Continues until:                      │
│   • approved/completed → Success        │
│   • revoked → Error                     │
│   • timeout (5 min) → Error             │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 6: Update Signer with FID         │
│ - storeSigner({ ..., fid: userFid })    │
│ - Saves user's Farcaster ID             │
│ - Mark onboarding as seen               │
└─────────────────────────────────────────┘
    ↓
Navigate to Main App ✅
```

---

## Detailed Step-by-Step

### Step 1: Generate Ed25519 Keypair

**Function:** `generateSignerKeypair()`

**Location:** `apps/mobile/lib/farcaster/signer.ts`

**What happens:**
1. Uses `@noble/ed25519` to generate a random private key
2. Derives the public key from the private key
3. Converts both to hex strings
4. Returns `{ privateKey: string, publicKey: string }`

**Code:**
```typescript
const { privateKey, publicKey } = await generateSignerKeypair();
// privateKey: "a1b2c3d4..." (64 char hex)
// publicKey: "e5f6g7h8..." (64 char hex)
```

**Why Ed25519?**
- Farcaster's standard for signers
- Fast, secure, small keys
- Works well on mobile devices

---

### Step 2: Create Signed Key Request

**Function:** `createSignedKeyRequest(publicKey)`

**Location:** `apps/mobile/lib/farcaster/signer.ts`

**What happens:**
1. Calls `POST /api/signer` with `{ publicKey }`
2. Web API (`apps/web/app/api/signer/route.ts`):
   - Validates `publicKey` is provided
   - Gets app credentials from env vars:
     - `FARCASTER_APP_FID` - App's Farcaster ID
     - `FARCASTER_APP_MNEMONIC` or `FARCASTER_APP_PRIVATE_KEY`
   - Creates EIP-712 signature using viem
   - Calls Farcaster API: `POST /v2/signed-key-requests`
   - Returns response to mobile

**Response:**
```typescript
{
  token: "abc123...",           // Used for polling
  deeplinkUrl: "farcaster://...", // Deep link to Farcaster app
  key: "0x...",                 // Public key (hex with 0x prefix)
  state: "pending_approval",    // Initial state
  requestFid: 12345            // App's FID
}
```

**Implementation Details:**
- Uses shared API client (`apiPost`) if configured
- Falls back to `fetch()` if API not configured
- Handles network errors gracefully
- Returns data directly (no `result` wrapper)

---

### Step 3: Store Signer Locally

**Function:** `storeSigner(signer)`

**Location:** `apps/mobile/lib/farcaster/signer.ts`

**What happens:**
1. Saves signer data to AsyncStorage
2. Key: `'FARCASTER_SIGNER'`
3. Value: JSON stringified signer object

**Stored Data:**
```typescript
{
  privateKey: "a1b2c3d4...",   // Keep secret!
  publicKey: "e5f6g7h8...",
  token: "abc123...",           // For polling
  createdAt: 1707234567890,     // Timestamp
  fid: undefined                // Set after approval
}
```

**Why store locally?**
- Needed for signing casts/reactions later
- Private key must stay on device (never sent to server)
- Allows offline access to stored signer

---

### Step 4: Open Farcaster Deep Link

**Function:** `Linking.openURL(deeplinkUrl)`

**Location:** `apps/mobile/app/index.tsx`

**What happens:**
1. Opens Farcaster app via deep link
2. Deep link format: `farcaster://signed-key-request?token=...`
3. User sees approval screen in Farcaster app
4. User approves or denies the signer request

**Fallback handling:**
- If `farcaster://` doesn't work, tries `https://` version
- Shows error if Farcaster app not installed

**User Experience:**
- App switches to Farcaster
- User approves signer
- User returns to Litecast (or stays in Farcaster)

---

### Step 5: Poll for Approval Status

**Function:** `pollSignerStatus(token, options)`

**Location:** `apps/mobile/lib/farcaster/signer.ts`

**What happens:**
1. Polls `GET /api/signer?token=...` every 2 seconds
2. Web API calls Farcaster: `GET /v2/signed-key-request?token=...`
3. Checks response state:
   - `pending_approval` → Continue polling
   - `approved` or `completed` → Success! ✅
   - `revoked` → Error ❌
4. Times out after 5 minutes

**Polling Logic:**
```typescript
while (Date.now() - startTime < timeout) {
  const status = await pollSignerStatus(token);
  
  if (status.state === 'completed' || status.state === 'approved') {
    return status; // Success!
  }
  
  if (status.state === 'revoked') {
    throw new Error('Signer request was revoked');
  }
  
  await sleep(2000); // Wait 2 seconds
}
```

**Status Response:**
```typescript
{
  token: "abc123...",
  key: "0x...",
  state: "completed",        // or "approved", "pending_approval", "revoked"
  requestFid: 12345,
  userFid: 67890            // User's FID (set when approved)
}
```

**Implementation:**
- Uses shared API client (`apiRequest`) if configured
- Falls back to `fetch()` if needed
- Handles network errors (continues polling)
- Calls `onStatusUpdate` callback for UI updates

---

### Step 6: Update Signer with FID

**Function:** `storeSigner({ ..., fid })`

**Location:** `apps/mobile/app/index.tsx`

**What happens:**
1. Gets `userFid` from completed status
2. Updates stored signer with FID
3. Marks onboarding as seen
4. Navigates to main app

**Final Stored Data:**
```typescript
{
  privateKey: "a1b2c3d4...",
  publicKey: "e5f6g7h8...",
  token: "abc123...",
  fid: 67890,                // ✅ Now set!
  createdAt: 1707234567890
}
```

---

## API Endpoints

### POST `/api/signer`
**Purpose:** Create signed key request

**Request:**
```json
{
  "publicKey": "a1b2c3d4..."
}
```

**Response:**
```json
{
  "token": "abc123...",
  "deeplinkUrl": "farcaster://...",
  "key": "0x...",
  "state": "pending_approval",
  "requestFid": 12345
}
```

**Implementation:** `apps/web/app/api/signer/route.ts`

---

### GET `/api/signer?token=...`
**Purpose:** Poll signer status

**Request:** Query parameter `token`

**Response:**
```json
{
  "token": "abc123...",
  "key": "0x...",
  "state": "completed",
  "requestFid": 12345,
  "userFid": 67890
}
```

**Implementation:** `apps/web/app/api/signer/route.ts`

---

## React Query Hooks (New!)

### `useCreateSigner()`
**Purpose:** Mutation hook for creating signed key request

**Usage:**
```typescript
const createSigner = useCreateSigner();

const handleCreate = async () => {
  const { privateKey, publicKey } = await generateSignerKeypair();
  const result = await createSigner.mutateAsync(publicKey);
  // result: SignedKeyRequestResponse
};
```

**Location:** `packages/hooks/src/queries/useSigner.ts`

---

### `useSignerStatus(token)`
**Purpose:** Query hook for polling signer status

**Usage:**
```typescript
const { data, isLoading } = useSignerStatus(token, {
  enabled: !!token,
  refetchInterval: 2000, // Poll every 2 seconds
});

// data: SignerStatusResponse | undefined
// Automatically refetches until completed
```

**Location:** `packages/hooks/src/queries/useSigner.ts`

---

## Error Handling

### Network Errors
- **Symptom:** Cannot reach API server
- **Handling:** Shows helpful error message with troubleshooting steps
- **Recovery:** User can retry

### Revoked Signer
- **Symptom:** User denies signer in Farcaster app
- **Handling:** Throws error "Signer request was revoked"
- **Recovery:** User must start over

### Timeout
- **Symptom:** User doesn't approve within 5 minutes
- **Handling:** Throws error "Polling timeout: signer approval took too long"
- **Recovery:** User can retry

### Missing Credentials
- **Symptom:** `FARCASTER_APP_FID` or `FARCASTER_APP_MNEMONIC` not set
- **Handling:** API returns 500 error
- **Recovery:** Admin must configure env vars

---

## Security Considerations

### ✅ What's Secure
- Private key never leaves device
- Private key stored in AsyncStorage (encrypted on iOS/Android)
- EIP-712 signature ensures request authenticity
- Token-based polling prevents replay attacks

### ⚠️ What to Watch
- Private key in AsyncStorage (could be extracted from device)
- Deep link could be intercepted (mitigated by token)
- API credentials in env vars (keep secret!)

---

## Future Improvements

### Potential Enhancements
1. **Use React Query hooks in UI** - Replace direct function calls
2. **Add retry logic** - Auto-retry on network errors
3. **Better error messages** - More specific error types
4. **Progress indicators** - Show polling status in UI
5. **Biometric auth** - Protect stored signer with Face ID/Touch ID

---

## Code Locations

### Mobile Implementation
- **Signer functions:** `apps/mobile/lib/farcaster/signer.ts`
- **UI flow:** `apps/mobile/app/index.tsx`
- **Types:** `packages/types/src/farcaster/signer.ts`

### Web API
- **API routes:** `apps/web/app/api/signer/route.ts`
- **Environment vars:** `.env` (root)

### React Query Hooks
- **Hooks:** `packages/hooks/src/queries/useSigner.ts`
- **API client:** `packages/hooks/src/api/client.ts`
- **Endpoints:** `packages/hooks/src/api/endpoints.ts`

---

## Litecast session: SIWF identity + optional signer (writes)

Litecast separates **who you are** from **whether this device can post**:

1. **Sign in with Farcaster (AuthKit)** — web stores `identity` (FID, username, pfp) in `localStorage` under `litecast.session.v2` (`LITECAST_SESSION_KEY`). Mobile may derive identity from the approved signer FID until a dedicated SIWF flow is added.
2. **App signer (signed-key request)** — same as this document: Ed25519 keypair, `POST /api/signer`, Warpcast approval, poll until approved. The approved signer is merged into the same session object as `signer` (`StoredSigner`).
3. **`canWrite`** — posting and reactions require `session.identity.fid === session.signer.fid` (and an approved signer with keys). If the user signs in as FID A but approves the key in Warpcast as FID B, the app blocks writes with a clear error.
4. **Publishing** — the client builds a signed Farcaster protocol `Message` with `@farcaster/core` (see `packages/farcaster-messages`) and sends `{ message }` to `POST /api/write/cast` or `POST /api/write/reaction`. The web API calls Neynar `publishMessageToFarcaster` (no `signer_uuid`).

Env for AuthKit on web: `NEXT_PUBLIC_APP_DOMAIN`, optional `NEXT_PUBLIC_FARCASTER_RELAY_URL` (see `.env.example`).

---

**Last Updated:** April 12, 2026  
**Status:** ✅ All fixes complete, flow documented
