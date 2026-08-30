import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SystemColors } from '../constants/Colors';
import { displayName, formatRelativeTime, type NotificationGroup } from '../lib/farcaster';

function iconFor(type: string): { name: React.ComponentProps<typeof Ionicons>['name']; color: string } {
  if (type.includes('like') || type.includes('reaction')) return { name: 'heart', color: '#F91880' };
  if (type.includes('recast')) return { name: 'repeat', color: '#00BA7C' };
  if (type.includes('follow')) return { name: 'person-add', color: '#794BC4' };
  if (type.includes('reply') || type.includes('mention') || type.includes('quote')) {
    return { name: 'chatbubble', color: '#1D9BF0' };
  }
  return { name: 'notifications', color: SystemColors.secondaryLabel };
}

function labelFor(group: NotificationGroup): string {
  const preview = group.previewItems?.[0];
  const actor = preview?.user ?? preview?.actor;
  const who = actor ? displayName(actor) : 'Someone';
  const extra = group.totalItemCount > 1 ? ` and ${group.totalItemCount - 1} others` : '';
  if (group.type.includes('follow')) return `${who}${extra} followed you`;
  if (group.type.includes('like') || group.type.includes('reaction')) return `${who}${extra} liked your cast`;
  if (group.type.includes('recast')) return `${who}${extra} recasted you`;
  if (group.type.includes('reply')) return `${who}${extra} replied`;
  if (group.type.includes('mention')) return `${who}${extra} mentioned you`;
  if (group.type.includes('quote')) return `${who}${extra} quoted you`;
  return `${who}${extra} · ${group.type.replace(/-/g, ' ')}`;
}

export function NotificationRow({ group }: { group: NotificationGroup }) {
  const icon = iconFor(group.type);
  const cast = group.previewItems?.find((item) => item.cast)?.cast;

  return (
    <Pressable
      onPress={() => {
        if (cast) router.push(`/casts/${cast.hash}`);
      }}
      style={styles.row}
    >
      <Ionicons name={icon.name} size={18} color={icon.color} />
      <View style={styles.body}>
        <Text style={styles.title}>{labelFor(group)}</Text>
        {cast?.text ? (
          <Text numberOfLines={2} style={styles.preview}>
            {cast.text}
          </Text>
        ) : null}
      </View>
      <Text style={styles.time}>{formatRelativeTime(group.latestTimestamp)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, color: SystemColors.label, lineHeight: 20 },
  preview: { marginTop: 4, fontSize: 14, color: SystemColors.secondaryLabel, lineHeight: 19 },
  time: { fontSize: 13, color: SystemColors.tertiaryLabel },
});
