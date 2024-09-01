import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { FarcasterUser, NeynarProvider } from 'farcasterkit-react-native'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import AppContext from '../utils/context'
import GuestHeaderLeft from '../components/GuestHeaderLeft'
import HomeHeaderLeft from '../components/HomeHeaderLeft'
import HomeHeaderRight from '../components/HomeHeaderRight'
import React from 'react'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const [fid, setFid] = useState(404104)
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [filterChange, setFilterChange] = useState(false)
  const [filter, setFilter] = useState({
    lowerFid: 0,
    upperFid: Infinity,
    mutedChannels: [],
    showChannels: [],
    isPowerBadgeHolder: false,
  })
  const [tokenFeed, setTokenFeed] = useState([])

  const colorScheme = useColorScheme()
  const neynarApiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY
  const fckitApiUrl = process.env.EXPO_PUBLIC_API_URL

  return (
    <AppContext.Provider value={{ fid, setFid, filter, setFilter, user, setUser, filterChange, setFilterChange, tokenFeed, setTokenFeed }}>
      <NeynarProvider
        apiKey={neynarApiKey as string}
        fcKitApiUrl={fckitApiUrl as string}
      >
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="guest"
              options={{
                headerShown: true,
                headerTitle: () => null,
                headerLeft: HomeHeaderLeft,
                headerRight: HomeHeaderRight,
              }}
            />
          </Stack>
        </ThemeProvider>
      </NeynarProvider>
    </AppContext.Provider>
  )
}
