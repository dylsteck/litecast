import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform, Linking } from 'react-native';
import { NeynarEmbedMetadata } from '../lib/neynar/types';
import { SystemColors } from '../constants/Colors';

interface EmbedPreviewProps {
  metadata: NeynarEmbedMetadata;
}

const EmbedPreview = ({ metadata }: EmbedPreviewProps) => {
  const handlePress = async () => {
    if (metadata.url) {
      const supported = await Linking.canOpenURL(metadata.url);
      if (supported) {
        await Linking.openURL(metadata.url);
      }
    }
  };

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {metadata.image_url && (
        <Image 
          source={{ uri: metadata.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      {(metadata.title || metadata.description || metadata.url) && (
        <View style={styles.content}>
          {metadata.publisher && (
            <Text style={styles.publisher} numberOfLines={1}>
              {metadata.publisher}
            </Text>
          )}
          {!metadata.publisher && metadata.url && (
            <Text style={styles.publisher} numberOfLines={1}>
              {getDomain(metadata.url)}
            </Text>
          )}
          {metadata.title && (
            <Text style={styles.title} numberOfLines={2}>
              {metadata.title}
            </Text>
          )}
          {metadata.description && (
            <Text style={styles.description} numberOfLines={2}>
              {metadata.description}
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
  publisher: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    fontWeight: '500',
    color: SystemColors.secondaryLabel,
    marginBottom: 4,
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

export default EmbedPreview;
