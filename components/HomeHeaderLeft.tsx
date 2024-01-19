import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { API_URL } from '../constants/Farcaster';
// import { useLogin } from '../providers/NeynarProvider';
import { Link } from 'expo-router';
import { useLogin } from 'farcasterkit-react-native';

export type WarpcastUserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
    verified: boolean;
  };
  profile: {
    bio: {
      text: string;
      mentions: string[];
      channelMentions: any[];
    };
    location: {
      placeId: string;
      description: string;
    };
  };
  followerCount: number;
  followingCount: number;
  activeOnFcNetwork: boolean;
  referrerUsername: string;
  viewerContext: {
    following: boolean;
    followedBy: boolean;
    canSendDirectCasts: boolean;
    hasUploadedInboxKeys: boolean;
  };
  inviterIsReferrer: boolean;
  collectionsOwned: any[];
  extras: {
    fid: number;
    custodyAddress: string;
  };
};

export type WarpcastUserProfileResponse = {
  result: {
    user: WarpcastUserProfile
  }
};

const HomeHeaderLeft = () => {
  const { farcasterUser } = useLogin();
  const [warpcastUser, setWarpcastUser] = useState<WarpcastUserProfile | null>(null);

  useEffect(() => {
    (async function fetchWarpcastUser() {
      if(farcasterUser !== null) {
        const response = await fetch(`https://client.warpcast.com/v2/user?fid=${farcasterUser.fid}`);
        const data = await response.json() as WarpcastUserProfileResponse;
        const user = data.result.user;
        setWarpcastUser(user);
      }
    })();
  }, [farcasterUser]);
  
  return (
    <View style={styles.container}>
      {warpcastUser && warpcastUser.pfp && 
      <Link href={`/user?fname=${warpcastUser?.username}`}>
        <Image source={{ uri: warpcastUser.pfp.url }} style={styles.image} />
      </Link>
      }
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
