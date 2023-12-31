import React, { useEffect } from 'react';
import { StyleSheet, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import ConnectWithWarpcast from '../components/ConnectWithWarpcast';
import { Text, View } from '../components/Themed';
import { NeynarProvider, useLogin } from '../providers/NeynarProvider';
import homepageHeader from '../assets/images/homepage-header.png';

export default function IndexScreen() {

  return (
    <NeynarProvider>
      <SafeAreaView style={styles.container}>
        <Image style={styles.homepageHeader} source={homepageHeader} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Litecast</Text>
          <Text style={styles.subtitle}>A beautiful yet simple Farcaster client</Text>
          <ConnectWithWarpcast />
        </View>
      </SafeAreaView>
    </NeynarProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'white',
  },
  textContainer: {
    marginTop: '20%',
    paddingLeft: '10%',
  },
  title: {
    fontSize: 40,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 18,
  },
  homepageHeader: {
    width: '100%', 
    height: undefined, 
    aspectRatio: 2150 / 200,
  },
});