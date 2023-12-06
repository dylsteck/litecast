import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'tamagui';
import { Alert, Image, TouchableOpacity } from 'react-native';
import { useLogin } from '../../../providers/NeynarProvider';
import { API_URL } from '../../../consants';
// import { HomeHeaderRight } from 'ui';

interface FarcasterKitUser {
  fid: string;
  created_at: string;
  custody_address: {
    type: string;
    data: number[];
  };
  pfp: string;
  display: string;
  bio: string;
  url: string | null;
  fname: string;
}

const HomeHeaderLeft = () => {
  const { farcasterUser } = useLogin();
  const [pfp, setPfp] = useState<string>('');

  useEffect(() => {
    (async function fetchPfp() {
      if(farcasterUser !== null) {
        const response = await fetch(`${API_URL}/users/user?fid=${farcasterUser.fid}`);
        const data = await response.json();
        const user = data.user as FarcasterKitUser;
        setPfp(user.pfp);
      }
    })();
  }, [farcasterUser]);
  
  return (
    <View style={{ flexDirection: 'row', paddingBottom: 20, paddingRight: 15, paddingTop: 5 }}>
      {pfp && <Image source={{ uri: pfp }} alt="pfp" style={{ borderRadius: 15, height: 30, width: 30 }} />}
    </View>
  );
};

const HomeHeaderRight = () => {
  const fontSize = 22;
  const opacity = 0.7;

  const handlePress = (section) => {
    if (section !== 'Home') {
      Alert.alert(
        'Coming Soon',
        `${section} section will be available soon.`,
        [{ text: 'Close', onPress: () => console.log('Alert closed')}]
      );
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: 24, paddingBottom: 20, paddingRight: 15, paddingTop: 5,}}>
      <TouchableOpacity onPress={() => handlePress('Home')}>
        <Text style={{ fontSize, fontWeight: 'lighter' }}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('Trending')}>
        <Text style={{ fontSize, opacity, fontWeight: 'lighter' }}>Trending</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('NFTs')}>
        <Text style={{ fontSize, opacity, fontWeight: 'lighter' }}>NFTs</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('/dev')}>
        <Text style={{ fontSize, opacity, fontWeight: 'lighter' }}>/dev</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Layout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack
        screenOptions={{
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerLeft: HomeHeaderLeft,
            headerRight: HomeHeaderRight,
            headerShadowVisible: false,
            title: '',
          }}
        />
        <Stack.Screen
          name="post/[postId]"
          options={{
            title: '',
          }}
        />
      </Stack>
    </>
  );
}
