import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { API_URL } from '../constants/Farcaster';
import { useLogin } from '../providers/NeynarProvider';

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
    <View style={styles.container}>
      {pfp && <Image source={{ uri: pfp }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 15,
  },
  image: {
    borderRadius: 15,
    height: 30,
    width: 30,
    zIndex: 1,
  }
});

export default HomeHeaderLeft;
