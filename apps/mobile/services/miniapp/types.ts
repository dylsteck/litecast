/**
 * MiniApp SDK Types
 *
 * Defines the interface between Litecast mobile and mini apps running in WebView.
 * Compatible with Farcaster's MiniApp SDK for cross-platform mini apps.
 */

import React from 'react';

export interface SetPrimaryButtonOptions {
  text: string;
  disabled?: boolean;
  hidden?: boolean;
  loading?: boolean;
}

export interface MiniAppBridgeResult {
  /** Handler for WebView messages */
  onMessage: (e: any) => void;
  /** Emit event to mini app */
  emit: (event: string, data?: Record<string, unknown>) => void;
  /** Current primary button state */
  primaryButton: SetPrimaryButtonOptions | null;
  /** Whether the mini app is ready */
  isReady: boolean;
  /** Whether back navigation is enabled */
  backEnabled: boolean;
  /** Trigger back navigation in mini app */
  triggerBack: () => void;
  /** Whether the bridge is ready to receive messages */
  bridgeReady: boolean;
}

export interface UseMiniAppBridgeOptions {
  /** WebView ref */
  webViewRef: React.RefObject<any>;
  /** Domain of the mini app */
  domain: string;
  /** Full URL of the mini app */
  url: string;
  /** Called when mini app signals ready */
  onReady?: (options?: { disableNativeGestures?: boolean }) => void;
  /** Called when mini app requests close */
  onClose?: () => void;
  /** Called when primary button state changes */
  onPrimaryButtonChange?: (options: SetPrimaryButtonOptions | null) => void;
  /** Called when mini app should minimize (e.g., for in-app navigation) */
  onMinimize?: () => void;
}
