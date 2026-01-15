import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NeynarFrameEmbed } from '../lib/neynar/types';
import { SystemColors } from '../constants/Colors';

interface FrameEmbedProps {
  frame: NeynarFrameEmbed;
}

const FrameEmbed = ({ frame }: FrameEmbedProps) => {
  const handlePress = async () => {
    if (frame.url || frame.frames_url) {
      const url = frame.frames_url || frame.url;
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        }
      }
    }
  };

  const frameImage = frame.image;
  const frameTitle = frame.title;
  
  // Get button info from frame (Farcaster Mini App spec)
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
          {/* Bottom bar with app name and button - per Mini App spec */}
          <View style={styles.bottomBar}>
            <View style={styles.appInfo}>
              <Ionicons name="cube" size={14} color={SystemColors.secondaryLabel} />
              <Text style={styles.appName} numberOfLines={1}>
                {frameTitle || 'Mini App'}
              </Text>
            </View>
            <View style={styles.launchButton}>
              <Text style={styles.launchButtonText} numberOfLines={1}>
                {buttonTitle.length > 32 ? buttonTitle.substring(0, 32) : buttonTitle}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="cube-outline" size={32} color={SystemColors.secondaryLabel} />
          {frameTitle && (
            <Text style={styles.placeholderTitle}>{frameTitle}</Text>
          )}
          <View style={styles.launchButton}>
            <Text style={styles.launchButtonText}>
              {buttonTitle.length > 32 ? buttonTitle.substring(0, 32) : buttonTitle}
            </Text>
          </View>
        </View>
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
  placeholderTitle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 16,
    fontWeight: '600',
    color: SystemColors.label,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: SystemColors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SystemColors.separator,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  appName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    fontWeight: '500',
    color: SystemColors.secondaryLabel,
    marginLeft: 6,
    letterSpacing: -0.1,
  },
  launchButton: {
    backgroundColor: SystemColors.label,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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

export default FrameEmbed;
