import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import type {
  StoredSigner,
  SignedKeyRequestResponse,
  SignerStatusResponse,
} from '@litecast/types';
import { apiPost, apiRequest, getApiConfig, configureApi, API_ENDPOINTS } from '@litecast/hooks';

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

// API base URL - only use production in non-dev mode
const API_ORIGIN_PROD = 'https://litecast.xyz';
const API_ORIGIN_DEV = 'http://localhost:3000';

const getApiUrl = (path: string) => {
  // If EXPO_PUBLIC_API_URL is set, use it (override)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return `${process.env.EXPO_PUBLIC_API_URL}${path}`;
  }
  
  // On web in development, use current origin for local testing
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}${path}`;
  }
  
  // In development mode, prefer localhost (don't hit production)
  if (__DEV__) {
    // iOS Simulator can use localhost directly
    if (Platform.OS === 'ios') {
      return `${API_ORIGIN_DEV}${path}`;
    }
    // Android emulator uses 10.0.2.2 for localhost
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:3000${path}`;
    }
    // Default to localhost for dev
    return `${API_ORIGIN_DEV}${path}`;
  }
  
  // Production mode - use production API
  return `${API_ORIGIN_PROD}${path}`;
};

const STORAGE_KEYS = {
  SIGNER: 'FARCASTER_SIGNER',
  HAS_SEEN_ONBOARDING: 'HAS_SEEN_ONBOARDING',
};

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
  publicKey: string,
  options?: { retryWithProduction?: boolean }
): Promise<SignedKeyRequestResponse> {
  const retryWithProduction = options?.retryWithProduction ?? true;
  
  try {
    // Try to use shared API client if configured, otherwise fall back to fetch
    const apiConfig = getApiConfig();
    let data: SignedKeyRequestResponse;
    
    if (apiConfig.baseUrl) {
      // Use shared API client
      try {
        data = await apiPost<SignedKeyRequestResponse>(
          API_ENDPOINTS.SIGNER,
          { publicKey }
        );
      } catch (apiError: any) {
        // If it's a network error and we're using localhost in dev mode, retry with production
        const isDev = __DEV__;
        const isLocalhost = apiConfig.baseUrl.includes('localhost') || apiConfig.baseUrl.includes('10.0.2.2');
        const isNetworkError = !apiError.status || apiError.message?.includes('Network request failed') || apiError.message?.includes('Failed to fetch');
        
        if (isDev && isLocalhost && isNetworkError && retryWithProduction) {
          console.log('[Signer] Local dev server unreachable via API client, retrying with production...');
          // Temporarily configure API to use production
          const originalBaseUrl = apiConfig.baseUrl;
          configureApi({ baseUrl: API_ORIGIN_PROD });
          try {
            data = await apiPost<SignedKeyRequestResponse>(
              API_ENDPOINTS.SIGNER,
              { publicKey }
            );
            console.log('[Signer] Production API response:', data);
            // Restore original config
            configureApi({ baseUrl: originalBaseUrl });
            return data;
          } catch (prodError: any) {
            // Restore original config before rethrowing
            configureApi({ baseUrl: originalBaseUrl });
            throw apiError; // Throw original error, not production error
          }
        }
        throw apiError;
      }
    } else {
      // Fallback to fetch with full URL
      const apiUrl = getApiUrl(API_ENDPOINTS.SIGNER);
      console.log('[Signer] Calling API:', apiUrl);
      
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
      
      data = await response.json();
    }
    
    console.log('[Signer] API response:', data);
    
    // The API returns the response directly (no 'result' wrapper)
    return data;
  } catch (error: any) {
    console.error('[Signer] ===== ERROR DETAILS =====');
    console.error('[Signer] Error object:', error);
    console.error('[Signer] Error message:', error.message);
    console.error('[Signer] Error status:', error.status);
    console.error('[Signer] Error data:', JSON.stringify(error.data, null, 2));
    console.error('[Signer] Error type:', typeof error);
    console.error('[Signer] Has status?', !!error.status);
    console.error('[Signer] Platform:', Platform.OS);
    console.error('[Signer] API URL:', getApiUrl(API_ENDPOINTS.SIGNER));
    console.error('[Signer] =========================');
    
    // Extract actual error message from API response FIRST (before checking error type)
    let errorMessage = error.message || 'Failed to create signed key request';
    
    // If error has data property (from apiPost), extract the actual error message
    if (error.data) {
      // Try to extract error message from various possible structures
      if (typeof error.data === 'string') {
        try {
          const parsed = JSON.parse(error.data);
          if (parsed.error) {
            errorMessage = parsed.error;
          }
        } catch {
          // Not JSON, use as-is
          errorMessage = error.data;
        }
      } else if (typeof error.data === 'object') {
        const apiError = error.data as { error?: string; details?: unknown; message?: string };
        if (apiError.error) {
          errorMessage = apiError.error;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
        // Include details if available
        if (apiError.details) {
          console.error('[Signer] Error details:', apiError.details);
          // If details is an object with error message, use it
          if (typeof apiError.details === 'object' && 'error' in apiError.details) {
            errorMessage = String((apiError.details as any).error);
          }
        }
      }
    }
    
    // Check for HTTP status errors FIRST (before network errors)
    // This handles 500, 400, 401, etc. from the API server
    if (error.status && typeof error.status === 'number') {
      const apiUrl = getApiUrl(API_ENDPOINTS.SIGNER);
      const isDev = __DEV__;
      const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('10.0.2.2');
      
      // 500 errors - server configuration issue
      if (error.status === 500) {
        const troubleshooting = Platform.OS === 'web'
          ? `\n\nTroubleshooting:\n1. Make sure the web server is running (pnpm dev:web)\n2. Check that FARCASTER_APP_FID and FARCASTER_APP_MNEMONIC are set in .env\n3. Check server logs for detailed error`
          : `\n\nTroubleshooting:\n1. Make sure the web server is running (pnpm dev:web in another terminal)\n2. Check that FARCASTER_APP_FID and FARCASTER_APP_MNEMONIC are set in .env\n3. For local dev, set EXPO_PUBLIC_API_URL=http://localhost:3000\n4. Check server logs for detailed error`;
        
        // If we have a meaningful error message (not just "API error: 500"), show it
        if (errorMessage && !errorMessage.includes('API error: 500')) {
          throw new Error(`${errorMessage}${troubleshooting}`);
        } else {
          // Generic 500 error - show troubleshooting
          throw new Error(`Server error (500). The API server returned an error.${troubleshooting}`);
        }
      }
      
      // Other HTTP errors (400, 401, 403, 404, etc.)
      throw new Error(`API error (${error.status}): ${errorMessage}`);
    }
    
    // Check for network errors (no status code = network issue)
    if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch') || error.message?.includes('API base URL not configured') || !error.status) {
      const apiUrl = getApiUrl(API_ENDPOINTS.SIGNER);
      const isDev = __DEV__;
      const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('10.0.2.2');
      let triedProduction = false;
      
      // In dev mode, if we tried localhost and it failed, retry with production
      if (isDev && isLocalhost && retryWithProduction && !apiUrl.includes('litecast.xyz')) {
        console.log('[Signer] Local dev server unreachable, retrying with production...');
        triedProduction = true;
        try {
          // Temporarily override to use production
          const prodUrl = `${API_ORIGIN_PROD}${API_ENDPOINTS.SIGNER}`;
          console.log('[Signer] Retrying with production API:', prodUrl);
          
          const response = await fetch(prodUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicKey }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `Failed to create signed key request: ${response.status}`;
            throw new Error(errorMessage);
          }
          
          const data = await response.json();
          console.log('[Signer] Production API response:', data);
          return data;
        } catch (prodError: any) {
          // Production also failed, fall through to show original error
          console.error('[Signer] Production API also failed:', prodError);
          // Continue to show the original localhost error message
        }
      }
      
      let helpfulMessage: string;
      if (Platform.OS === 'web') {
        helpfulMessage = `Cannot reach API server at ${apiUrl}. On web, make sure Expo Router API routes are enabled and the server is running. Also ensure FARCASTER_APP_FID and FARCASTER_APP_MNEMONIC are set in your .env file.`;
      } else if (isDev && isLocalhost) {
        helpfulMessage = `Cannot reach local development server at ${apiUrl}.\n\nMake sure:\n1. Web server is running: pnpm dev:web (in another terminal)\n2. FARCASTER_APP_FID and FARCASTER_APP_MNEMONIC are set in .env\n3. Server is accessible at ${apiUrl}${triedProduction ? '\n\nNote: Production fallback was attempted but also failed.' : ''}`;
      } else {
        helpfulMessage = `Cannot reach API server at ${apiUrl}. Make sure the server is running and configured correctly.`;
      }
      throw new Error(helpfulMessage);
    }
    
    // Throw error with actual message from API
    throw new Error(errorMessage);
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
  const apiConfig = getApiConfig();
  
  while (Date.now() - startTime < timeout) {
    try {
      let status: SignerStatusResponse;
      
      if (apiConfig.baseUrl) {
        // Use shared API client
        status = await apiRequest<SignerStatusResponse>(
          API_ENDPOINTS.SIGNER,
          { token }
        );
      } else {
        // Fallback to fetch with full URL
        const apiUrl = getApiUrl(`${API_ENDPOINTS.SIGNER}?token=${encodeURIComponent(token)}`);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to poll status: ${response.status}`);
        }
        
        const data = await response.json();
        // The API returns the response directly (no 'result' wrapper)
        status = data;
      }
      
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
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('Network request failed'))) {
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
