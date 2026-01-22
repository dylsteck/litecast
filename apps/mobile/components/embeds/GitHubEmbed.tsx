import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { NeynarEmbed } from '../../lib/neynar/types';
import { SystemColors } from '../../constants/Colors';
import { getDomain } from './utils';

interface GitHubEmbedProps {
  embed: NeynarEmbed;
}

const GitHubEmbed = ({ embed }: GitHubEmbedProps) => {
  const url = embed.url || '';
  const title = embed.metadata?.html?.ogTitle || embed.metadata?.title || embed.open_graph?.title;
  const description = embed.metadata?.html?.ogDescription || embed.metadata?.description || embed.open_graph?.description;
  const imageUrl = embed.metadata?.html?.ogImage?.[0]?.url || embed.metadata?.image_url || embed.open_graph?.image_url;
  const favicon = embed.metadata?.html?.favicon;

  // Extract repo info from URL (e.g., "owner/repo")
  const getRepoPath = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        return `${pathParts[0]}/${pathParts[1]}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const repoPath = getRepoPath(url);
  const domain = getDomain(url);

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
          <Image 
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {(title || description || repoPath) && (
            <View style={styles.content}>
              <View style={styles.header}>
                <Ionicons name="logo-github" size={16} color={SystemColors.label} />
                {repoPath && (
                  <Text style={styles.repoPath} numberOfLines={1}>
                    {repoPath}
                  </Text>
                )}
              </View>
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
          <Ionicons name="logo-github" size={32} color={SystemColors.label} />
          {repoPath && (
            <Text style={styles.repoPath} numberOfLines={1}>
              {repoPath}
            </Text>
          )}
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
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: SystemColors.separator,
  },
  content: {
    padding: 12,
    backgroundColor: SystemColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  repoPath: {
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
    minHeight: 120,
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

export default GitHubEmbed;
