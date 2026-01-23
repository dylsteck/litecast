/**
 * useMiniAppBridge Hook
 *
 * Provides the bridge between React Native and mini apps running in WebView.
 * Uses @farcaster/miniapp-host-react-native for compatibility with Farcaster mini apps.
 */

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WebView from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  useWebViewRpcEndpoint,
  useExposeWebViewToEndpoint,
} from '@farcaster/miniapp-host-react-native';
import { Context } from '@farcaster/miniapp-core';
import { DEFAULT_FID } from '../../lib/neynar/constants';
import type { MiniAppBridgeResult, UseMiniAppBridgeOptions, SetPrimaryButtonOptions } from './types';

export function useMiniAppBridge(options: UseMiniAppBridgeOptions): MiniAppBridgeResult {
  const { webViewRef, domain, url, onReady, onClose, onPrimaryButtonChange, onMinimize } = options;

  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State
  const [primaryButton, setPrimaryButton] = useState<SetPrimaryButtonOptions | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [backEnabled, setBackEnabled] = useState(false);

  // Use the official Farcaster RPC endpoint hook
  const { endpoint, onMessage } = useWebViewRpcEndpoint(webViewRef, domain);

  // Build context for mini app
  const context = useMemo<Context.MiniAppContext>(() => {
    const miniAppUser: Context.UserContext = {
      fid: DEFAULT_FID,
      displayName: 'Litecast User',
      username: 'litecast',
      pfpUrl: undefined,
    };

    const miniAppClient: Context.ClientContext = {
      platformType: 'mobile',
      clientFid: 0, // Litecast doesn't have an FID
      added: false,
      safeAreaInsets: {
        top: insets.top,
        left: insets.left,
        right: insets.right,
        bottom: insets.bottom,
      },
    };

    return {
      user: miniAppUser,
      client: miniAppClient,
      features: {
        haptics: true,
      },
    };
  }, [insets]);

  // Use refs to always have the latest values available for the SDK methods
  const contextRef = useRef(context);
  contextRef.current = context;

  const urlRef = useRef(url);
  urlRef.current = url;

  // Create the SDK object to expose to mini apps
  const sdk = useMemo(() => {
    return {
      // Context - use getter to always return latest context
      get context() {
        return contextRef.current;
      },

      // Capabilities
      getCapabilities: async () => {
        const capabilities = [
          'actions.ready',
          'actions.close',
          'actions.openUrl',
          'actions.setPrimaryButton',
          'actions.viewProfile',
          'actions.viewCast',
          'actions.updateBackState',
          'haptics.impactOccurred',
          'haptics.notificationOccurred',
          'haptics.selectionChanged',
          'back',
        ];

        return capabilities;
      },

      getChains: async () => {
        return [
          { reference: '1', caip2: 'eip155:1' }, // Ethereum mainnet
        ];
      },

      // Core actions
      ready: async (opts?: { disableNativeGestures?: boolean }) => {
        setIsReady(true);
        onReady?.(opts);
      },

      close: () => {
        onClose?.();
      },

      openUrl: (url: string) => {
        WebBrowser.openBrowserAsync(url).catch((e) => {
          console.warn('Failed to open URL:', e);
        });
      },

      setPrimaryButton: (opts: SetPrimaryButtonOptions) => {
        setPrimaryButton(opts);
        onPrimaryButtonChange?.(opts);
      },

      // Navigation - minimize first, then navigate
      viewProfile: (opts: { fid?: number; username?: string }) => {
        // Minimize the miniapp first
        onMinimize?.();
        // Navigate after a brief delay to allow animation
        setTimeout(() => {
          if (opts.username) {
            router.push(`/${opts.username}`);
          } else if (opts.fid) {
            router.push(`/fids/${opts.fid}`);
          }
        }, 150);
      },

      viewCast: (opts: { hash: string }) => {
        // Minimize the miniapp first
        onMinimize?.();
        // Navigate after a brief delay to allow animation
        setTimeout(() => {
          router.push(`/casts/${opts.hash}`);
        }, 150);
      },

      // Authentication - return rejected_by_user
      signIn: async () => {
        return { error: { type: 'rejected_by_user' } };
      },

      signManifest: async () => {
        return { error: { type: 'rejected_by_user' } };
      },

      // MiniApp management - return rejected_by_user
      addMiniApp: async () => {
        return { error: { type: 'rejected_by_user' } };
      },

      addFrame: async () => {
        return { error: { type: 'rejected_by_user' } };
      },

      // Cast composition - return rejected_by_user
      composeCast: async () => {
        return {};
      },

      // Back state
      updateBackState: (state: { visible: boolean }) => {
        setBackEnabled(state.visible);
      },

      // Haptics
      impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid') => {
        switch (style) {
          case 'light':
          case 'soft':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
          case 'rigid':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        }
      },

      notificationOccurred: (type: 'success' | 'warning' | 'error') => {
        switch (type) {
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      },

      selectionChanged: () => {
        Haptics.selectionAsync();
      },

      // Wallet methods - throw errors
      ethProviderRequest: async () => {
        throw new Error('Ethereum provider not available');
      },

      ethProviderRequestV2: async () => {
        throw new Error('Ethereum provider not available');
      },

      eip6963RequestProvider: () => {
        // No-op
      },

      solanaProviderRequest: async () => {
        throw new Error('Solana provider not available');
      },

      // Token actions - throw errors
      viewToken: () => {
        throw new Error('Token viewing not available');
      },

      sendToken: () => {
        throw new Error('Token sending not available');
      },

      swapToken: () => {
        throw new Error('Token swapping not available');
      },

      // Open another miniapp
      openMiniApp: () => {
        // No-op for now
      },

      // Camera/microphone - stub
      requestCameraAndMicrophoneAccess: async () => {
        return true;
      },
    };
  }, [context, onReady, onClose, onPrimaryButtonChange, onMinimize, router]);

  // Expose SDK via the official Farcaster hook
  useExposeWebViewToEndpoint({
    endpoint,
    sdk: sdk as any,
  });

  // Emit function for events
  const emit = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      const eventData = { event, ...data } as any;
      endpoint?.emit(eventData);
    },
    [endpoint]
  );

  // Trigger back navigation
  const triggerBack = useCallback(() => {
    emit('back_navigation_triggered');
  }, [emit]);

  // Bridge is ready when endpoint is available
  const bridgeReady = !!endpoint;

  return {
    onMessage,
    emit,
    primaryButton,
    isReady,
    backEnabled,
    triggerBack,
    bridgeReady,
  };
}
