import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Polyfill crypto.getRandomValues for React Native
if (Platform.OS !== 'web' && typeof global.crypto === 'undefined') {
  (global as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      // Use expo-crypto's getRandomBytes
      const randomBytes = Crypto.getRandomBytes(arr.length);
      arr.set(randomBytes);
      return arr;
    },
    subtle: {
      digest: async (algorithm: string, data: Uint8Array) => {
        // Polyfill for crypto.subtle.digest using SHA-512
        if (algorithm === 'SHA-512') {
          return sha512(data);
        }
        throw new Error(`Unsupported algorithm: ${algorithm}`);
      },
    },
  };
}

// Set up SHA-512 for ed25519
ed25519.etc.sha512Sync = (...messages: Uint8Array[]) => {
  const combined = new Uint8Array(messages.reduce((acc, m) => acc + m.length, 0));
  let offset = 0;
  for (const msg of messages) {
    combined.set(msg, offset);
    offset += msg.length;
  }
  return sha512(combined);
};

ed25519.etc.sha512Async = async (...messages: Uint8Array[]) => {
  return Promise.resolve(ed25519.etc.sha512Sync!(...messages));
};

// API base URL - use litecast.xyz for all platforms
// This ensures API routes work in dev, production, and on native
const API_ORIGIN = 'https://litecast.xyz';

const getApiUrl = (path: string) => {
  // If EXPO_PUBLIC_API_URL is set, use it (override)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return `${process.env.EXPO_PUBLIC_API_URL}${path}`;
  }
  
  // On web in development, use current origin for local testing
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}${path}`;
  }
  
  // For production web and all native platforms, use litecast.xyz
  return `${API_ORIGIN}${path}`;
};

const STORAGE_KEYS = {
  SIGNER: 'FARCASTER_SIGNER',
  HAS_SEEN_ONBOARDING: 'HAS_SEEN_ONBOARDING',
};

export interface StoredSigner {
  privateKey: string;      // hex-encoded Ed25519 private key
  publicKey: string;       // hex-encoded Ed25519 public key
  fid?: number;            // user's Farcaster ID (set after approval)
  token?: string;          // token for polling status
  createdAt: number;       // timestamp
}

export interface SignedKeyRequestResponse {
  token: string;
  deeplinkUrl: string;
  key: string;            // public key
  state: 'generated' | 'pending_approval' | 'approved' | 'completed' | 'revoked';
  requestFid?: number;
}

export interface SignerStatusResponse {
  token: string;
  key: string;
  state: 'generated' | 'pending_approval' | 'approved' | 'completed' | 'revoked';
  requestFid?: number;
  userFid?: number;
}

/**
 * Convert Uint8Array to hex string (React Native compatible)
 */
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a new Ed25519 keypair for Farcaster signer
 */
export async function generateSignerKeypair(): Promise<{ privateKey: string; publicKey: string }> {
  const privateKeyBytes = ed25519.utils.randomPrivateKey();
  const publicKeyBytes = await ed25519.getPublicKeyAsync(privateKeyBytes);
  
  return {
    privateKey: uint8ArrayToHex(privateKeyBytes),
    publicKey: uint8ArrayToHex(publicKeyBytes),
  };
}

/**
 * Create a signed key request via our API (which handles the app signature)
 */
export async function createSignedKeyRequest(
  publicKey: string
): Promise<SignedKeyRequestResponse> {
  const apiUrl = getApiUrl('/api/signer');
  console.log('[Signer] Calling API:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicKey }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Failed to create signed key request: ${response.status}`;
      console.error('[Signer] API error:', errorMessage, errorData);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('[Signer] API response:', data);
    
    // The Farcaster API returns the response wrapped in a 'result' object
    return data.result || data;
  } catch (error: any) {
    console.error('[Signer] Fetch error:', error);
    console.error('[Signer] API URL attempted:', apiUrl);
    console.error('[Signer] Platform:', Platform.OS);
    
    // Provide more helpful error message
    if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
      const helpfulMessage = Platform.OS === 'web' 
        ? `Cannot reach API server at ${apiUrl}. On web, make sure Expo Router API routes are enabled and the server is running. Also ensure FARCASTER_APP_FID and FARCASTER_APP_MNEMONIC are set in your .env file.`
        : `Cannot reach API server at ${apiUrl}. Make sure the server is running and FARCASTER_APP_FID and FARCASTER_APP_MNEMONIC are set.`;
      throw new Error(helpfulMessage);
    }
    throw error;
  }
}

/**
 * Poll for signer status until completed or timeout
 */
export async function pollSignerStatus(
  token: string,
  options: { 
    interval?: number; 
    timeout?: number;
    onStatusUpdate?: (status: SignerStatusResponse) => void;
  } = {}
): Promise<SignerStatusResponse> {
  const { interval = 2000, timeout = 300000, onStatusUpdate } = options; // 2s interval, 5min timeout
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(getApiUrl(`/api/signer?token=${encodeURIComponent(token)}`));
      
      if (!response.ok) {
        throw new Error(`Failed to poll status: ${response.status}`);
      }
      
      const data = await response.json();
      // The Farcaster API returns the response wrapped in a 'result' object
      const status: SignerStatusResponse = data.result || data;
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      if (status.state === 'completed' || status.state === 'approved') {
        return status;
      }
      
      if (status.state === 'revoked') {
        throw new Error('Signer request was revoked');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      // If it's a network error, continue polling
      if (error instanceof TypeError) {
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Polling timeout: signer approval took too long');
}

/**
 * Store signer in AsyncStorage
 */
export async function storeSigner(signer: StoredSigner): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SIGNER, JSON.stringify(signer));
  } catch (error) {
    console.error('Error storing signer:', error);
    throw error;
  }
}

/**
 * Retrieve signer from AsyncStorage
 */
export async function getStoredSigner(): Promise<StoredSigner | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SIGNER);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving signer:', error);
    return null;
  }
}

/**
 * Remove signer from storage (logout/disconnect)
 */
export async function removeStoredSigner(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SIGNER);
  } catch (error) {
    console.error('Error removing signer:', error);
    throw error;
  }
}

/**
 * Check if user has seen onboarding
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as seen
 */
export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
  } catch (error) {
    console.error('Error marking onboarding as seen:', error);
    throw error;
  }
}

/**
 * Check if user has an active signer
 */
export async function hasActiveSigner(): Promise<boolean> {
  const signer = await getStoredSigner();
  return signer !== null && !!signer.privateKey && !!signer.publicKey;
}
