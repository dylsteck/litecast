import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Pressable, Text } from 'react-native';

// import { API_URL } from '../constants/Farcaster';

import { Link, useNavigation } from 'expo-router';
import { useLogin } from 'farcasterkit-react-native';

const GuestHeaderLeft = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
  }
});

export default GuestHeaderLeft;
