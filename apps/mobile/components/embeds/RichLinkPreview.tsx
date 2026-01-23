import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { NeynarEmbed } from '@litecast/types';
import { SystemColors } from '../../constants/Colors';
import { getDomain } from './utils';

interface RichLinkPreviewProps {
  embed: NeynarEmbed;
}

const RichLinkPreview = ({ embed }: RichLinkPreviewProps) => {
  const url = embed.url || '';
  const htmlMetadata = embed.metadata?.html;
  
  // Prefer HTML metadata (ogTitle, ogDescription) over direct metadata
  const title = htmlMetadata?.ogTitle || 
    embed.metadata?.title || 
    embed.open_graph?.title;
  
  const description = htmlMetadata?.ogDescription || 
    embed.metadata?.description || 
    embed.open_graph?.description;
  
  const imageUrl = htmlMetadata?.ogImage?.[0]?.url || 
    embed.metadata?.image_url || 
    embed.open_graph?.image_url;
  
  const favicon = htmlMetadata?.favicon;
  const siteName = htmlMetadata?.ogSiteName || embed.metadata?.publisher;
  const domain = url ? getDomain(url) : '';

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
      activeOpacity={0.8}
    >
      {imageUrl && (
        <Image 
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      {(title || description || url) && (
        <View style={styles.content}>
          {(siteName || domain) && (
            <View style={[styles.header, !favicon && styles.headerNoFavicon]}>
              {favicon && (
                <Image 
                  source={{ uri: favicon.startsWith('//') ? `https:${favicon}` : favicon }}
                  style={styles.favicon}
                />
              )}
              <Text style={styles.publisher} numberOfLines={1}>
                {siteName || domain}
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
    minHeight: 100,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: SystemColors.separator,
  },
  content: {
    padding: 12,
    backgroundColor: SystemColors.background,
    minHeight: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerNoFavicon: {
    marginLeft: 0,
  },
  favicon: {
    width: 14,
    height: 14,
    marginRight: 6,
    borderRadius: 2,
  },
  publisher: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    fontWeight: '500',
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
    textTransform: 'uppercase',
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
});

export default RichLinkPreview;
