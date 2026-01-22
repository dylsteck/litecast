import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { NeynarFrameEmbed } from '../../lib/neynar/types';
import { SystemColors } from '../../constants/Colors';

// Extended frame type that includes fields from getFrameData
interface FrameData extends Partial<NeynarFrameEmbed> {
  url?: string;
  title?: string;
  image?: string;
  frames_url?: string;
  buttons?: Array<{
    index: number;
    title: string;
    action_type: string;
  }>;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
}

interface MiniAppEmbedProps {
  frame: FrameData;
}

const MiniAppEmbed = ({ frame }: MiniAppEmbedProps) => {
  const handlePress = async () => {
    const url = frame.frames_url || frame.url;
    if (url) {
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch (e) {
        console.warn('Failed to open browser:', e);
      }
    }
  };

  const frameImage = frame.image;
  const buttonTitle = frame.buttons?.[0]?.title || 'Open';

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {frameImage ? (
        <>
          <Image 
            source={{ uri: frameImage }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Full-width button at bottom */}
          <View style={styles.bottomBar}>
            <View style={styles.launchButton}>
              <Text style={styles.launchButtonText} numberOfLines={1}>
                {buttonTitle.length > 32 ? buttonTitle.substring(0, 32) : buttonTitle}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.placeholder}>
            <Ionicons name="cube-outline" size={32} color={SystemColors.secondaryLabel} />
          </View>
          {/* Full-width button at bottom */}
          <View style={styles.bottomBar}>
            <View style={styles.launchButton}>
              <Text style={styles.launchButtonText}>
                {buttonTitle.length > 32 ? buttonTitle.substring(0, 32) : buttonTitle}
              </Text>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: SystemColors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 2, // Farcaster Mini App spec: 3:2 aspect ratio
    backgroundColor: SystemColors.separator,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 3 / 2,
    backgroundColor: SystemColors.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bottomBar: {
    paddingVertical: 0,
    backgroundColor: SystemColors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SystemColors.separator,
  },
  launchButton: {
    backgroundColor: '#1a1a1a', // Slightly lighter than pure black
    paddingVertical: 12,
    borderRadius: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchButtonText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    fontWeight: '600',
    color: SystemColors.background,
    letterSpacing: -0.1,
  },
});

export default MiniAppEmbed;
