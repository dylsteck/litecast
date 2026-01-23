import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import GuestHeaderLeft from '../components/GuestHeaderLeft';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@litecast/hooks';

// Create a client with optimized settings for prefetching
// Inspired by Base App's prefetching strategy:
// https://blog.base.dev/base-app-prefetching-at-scale
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - keep unused data in cache
      refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
      refetchOnMount: false, // Use cached data if fresh - enables prefetch to work
      refetchOnReconnect: false, // Don't refetch on network reconnect
    },
  },
});

// Configure API base URL
const getApiBaseUrl = () => {
  // If EXPO_PUBLIC_API_URL is set, use it (override)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // On web in development, use current origin for local testing
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return window.location.origin;
  }

  // For production web and all native platforms, use litecast.xyz
  return 'https://litecast.xyz';
};

const apiConfig = {
  baseUrl: getApiBaseUrl(),
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider config={apiConfig}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="guest" options={{ headerShown: true, title: 'Feed', headerTitleStyle: { color: 'black' }, headerLeft: GuestHeaderLeft, headerStyle: { backgroundColor: 'white'} }}/>
          </Stack>
        </ThemeProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
