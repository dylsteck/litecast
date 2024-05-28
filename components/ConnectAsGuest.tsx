import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, View } from 'react-native';
import { useNavigation } from 'expo-router';

export default function ConnectAsGuest() {
  const navigation = useNavigation<any>();

  return (
    <View>
      <Pressable onPress={() => navigation.navigate('guest')}>
        <Text style={styles.text}>or View as Guest</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "300"
  }
});