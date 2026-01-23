import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MiniAppModal } from '../components/MiniAppModal';

interface MiniAppConfig {
  url: string;
  domain: string;
  iconUrl?: string;
  title?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
}

interface MiniAppContextValue {
  /** Open a miniapp */
  openMiniApp: (config: MiniAppConfig) => void;
  /** Close the current miniapp */
  closeMiniApp: () => void;
  /** Whether a miniapp is currently open */
  isOpen: boolean;
  /** Whether the miniapp is minimized */
  isMinimized: boolean;
}

const MiniAppContext = createContext<MiniAppContextValue | null>(null);

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MiniAppConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openMiniApp = useCallback((newConfig: MiniAppConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeMiniApp = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    // Delay clearing config to allow close animation
    setTimeout(() => setConfig(null), 300);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  return (
    <MiniAppContext.Provider value={{ openMiniApp, closeMiniApp, isOpen, isMinimized }}>
      {children}
      {config && (
        <MiniAppModal
          visible={isOpen}
          url={config.url}
          domain={config.domain}
          iconUrl={config.iconUrl}
          title={config.title}
          splashImageUrl={config.splashImageUrl}
          splashBackgroundColor={config.splashBackgroundColor}
          onClose={closeMiniApp}
          onMinimize={handleMinimize}
        />
      )}
    </MiniAppContext.Provider>
  );
}

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error('useMiniApp must be used within a MiniAppProvider');
  }
  return context;
}
