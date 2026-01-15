import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Link } from 'expo-router';
import { NeynarCast } from '../lib/neynar/types';
import { UserAvatar } from './UserAvatar';
import { SystemColors } from '../constants/Colors';

interface QuoteCastProps {
  cast: NeynarCast;
}

const QuoteCast = ({ cast }: QuoteCastProps) => {
  // Format relative time nicely (e.g., "22m", "3h", "2d")
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  const relativeTime = formatTime(cast.timestamp);

  return (
    <Link href={`/casts/${cast.hash}`} style={styles.link}>
      <View style={styles.container}>
        <View style={styles.header}>
          <UserAvatar 
            fid={cast.author.fid} 
            pfpUrl={cast.author.pfp_url ?? ''} 
            username={cast.author.username}
            size={28}
          />
          <View style={styles.headerText}>
            <Text numberOfLines={1}>
              <Text style={styles.displayName}>{cast.author.display_name}</Text>
              <Text style={styles.username}> @{cast.author.username}</Text>
              <Text style={styles.separator}> · </Text>
              <Text style={styles.timestamp}>{relativeTime}</Text>
            </Text>
          </View>
        </View>
        <Text style={styles.castText} numberOfLines={3}>
          {cast.text}
        </Text>
      </View>
    </Link>
  );
};

const styles = StyleSheet.create({
  link: {
    marginTop: 12,
  },
  container: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
    backgroundColor: SystemColors.background,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
    minWidth: 0,
  },
  displayName: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif-medium', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui' 
    }),
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: -0.2,
    color: SystemColors.label,
  },
  username: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontWeight: '400',
    fontSize: 14,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  separator: {
    color: SystemColors.secondaryLabel,
    fontSize: 14,
  },
  timestamp: {
    fontWeight: '400',
    fontSize: 14,
    color: SystemColors.secondaryLabel,
    letterSpacing: -0.1,
  },
  castText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    color: SystemColors.label,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});

export default QuoteCast;
