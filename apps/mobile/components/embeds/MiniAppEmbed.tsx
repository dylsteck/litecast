import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NeynarFrameEmbed } from '@litecast/types';
import { SystemColors } from '../../constants/Colors';
import { useMiniApp } from '../../context/MiniAppContext';

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
  // Icon from manifest or developer
  iconUrl?: string;
  name?: string;
}

interface MiniAppEmbedProps {
  frame: FrameData;
}

const MiniAppEmbed = ({ frame }: MiniAppEmbedProps) => {
  const { openMiniApp } = useMiniApp();

  const miniappUrl = frame.frames_url || frame.url;
  
  // Extract domain from URL
  const domain = useMemo(() => {
    if (!miniappUrl) return '';
    try {
      return new URL(miniappUrl).hostname;
    } catch {
      return '';
    }
  }, [miniappUrl]);

  // Get app icon - check multiple sources
  const appIconUrl = useMemo(() => {
    return (
      frame.iconUrl ||
      (frame as any).icon_url ||
      frame.manifest?.miniapp?.iconUrl ||
      frame.manifest?.frame?.iconUrl ||
      frame.splashImageUrl || // Splash is often the app icon
      frame.developer?.pfp_url ||
      frame.author?.pfp_url
    );
  }, [frame]);

  // Get app title - prioritize name, then title, then manifest names
  const appTitle = useMemo(() => {
    return (
      frame.name ||
      frame.title ||
      frame.manifest?.miniapp?.name ||
      frame.manifest?.frame?.name
    );
  }, [frame.name, frame.title, frame.manifest]);

  const handlePress = () => {
    if (miniappUrl && domain) {
      openMiniApp({
        url: miniappUrl,
        domain,
        iconUrl: appIconUrl,
        title: appTitle,
        splashImageUrl: frame.splashImageUrl || frame.image,
        splashBackgroundColor: frame.splashBackgroundColor,
      });
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
    backgroundColor: SystemColors.background,
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
