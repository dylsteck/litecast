import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { NeynarNotification } from '../lib/neynar/types';
import { SystemColors } from '../constants/Colors';

interface NotificationProps {
  notification: NeynarNotification;
}

const Notification = ({ notification }: NotificationProps) => {
  // Format relative time nicely (e.g., "22m", "3h", "2d")
  const formatTime = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return `${Math.floor(diffDays / 7)}w`
  }

  const relativeTime = formatTime(notification.most_recent_timestamp)

  const getNotificationIcon = () => {
    const iconSize = 20;
    switch (notification.type) {
      case 'mentions':
      case 'replies':
        return { name: 'chatbubble' as const, color: '#1D9BF0' };
      case 'recasts':
        return { name: 'repeat' as const, color: '#00BA7C' };
      case 'likes':
        return { name: 'heart' as const, color: '#F91880' };
      case 'follows':
        return { name: 'person-add' as const, color: '#794BC4' };
      default:
        return { name: 'notifications' as const, color: SystemColors.secondaryLabel };
    }
  };

  const getNotificationText = () => {
    const count = notification.count || 1;
    
    if (notification.type === 'follows' && notification.follows) {
      const users = notification.follows.slice(0, 3).map(f => f.user.display_name);
      const remaining = notification.follows.length - 3;
      
      if (notification.follows.length === 1) {
        return `${users[0]} followed you`;
      } else if (notification.follows.length <= 3) {
        return `${users.join(', ')} followed you`;
      } else {
        return `${users.join(', ')} and ${remaining} others followed you`;
      }
    }
    
    if (notification.reactions && notification.reactions.length > 0) {
      const users = notification.reactions.slice(0, 3).map(r => r.user.display_name);
      const remaining = notification.reactions.length - 3;
      
      if (notification.type === 'likes') {
        if (notification.reactions.length === 1) {
          return `${users[0]} liked your cast`;
        } else if (notification.reactions.length <= 3) {
          return `${users.join(', ')} liked your cast`;
        } else {
          return `${users.join(', ')} and ${remaining} others liked your cast`;
        }
      }
      
      if (notification.type === 'recasts') {
        if (notification.reactions.length === 1) {
          return `${users[0]} recasted your cast`;
        } else if (notification.reactions.length <= 3) {
          return `${users.join(', ')} recasted your cast`;
        } else {
          return `${users.join(', ')} and ${remaining} others recasted your cast`;
        }
      }
    }
    
    if (notification.cast) {
      if (notification.type === 'mentions') {
        return `${notification.cast.author.display_name} mentioned you`;
      }
      if (notification.type === 'replies') {
        return `${notification.cast.author.display_name} replied to your cast`;
      }
    }
    
    return 'New notification';
  };

  const getAvatars = () => {
    if (notification.type === 'follows' && notification.follows) {
      return notification.follows.slice(0, 3).map(f => f.user.pfp_url);
    }
    
    if (notification.reactions && notification.reactions.length > 0) {
      return notification.reactions.slice(0, 3).map(r => r.user.pfp_url);
    }
    
    if (notification.cast) {
      return [notification.cast.author.pfp_url];
    }
    
    return [];
  };

  const avatars = getAvatars();
  const notificationText = getNotificationText();
  const iconConfig = getNotificationIcon();
  
  // Priority notifications: mentions, replies, or unseen
  const isPriority = (notification.type === 'mentions' || notification.type === 'replies') || 
                     (notification.seen === false || notification.seen === undefined);
  
  const content = (
    <View style={[styles.notificationCard, isPriority && styles.priorityCard]}>
      <View style={styles.notificationContainer}>
        {/* Colored Icon on Left */}
        <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
          <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
        </View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Avatars - simplified single or first avatar */}
          {avatars.length > 0 && (
            <Image
              source={{ uri: avatars[0] }}
              style={styles.avatar}
            />
          )}
          
          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.notificationText} numberOfLines={2}>
              {notificationText}
            </Text>
            <Text style={styles.timestamp}>{relativeTime}</Text>
            
            {/* Cast preview */}
            {notification.cast && notification.cast.text && (
              <Text style={styles.castPreview} numberOfLines={2}>
                {notification.cast.text}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  if (notification.cast) {
    return (
      <Link href={`/casts/${notification.cast.hash}`} asChild>
        <TouchableOpacity activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      </Link>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  notificationCard: {
    backgroundColor: SystemColors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  notificationContainer: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  notificationText: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 15,
    fontWeight: '400',
    color: SystemColors.label,
    lineHeight: 20,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  timestamp: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    fontWeight: '400',
    color: SystemColors.secondaryLabel,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  castPreview: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 14,
    color: SystemColors.secondaryLabel,
    lineHeight: 19,
    marginTop: 6,
    letterSpacing: -0.1,
  },
  priorityCard: {
    backgroundColor: SystemColors.secondaryBackground,
  },
});

export default Notification;

