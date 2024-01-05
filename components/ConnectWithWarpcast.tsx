import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLogin } from '../providers/NeynarProvider';
import { router } from 'expo-router';

export default function ConnectWithWarpcast() {
  const { farcasterUser, handleSignIn, loading } = useLogin();

  useEffect(() => {
    if(farcasterUser){
      router.push('/(tabs)')
    }
  }, [farcasterUser])

  if (!farcasterUser) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleSignIn} disabled={loading} style={styles.button}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>connect with warpcast</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (farcasterUser.status === 'pending_approval' && farcasterUser.signer_approval_url) {
    return (
      <View style={styles.container}>
        <QRCode value={farcasterUser.signer_approval_url} size={200} />
        <TouchableOpacity onPress={() => Linking.openURL(farcasterUser.signer_approval_url ?? '')}>
          <Text style={styles.linkText}>Click here to view the signer URL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`You are logged in as fid ${farcasterUser.fid}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
      marginTop: 20,
      height: 'auto',
      minHeight: '10%',
    },
    button: {
      backgroundColor: '#855DCD',
      color: 'white',
      padding: 15,
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      zIndex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '400',
      color: '#000000',
    },
    linkText: {
      paddingTop: 15,
      color: '#000000', 
      textDecorationLine: 'underline',
    },
  });
  