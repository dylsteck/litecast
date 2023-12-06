import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = (
  onAppStateChange: (appState: AppStateStatus) => void,
) => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => subscription.remove();
  }, [onAppStateChange]);
};
