import React, { useEffect, useState } from 'react'
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
import { FarcasterUser, useLogin } from 'farcasterkit-react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useAppContext from '../hooks/useAppContext'
import { LOCAL_STORAGE_KEYS } from '../constants/Farcaster'
import Onboarding from './onboarding'
import AppIntroSlider from "react-native-app-intro-slider";
import { COLORS, SIZES } from '../constants/theme';


const slides = [
  {
    id: 1,
    title: 'Ever feel overwhelmed by your feed?',
    description: 'Take control with CozyCast! ‍♀️.',
    image: require('../assets/images/allFilters.png')
  },
  {
    id: 2,
    title: 'Choose A Tasty Dish',
    description: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"',
    image: require('../assets/images/allFilters.png')

  },
  {
    id: 3,
    title: 'Pick Up The Delivery',
    description: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"',
    image: require('../assets/images/allFilters.png')

  }
]


export default function IndexScreen() {
  const { farcasterUser } = useLogin()
  const { setFid, setFilter, setUser } = useAppContext()
  const [login, setLogin] = useState(false)
  const router = useRouter()
  useEffect(() => {
    if (farcasterUser) {
      router.push('/(tabs)')
    }
  }, [farcasterUser])

  useEffect(() => {
    const getUser = async () => {
      let user = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER)
      if (user) {
        const parsedUser : FarcasterUser = JSON.parse(user)
        setFid(parsedUser?.fid || 404104)
        setUser(parsedUser)
        router.push('/(tabs)')
      }

      let filters = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.FILTERS)
      if (filters) {
        const parsedFilters = JSON.parse(filters)
        setFilter(parsedFilters)
      }
    }
    getUser()
  }, [])

  const buttonLabel = (label: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined) => {
    return(
      <View style={{
        padding: 12
      }}>
        <Text style={{
          color: 'black',
          fontWeight: '600',
          fontSize: 32,
        }}>
          {label}
        </Text>
      </View>
    )
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* <Image style={styles.homepageHeader} source={homepageHeader} resizeMode="contain" /> */}
    
      { !login ?
      <AppIntroSlider
        data={slides}
        renderItem={({item}) => {
          return(
            <View style={{
              flex: 1,
              alignItems: 'center',
              padding: 15,
              paddingTop: 100,
            }}>
              <Image
                source={item.image}
                style={{
                  width: SIZES.width - 80,
                  height: 400,
                }}
                resizeMode="contain"
              />
              <Text style={{
                fontWeight: 'bold',
                color: COLORS.title,
                fontSize: SIZES.h1,
              }}>
                {item.title}
              </Text>
              <Text style={{
                textAlign: 'center',
                paddingTop: 5,
                color: COLORS.title
              }}>
                {item.description}
              </Text>
            </View>
          )
        }}
        activeDotStyle={{
          backgroundColor: COLORS.primary,
          width: 30,
        }}
        showSkipButton
        renderNextButton={() => buttonLabel("Next")}
        renderSkipButton={() => buttonLabel("Skip")}
        renderDoneButton={() => buttonLabel("Done")}
        onDone={() => {
          setLogin(true)
          // setShowHomePage(true);
        }}
      />
 : <>
   <View style={styles.textContainer}>
        <Text style={styles.title}>Cozycast</Text>
        <Text style={styles.subtitle}>
          A beautiful yet simple Farcaster client
        </Text>
        <SignInWithNeynar />
        <ConnectAsGuest />
      </View>
 </>
    }
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
