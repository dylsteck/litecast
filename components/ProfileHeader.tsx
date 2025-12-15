import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function ProfileHeaderLeft() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome name="chevron-left" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingLeft: 16,
      },
      default: {
        paddingLeft: 16,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
});

