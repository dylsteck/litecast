import React from 'react';
import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

interface UserAvatarProps {
  fid: number;
  pfpUrl: string;
  username?: string;
  size?: number;
}

export function UserAvatar({ fid, pfpUrl, username, size = 40 }: UserAvatarProps) {
  const href = (username ? `/${username}` : `/fids/${fid}`) as any;
  
  return (
    <Link href={href} asChild>
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

