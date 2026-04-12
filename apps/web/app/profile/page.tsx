'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSignIn } from '@farcaster/auth-kit';
import { useLitecastSession } from '../../components/LitecastSessionContext';
import { SignerOnboardingModal } from '../../components/SignerOnboardingModal';
import { UserAvatar } from '../../components/UserAvatar';

export default function ProfilePage() {
  const { session, canWrite, signOutSession } = useLitecastSession();
  const { signOut: authKitSignOut } = useSignIn({});
  const [showSigner, setShowSigner] = useState(false);

  const handleSignOut = async () => {
    try {
      await authKitSignOut();
    } catch {
      /* ignore */
    }
    signOutSession();
  };

  if (!session?.identity?.fid) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-system-label mb-2">Profile</h1>
        <p className="text-system-secondary-label mb-4">Sign in from the home tab to view your profile.</p>
        <Link href="/" className="text-brand-primary font-medium">
          Back home
        </Link>
      </div>
    );
  }

  const u = session.identity;

  return (
    <div className="p-6 pb-28">
      <div className="flex items-center gap-4 mb-6">
        <UserAvatar
          username={u.username ?? 'user'}
          pfpUrl={
            u.pfpUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || u.username || 'FC')}&size=128`
          }
          size="lg"
          linked={false}
        />
        <div>
          <h1 className="text-xl font-semibold text-system-label">{u.displayName || u.username}</h1>
          {u.username && (
            <p className="text-system-secondary-label">@{u.username}</p>
          )}
          <p className="text-sm text-system-tertiary-label mt-1">FID {u.fid}</p>
        </div>
      </div>

      <div className="space-y-3">
        {canWrite ? (
          <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">Posting is enabled.</p>
        ) : (
          <button
            type="button"
            onClick={() => setShowSigner(true)}
            className="w-full py-3 rounded-xl bg-brand-primary text-white font-medium"
          >
            Enable posting
          </button>
        )}

        {u.username && (
          <Link
            href={`/${u.username}`}
            className="block w-full py-3 text-center rounded-xl border border-system-separator font-medium text-system-label"
          >
            View full profile
          </Link>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3 text-center rounded-xl text-red-600 font-medium"
        >
          Sign out
        </button>
      </div>

      <SignerOnboardingModal isOpen={showSigner} onClose={() => setShowSigner(false)} />
    </div>
  );
}
