import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useFonts } from 'expo-font';
import { setNotificationHandler } from 'expo-notifications';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { RecoilRoot } from 'recoil';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig, WithRecoilSync } from 'ui';

import { NeynarProvider } from '../providers/NeynarProvider';
import HomeHeaderLeft from '../components/HomeHeaderLeft';
import HomeHeaderRight from '../components/HomeHeaderRight';

dayjs.locale('ko');
dayjs.extend(duration);

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
  <NeynarProvider>
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme ?? 'light'}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RecoilRoot>
            <WithRecoilSync>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" />
                <Stack.Screen name="setting" />
                <Stack.Screen name="page" 
                options={{ 
                  headerLeft: HomeHeaderLeft,
                  headerRight: HomeHeaderRight,
                  headerShadowVisible: false,
                  title: '', }} 
                />
                <Stack.Screen name="modal" />
              </Stack>
            </WithRecoilSync>
          </RecoilRoot>
        <StatusBar style="light" backgroundColor="#000000" /> 
      </ThemeProvider>
    </TamaguiProvider>
    </NeynarProvider>
  );
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';
