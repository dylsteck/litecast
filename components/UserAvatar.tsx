import React from 'react';
import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

interface UserAvatarProps {
  fid: number;
  pfpUrl: string;
  size?: number;
}

export function UserAvatar({ fid, pfpUrl, size = 40 }: UserAvatarProps) {
  return (
    <Link href={`/profile?fid=${fid}`} asChild>
      <TouchableOpacity style={{ marginRight: 12 }}>
        <Image 
          source={{ uri: pfpUrl }} 
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 }
          ]} 
        />
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f0f0f0',
  },
});

