import React from 'react';
import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { SystemColors } from '../constants/Colors';

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
      <TouchableOpacity 
        style={styles.touchable}
        activeOpacity={0.8}
      >
        <View style={[styles.avatarContainer, { width: size, height: size }]}>
          <Image 
            source={{ uri: pfpUrl }} 
            style={[
              styles.avatar,
              { width: size, height: size, borderRadius: size / 2 }
            ]} 
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginRight: 12,
  },
  avatarContainer: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  avatar: {
    backgroundColor: SystemColors.secondaryBackground,
  },
});

