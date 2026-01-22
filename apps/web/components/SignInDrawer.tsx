'use client';

import { useEffect, useState } from 'react';

interface SignInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInDrawer({ isOpen, onClose }: SignInDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready for animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match animation duration
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-drawer-title"
      >
        <div className="bg-white rounded-t-3xl shadow-2xl max-w-[600px] mx-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-system-tertiary-label/40 rounded-full" />
          </div>

          <div className="px-6 pb-10 pt-4">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <FarcasterIcon className="w-8 h-8 text-brand-primary" />
              </div>
            </div>

            {/* Content */}
            <h2
              id="signin-drawer-title"
              className="text-2xl font-bold text-system-label text-center mb-2"
            >
              Sign in to Litecast
            </h2>
            <p className="text-system-secondary-label text-center mb-8">
              Connect your Farcaster account to view notifications, access your profile, and interact with casts.
            </p>

            {/* Sign in button */}
            <button
              className="w-full py-3.5 px-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors mb-3"
              onClick={() => {
                // TODO: Implement sign in flow
                console.log('Sign in clicked');
              }}
            >
              Sign in with Farcaster
            </button>

            {/* Cancel */}
            <button
              className="w-full py-3.5 px-4 text-system-secondary-label font-medium hover:text-system-label transition-colors"
              onClick={onClose}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function FarcasterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1000 1000" fill="currentColor">
      <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
      <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
      <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.939 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
    </svg>
  );
}
