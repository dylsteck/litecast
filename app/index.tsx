import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, SafeAreaView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import homepageHeader from '../assets/images/homepage-header.png';
import { useRouter } from 'expo-router';
import { generateJWT, storeJWT, getJWT } from '../utils/auth';
import { BlurView } from 'expo-blur';

export default function IndexScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getJWT();
    if (token) {
      router.push('/(tabs)');
    } else {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const token = generateJWT();
      await storeJWT(token);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.homepageHeader} source={homepageHeader} resizeMode="contain" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Litecast</Text>
        <Text style={styles.subtitle}>A beautiful yet simple Farcaster client</Text>
        <BlurView
          intensity={80}
          tint="light"
          style={styles.glassButton}
        >
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Continue</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'white',
    color: 'black'
  },
  textContainer: {
    marginTop: '20%',
    paddingLeft: '10%',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 40,
    fontWeight: '400',
    color: 'black'
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
    marginBottom: 30,
  },
  homepageHeader: {
    width: '100%', 
    height: undefined,
    aspectRatio: 2150 / 200,
  },
  glassButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#8B5CF6',
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});