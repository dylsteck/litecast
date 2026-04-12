'use client';

import { useState } from 'react';
import { buildSignedCastAddJson } from '@litecast/farcaster-messages';
import { usePublishCastMessage } from '@litecast/hooks';
import { useLitecastSession } from './LitecastSessionContext';

export function WebComposeBar() {
  const { session, canWrite } = useLitecastSession();
  const publish = usePublishCastMessage();
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);

  if (!session?.identity?.fid) {
    return null;
  }

  const submit = async () => {
    const t = text.trim();
    if (!t || !canWrite || !session.signer?.fid || !session.signer.privateKey) return;
    setErr(null);
    try {
      const message = await buildSignedCastAddJson({
        fid: session.signer.fid,
        signerPrivateKeyHex: session.signer.privateKey,
        text: t,
      });
      await publish.mutateAsync(message);
      setText('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not publish');
    }
  };

  return (
    <div className="border-t border-system-separator bg-white/90 backdrop-blur-md p-3 sticky bottom-0 z-30">
      {!canWrite ? (
        <p className="text-sm text-system-secondary-label text-center py-2">
          Sign in, then enable posting from your profile to compose casts.
        </p>
      ) : (
        <>
          {err && <p className="text-sm text-red-600 mb-2">{err}</p>}
          <div className="flex gap-2 items-end">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's happening?"
              rows={2}
              className="flex-1 resize-none rounded-xl border border-system-separator px-3 py-2 text-sm text-system-label placeholder:text-system-tertiary-label"
              maxLength={320}
            />
            <button
              type="button"
              disabled={!text.trim() || publish.isPending}
              onClick={submit}
              className="shrink-0 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium disabled:opacity-40"
            >
              {publish.isPending ? '…' : 'Cast'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
