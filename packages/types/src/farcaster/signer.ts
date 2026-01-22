export interface StoredSigner {
  privateKey: string;
  publicKey: string;
  fid?: number;
  token?: string;
  createdAt: number;
}

export interface SignedKeyRequestResponse {
  token: string;
  deeplinkUrl: string;
  key: string;
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
