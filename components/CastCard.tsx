import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemColors } from '../constants/Colors';
import { useCastActions } from '../hooks/useCastActions';
import {
  avatarUrl,
  displayName,
  formatCount,
  formatRelativeTime,
  handle,
  includeReasonLabel,
  profileHref,
  threadHref,
  type Cast,
  type IncludeReason,
} from '../lib/farcaster';
import { UserAvatar } from './UserAvatar';
import { CastEmbeds } from './embeds/CastEmbeds';

export function CastCard({
  cast,
  truncate = true,
  reason,
  onView,
}: {
  cast: Cast;
  truncate?: boolean;
  reason?: IncludeReason;
  onView?: () => void;
}) {
  const actions = useCastActions();
  const liked = Boolean(cast.viewerContext?.reacted);
  const recasted = Boolean(cast.viewerContext?.recast);
  const text = truncate && cast.text.length > 280 ? `${cast.text.slice(0, 280)}…` : cast.text;
  const reasonLabel = includeReasonLabel(reason);

  return (
    <Pressable
      onPress={() => {
        onView?.();
        router.push(threadHref(cast));
      }}
      onLongPress={() => {
        actions.hideCast(cast.hash);
      }}
      style={styles.row}
    >
      <UserAvatar fid={cast.author.fid} pfpUrl={avatarUrl(cast.author)} username={cast.author.username} size={40} />
      <View style={styles.body}>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName(cast.author)}
          </Text>
          <Text style={styles.handle} numberOfLines={1}>
            {handle(cast.author)}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(cast.timestamp)}</Text>
        </View>
        {reasonLabel ? <Text style={styles.reason}>{reasonLabel}</Text> : null}
        {text ? <Text style={styles.text}>{text}</Text> : null}
        <CastEmbeds embeds={cast.embeds} />
        <View style={styles.actions}>
          <Action
            icon="chatbubble-outline"
            count={cast.replies?.count}
            onPress={() => router.push(threadHref(cast))}
          />
          <Action
            icon={recasted ? 'repeat' : 'repeat-outline'}
            count={cast.recasts?.count}
            color={recasted ? '#00BA7C' : SystemColors.secondaryLabel}
            onPress={() => actions.recast.mutate({ hash: cast.hash, recasted })}
          />
          <Action
            icon={liked ? 'heart' : 'heart-outline'}
            count={cast.reactions?.count}
            color={liked ? '#F91880' : SystemColors.secondaryLabel}
            onPress={() => actions.like.mutate({ hash: cast.hash, liked })}
          />
          <Pressable
            onPress={() => router.push(profileHref(cast.author))}
            hitSlop={8}
            style={styles.more}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color={SystemColors.tertiaryLabel} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function Action({
  icon,
  count,
  color = SystemColors.secondaryLabel,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  count?: number;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.action}>
      <Ionicons name={icon} size={16} color={color} />
      {count ? <Text style={[styles.count, { color }]}>{formatCount(count)}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SystemColors.separator,
  },
  body: { flex: 1, minWidth: 0 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '600', color: SystemColors.label, maxWidth: '46%' },
  handle: { fontSize: 14, color: SystemColors.secondaryLabel, flexShrink: 1 },
  time: { fontSize: 14, color: SystemColors.secondaryLabel, marginLeft: 'auto' },
  reason: { fontSize: 12, color: SystemColors.tertiaryLabel, marginBottom: 4 },
  text: { fontSize: 16, lineHeight: 22, color: SystemColors.label, letterSpacing: -0.2 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 22 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  count: { fontSize: 13 },
  more: { marginLeft: 'auto' },
});

