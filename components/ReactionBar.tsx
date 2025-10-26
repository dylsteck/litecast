import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Reaction {
  icon: string;
  count: number;
  onPress?: () => void;
}

interface ReactionBarProps {
  reactions: Reaction[];
}

export function ReactionBar({ reactions }: ReactionBarProps) {
  return (
    <View style={styles.container}>
      {reactions.map((reaction, i) => (
        <TouchableOpacity 
          key={i} 
          onPress={reaction.onPress} 
          disabled={!reaction.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.item}>
            <FontAwesome name={reaction.icon} size={14} color="#8E8E93" />
            <Text style={styles.count}>{reaction.count}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginTop: 8,
    paddingBottom: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  count: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
});

