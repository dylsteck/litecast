/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import { View , Image } from 'react-native';

import { API_URL } from '../consants';
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
    <View style={{ flexDirection: 'row', paddingBottom: 20, paddingRight: 15, paddingTop: 5, zIndex: 1 }}>
      {pfp && <Image source={{ uri: pfp }} style={{ borderRadius: 15, height: 30, width: 30, zIndex: 1 }} />}
    </View>
  );
};

export default HomeHeaderLeft;
