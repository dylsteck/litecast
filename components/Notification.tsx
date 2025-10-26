import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { formatDistanceToNow } from 'date-fns';
import { NeynarNotification } from '../lib/neynar/types';
import _ from 'lodash';

interface NotificationProps {
  notification: NeynarNotification;
}

const Notification = ({ notification }: NotificationProps) => {
  const relativeTime = formatDistanceToNow(new Date(notification.most_recent_timestamp), {
    addSuffix: true,
  });

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'mentions':
      case 'replies':
        return <FontAwesome name="comment" size={16} color="#8B5CF6" />;
      case 'recasts':
        return <FontAwesome name="retweet" size={16} color="#10B981" />;
      case 'likes':
        return <FontAwesome name="heart" size={16} color="#EF4444" />;
      case 'follows':
        return <FontAwesome name="user-plus" size={16} color="#3B82F6" />;
      default:
        return <FontAwesome name="bell" size={16} color="#666" />;
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
  
  const content = (
    <GlassView tint="light" style={styles.glassContainer}>
      <View style={styles.notificationContainer}>
        {/* Activity Icon on Left */}
        <View style={styles.iconContainer}>
          {getNotificationIcon()}
        </View>
        
        {/* Content on Right */}
        <View style={styles.contentContainer}>
          {/* Avatars above text */}
          <View style={styles.avatarsContainer}>
            {avatars.slice(0, 3).map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={[
                  styles.avatar,
                  index > 0 && { marginLeft: -10 },
                ]}
              />
            ))}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.notificationText}>{notificationText}</Text>
            <Text style={styles.timestamp}>
              {_.replace(relativeTime, 'about ', '')}
            </Text>
          </View>
          
          {notification.cast && notification.cast.text && (
            <Text style={styles.castPreview} numberOfLines={2}>
              {notification.cast.text}
            </Text>
          )}
        </View>
      </View>
    </GlassView>
  );

  if (notification.cast) {
    return (
      <Link href={`/conversation?hash=${notification.cast.hash}`}>
        {content}
      </Link>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  glassContainer: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  notificationContainer: {
    flexDirection: 'row',
    padding: 12,
    width: '100%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  textContainer: {
    marginBottom: 4,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
    fontWeight: '300',
    marginTop: 2,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    lineHeight: 18,
  },
  castPreview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default Notification;

