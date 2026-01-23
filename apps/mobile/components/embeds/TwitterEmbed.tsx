import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import type { NeynarEmbed } from '@litecast/types';
import { SystemColors } from '../../constants/Colors';
import { parseTwitterHtml, extractTwitterHandle } from './utils';

interface TwitterEmbedProps {
  embed: NeynarEmbed;
}

const TwitterEmbed = ({ embed }: TwitterEmbedProps) => {
  const oembed = embed.metadata?.html?.oembed;
  const html = oembed?.html || '';
  const authorName = oembed?.author_name || '';
  const authorUrl = oembed?.author_url;
  const authorHandle = extractTwitterHandle(authorUrl);
  const tweetUrl = oembed?.url || embed.url || '';
  
  const { text: tweetText, date } = parseTwitterHtml(html);

  const handlePress = async () => {
    if (tweetUrl) {
      try {
        await WebBrowser.openBrowserAsync(tweetUrl);
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
      {/* Header with X logo */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {authorName && (
            <Text style={styles.authorName} numberOfLines={1}>
              {authorName}
            </Text>
          )}
          {authorHandle && (
            <Text style={styles.authorHandle} numberOfLines={1}>
              {' '}{authorHandle}
            </Text>
          )}
        </View>
        <Ionicons name="logo-twitter" size={16} color={SystemColors.secondaryLabel} />
      </View>

      {/* Tweet text */}
      {tweetText && (
        <Text style={styles.tweetText} numberOfLines={4}>
          {tweetText}
        </Text>
      )}

      {/* Footer with date and link */}
      <View style={styles.footer}>
        {date && (
          <Text style={styles.date} numberOfLines={1}>
            {date}
          </Text>
        )}
        <Text style={styles.viewLink} numberOfLines={1}>
          View on X
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
    backgroundColor: SystemColors.background,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  authorName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.2,
  },
  authorHandle: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '400',
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  tweetText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '400',
    color: SystemColors.label,
    lineHeight: 22,
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SystemColors.separator,
  },
  date: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    fontWeight: '400',
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  viewLink: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 13,
    fontWeight: '500',
    color: SystemColors.label,
    letterSpacing: -0.1,
  },
});

export default TwitterEmbed;
