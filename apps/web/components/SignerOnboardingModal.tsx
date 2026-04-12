'use client';

import { useCallback, useState } from 'react';
import { QRCode } from '@farcaster/auth-kit';
import { useLitecastSession } from './LitecastSessionContext';
import { generateSignerKeypairWeb } from '../lib/farcaster/generateKeypair';
import { createSignedKeyRequestWeb, pollSignerStatusWeb } from '../lib/farcaster/signerRequest';
import type { StoredSigner } from '@litecast/types';

type Phase = 'idle' | 'working' | 'waiting' | 'done' | 'error';

export function SignerOnboardingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { session, mergeSigner } = useLitecastSession();
  const [phase, setPhase] = useState<Phase>('idle');
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (!session?.identity?.fid) {
      setError('Sign in with Farcaster first.');
      setPhase('error');
      return;
    }
    setError(null);
    setPhase('working');
    try {
      const { privateKey, publicKey } = await generateSignerKeypairWeb();
      const signed = await createSignedKeyRequestWeb(publicKey);
      const { token, deeplinkUrl } = signed;
      const partial: StoredSigner = {
        privateKey,
        publicKey,
        token,
        createdAt: Date.now(),
      };
      mergeSigner(partial);
      setApprovalUrl(deeplinkUrl);
      setPhase('waiting');
      const st = await pollSignerStatusWeb(token);
      const userFid = st.userFid;
      if (userFid == null) {
        throw new Error('Approval finished without user FID');
      }
      if (userFid !== session.identity.fid) {
        mergeSigner(null);
        throw new Error(
          'Warpcast account does not match your signed-in Farcaster user. Use the same account in Warpcast.'
        );
      }
      mergeSigner({
        ...partial,
        fid: userFid,
      });
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signer setup failed');
      setPhase('error');
    }
  }, [mergeSigner, session?.identity?.fid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-system-label mb-2">Enable posting</h2>
        <p className="text-sm text-system-secondary-label mb-4">
          Litecast will open Warpcast so you can approve this app&apos;s signer. Your private key stays
          on this device.
        </p>

        {phase === 'idle' && (
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white font-medium"
              onClick={start}
            >
              Continue
            </button>
            <button type="button" className="px-4 py-2.5 text-system-secondary-label" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}

        {(phase === 'working' || phase === 'waiting') && approvalUrl && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-center text-system-secondary-label">
              Scan with Warpcast or open the link on your phone.
            </p>
            <div className="p-3 bg-white rounded-xl border border-system-separator">
              <QRCode uri={approvalUrl} size={200} />
            </div>
            <a
              href={approvalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand-primary underline"
            >
              Open approval link
            </a>
            {phase === 'waiting' && (
              <p className="text-sm text-system-secondary-label">Waiting for approval in Warpcast…</p>
            )}
          </div>
        )}

        {phase === 'working' && !approvalUrl && (
          <p className="text-sm text-system-secondary-label">Creating signer request…</p>
        )}

        {phase === 'done' && (
          <div>
            <p className="text-green-600 text-sm mb-4">You can post and react now.</p>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-medium"
              onClick={() => {
                setPhase('idle');
                setApprovalUrl(null);
                onClose();
              }}
            >
              Done
            </button>
          </div>
        )}

        {phase === 'error' && error && (
          <div>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-system-secondary-background font-medium"
                onClick={() => {
                  setPhase('idle');
                  setApprovalUrl(null);
                  setError(null);
                }}
              >
                Try again
              </button>
              <button type="button" className="px-4 py-2.5 text-system-secondary-label" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
