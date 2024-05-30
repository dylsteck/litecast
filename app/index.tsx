import React, { useEffect } from 'react'
import {
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native'
import SignInWithNeynar from '../components/SignInWithNeynar'
import { Text, View } from '../components/Themed'
// import homepageHeader from '../assets/images/homepage-header.png';
import ConnectAsGuest from '../components/ConnectAsGuest'
import { useLogin } from 'farcasterkit-react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function IndexScreen() {
  const { farcasterUser } = useLogin()
  const router = useRouter()
  useEffect(() => {
    if (farcasterUser) {
      router.push('/(tabs)')
    }
  }, [farcasterUser])

  return (
    <SafeAreaView style={styles.container}>
      {/* <Image style={styles.homepageHeader} source={homepageHeader} resizeMode="contain" /> */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Cozycast</Text>
        <Text style={styles.subtitle}>
          A beautiful yet simple Farcaster client
        </Text>
        <SignInWithNeynar />
        <ConnectAsGuest />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'white',
    color: 'black',
  },
  textContainer: {
    marginTop: '20%',
    paddingLeft: '10%',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 40,
    fontWeight: '400',
    color: 'black',
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
  },
  homepageHeader: {
    width: '100%',
    height: undefined,
    aspectRatio: 2150 / 200,
  },
})
