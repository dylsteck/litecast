import { addEventListener } from '@react-native-community/netinfo';
import isBoolean from 'lodash/isBoolean';
import { useEffect } from 'react';

interface UseOnlineManagerProps {
  onConnected?: () => void;
  onDisConnected?: () => void;
}

export const useOnlineManager = (callbacks: UseOnlineManagerProps) => {
  useEffect(
    function navigateToOfflineScreen() {
      const unsubscribe = addEventListener(state => {
        if (isBoolean(state.isConnected)) {
          if (state.isConnected) {
            callbacks.onConnected?.();
          } else {
            callbacks.onDisConnected?.();
          }
        }
      });

      return () => {
        unsubscribe();
      };
    },
    [callbacks],
  );
};
