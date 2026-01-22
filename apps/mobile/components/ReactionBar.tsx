import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SystemColors } from '../constants/Colors';

interface Reaction {
  icon: string;
  count: number;
  onPress?: () => void;
  active?: boolean;
}

interface ReactionBarProps {
  reactions: Reaction[];
}

// Icon configuration with filled/outline variants and colors
const iconConfig: Record<string, { 
  outline: React.ComponentProps<typeof Ionicons>['name'];
  filled: React.ComponentProps<typeof Ionicons>['name'];
  activeColor: string;
}> = {
  comment: { outline: 'chatbubble-outline', filled: 'chatbubble', activeColor: SystemColors.secondaryLabel },
  retweet: { outline: 'repeat-outline', filled: 'repeat', activeColor: '#00BA7C' },
  heart: { outline: 'heart-outline', filled: 'heart', activeColor: '#F91880' },
};

export function ReactionBar({ reactions }: ReactionBarProps) {
  return (
    <View style={styles.container}>
      {reactions.map((reaction, i) => {
        const config = iconConfig[reaction.icon] || { 
          outline: 'ellipse-outline', 
          filled: 'ellipse', 
          activeColor: SystemColors.secondaryLabel 
        };
        const isActive = reaction.active === true;
        const isHeart = reaction.icon === 'heart';
        const isRetweet = reaction.icon === 'retweet';
        
        // Determine icon and color based on active state
        const iconName = isActive ? config.filled : config.outline;
        const iconColor = isActive ? config.activeColor : SystemColors.secondaryLabel;
        
        return (
          <TouchableOpacity 
            key={i} 
            onPress={reaction.onPress} 
            disabled={!reaction.onPress}
            activeOpacity={0.6}
            style={styles.touchable}
          >
            <View style={styles.item}>
              <Ionicons 
                name={iconName} 
                size={17} 
                color={iconColor} 
              />
              {reaction.count > 0 && (
                <Text style={[
                  styles.count,
                  isActive && (isHeart || isRetweet) && { color: config.activeColor }
                ]}>
                  {reaction.count}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  touchable: {
    marginRight: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  count: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    color: SystemColors.secondaryLabel,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});

