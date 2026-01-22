import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { NeynarEmbed } from '../../lib/neynar/types';
import { SystemColors } from '../../constants/Colors';

interface YouTubeEmbedProps {
  embed: NeynarEmbed;
}

const YouTubeEmbed = ({ embed }: YouTubeEmbedProps) => {
  const url = embed.url || '';
  const title = embed.metadata?.html?.ogTitle || embed.metadata?.title || embed.open_graph?.title;
  const description = embed.metadata?.html?.ogDescription || embed.metadata?.description || embed.open_graph?.description;
  const imageUrl = embed.metadata?.html?.ogImage?.[0]?.url || embed.metadata?.image_url || embed.open_graph?.image_url;
  const siteName = embed.metadata?.html?.ogSiteName || 'YouTube';

  const handlePress = async () => {
    if (url) {
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch (e) {
        console.warn('Failed to open browser:', e);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {imageUrl ? (
        <>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Play button overlay */}
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color={SystemColors.background} />
              </View>
            </View>
          </View>
          {(title || description) && (
            <View style={styles.content}>
              {siteName && (
                <View style={styles.siteInfo}>
                  <Ionicons name="logo-youtube" size={14} color="#FF0000" />
                  <Text style={styles.siteName} numberOfLines={1}>
                    {siteName}
                  </Text>
                </View>
              )}
              {title && (
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
              )}
              {description && (
                <Text style={styles.description} numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="logo-youtube" size={32} color="#FF0000" />
          {title && (
            <Text style={styles.placeholderTitle} numberOfLines={2}>
              {title}
            </Text>
          )}
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
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: SystemColors.separator,
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // Slight offset for play icon
  },
  content: {
    padding: 12,
    backgroundColor: SystemColors.background,
  },
  siteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  siteName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    fontWeight: '500',
    color: SystemColors.secondaryLabel,
    marginLeft: 6,
    letterSpacing: -0.1,
  },
  title: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '600',
    color: SystemColors.label,
    marginBottom: 4,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  description: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    fontWeight: '400',
    color: SystemColors.secondaryLabel,
    lineHeight: 19,
    letterSpacing: -0.1,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 16 / 9,
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
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});

export default YouTubeEmbed;
