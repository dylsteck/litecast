import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { API_URL } from '../constants/Farcaster';
import { Link } from 'expo-router';
import { useLogin } from 'farcasterkit-react-native';

const HomeHeaderLeft = () => {
  const { farcasterUser } = useLogin();

  return (
    <View style={styles.container}>
      {farcasterUser && farcasterUser.pfp && 
      <Link href={`/user?fname=${farcasterUser?.fname}`}>
        <Image source={{ uri: farcasterUser.pfp }} style={styles.image} />
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
