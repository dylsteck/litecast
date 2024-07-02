import React, { useEffect, useState } from 'react'
import {
  Button,
  StyleSheet,
} from 'react-native'
import { Text, View } from 'react-native'
import {
  NeynarSigninButton,
  ISuccessMessage,
} from '@neynar/react-native-signin'
import { router } from 'expo-router'
import { useLogin } from 'farcasterkit-react-native'
import useWarpcastUser from '../hooks/useWarpcastUser'
import axios from 'axios'
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LOCAL_STORAGE_KEYS } from '../constants/Farcaster'
import { API_URL, COMPUTER_IP_ADDRESS } from '../constants'

export default function SignInWithNeynar() {
  const { farcasterUser, setFarcasterUser } = useLogin()
  const [signerUuid, setSignerUuid] = useState<string | null>(null)
  const [fid, setFid] = useState<number | null>(null)
  const { user: warpcastUser, loading, error } = useWarpcastUser(fid)
  const neynarApiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY
  const neynarClientId = process.env.EXPO_PUBLIC_NEYNAR_CLIENT_ID

  useEffect(() => {
    if (warpcastUser && signerUuid) {
      const farcasterUser = {
        signer_uuid: signerUuid,
        fid: Number(warpcastUser.fid),
        fname: warpcastUser?.username,
        displayName: warpcastUser?.displayName,
        profile: {
          bio: warpcastUser.profile.bio.text,
          location: warpcastUser.profile.location.placeId,
        },
        pfp: warpcastUser.pfp.url,
        followerCount: warpcastUser?.followerCount,
        followingCount: warpcastUser?.followingCount,
      }
      AsyncStorage.setItem(
        LOCAL_STORAGE_KEYS.FARCASTER_USER,
        JSON.stringify(farcasterUser),
      )
      setFarcasterUser(farcasterUser)
      router.push(`/(tabs)/channel?type=channel&fid=${farcasterUser?.fid ?? 404104}` as any)
    }
  }, [warpcastUser])

  const handleSignin = async (data: ISuccessMessage) => {
    setFid(Number(data.fid))
    setSignerUuid(data.signer_uuid)
  }

  const handleError = (err: Error) => {
    console.log(err)
  }
  const fetchAuthorizationUrl = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-auth-url`)
      const data = res.data
      return data.authorization_url
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View style={styles.container}>
      <NeynarSigninButton
        fetchAuthorizationUrl={fetchAuthorizationUrl}
        successCallback={handleSignin}
        errorCallback={handleError}
        redirectUrl={Linking.createURL('/')}
        buttonStyles={styles.neynarSignInBtn}
        paddingVertical={0}
        paddingHorizontal={0}
        width={150}
      />
      {/* <Button title="Sign in with Neynar" onPress={() => {
        setFid(404104)
        setSignerUuid('0x0')
        const farcasterUser = {
          signer_uuid: '0x0',
          fid: 404104,
          fname: "deveshb15",
          displayName: "Devesh",
          profile: {
            bio: "I love code",
            location: "India",
          },
          pfp: "https://i.ibb.co/XZvby1R/Arie-icon.png",
          followerCount: 3124,
          followingCount: 31,
        }
        AsyncStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(farcasterUser),
        )
        setFarcasterUser(farcasterUser)
        router.push(`/(tabs)/channel?type=channel&fid=${farcasterUser?.fid ?? 404104}` as any)
      }} /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: 0,
    height: 'auto',
    minHeight: '10%',
    right: '5%',
  },
  neynarSignInBtn: {
    marginRight: '20%',
  },
})
