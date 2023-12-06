import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { YStack, Text } from 'tamagui';

import NeynarAuth from '../components/NeynarAuth';
import { API_URL } from '../consants';
import { FarcasterUser, useLogin } from '../providers/NeynarProvider';

export default function Page() {
  const { farcasterUser, setFarcasterUser } = useLogin();

  useEffect(() => {
    (async () => {
      const storedData = await AsyncStorage.getItem('FARCASTER_USER');
      if (storedData) {
        const user: FarcasterUser = JSON.parse(storedData);
        setFarcasterUser(user);
        router.push('/home');
      }
    })();
  }, [setFarcasterUser]);

  useEffect(() => {
    if (farcasterUser && farcasterUser.status === 'pending_approval') {
      console.log(farcasterUser);
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/neynar/signer?signer_uuid=${farcasterUser.signer_uuid}`);
          const updatedUser = await response.json() as FarcasterUser;
          if (updatedUser?.status === 'approved') {
            await AsyncStorage.setItem('FARCASTER_USER', JSON.stringify(updatedUser));
            console.log("USER", updatedUser)
            setFarcasterUser(updatedUser);
            clearInterval(intervalId);
            router.push('/home');
          }
        } catch (error) {
          console.error('Error during polling', error);
        }
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [farcasterUser, setFarcasterUser]);

  return(
    <YStack alignItems="flex-start" justifyContent="flex-start" flex={1} space="$2" paddingLeft={20} paddingTop="30%" backgroundColor="white">
      <Text fontSize="$11" fontFamily="$body">
        Cast
      </Text>
      <Text fontSize="$8" fontFamily="$body" opacity={0.7} paddingBottom={10}>
        A beautiful yet simple Farcaster client
      </Text>
      <NeynarAuth />
    </YStack>
  );
}