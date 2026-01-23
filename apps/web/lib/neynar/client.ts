import { NeynarAPIClient } from '@neynar/nodejs-sdk';

let clientInstance: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('NEYNAR_API_KEY not configured');
  }

  clientInstance = new NeynarAPIClient({ apiKey });
  return clientInstance;
}
