import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemColors } from '../constants/Colors';
import { useCastActions } from '../hooks/useCastActions';
import { avatarUrl, displayName, formatCount, handle, type User } from '../lib/farcaster';

export function ProfileCard({ user }: { user: User }) {
  const { follow } = useCastActions();
  const following = Boolean(user.viewerContext?.following);

  return (
    <View style={styles.wrap}>
      {user.profile?.bannerImageUrl ? (
        <Image source={{ uri: user.profile.bannerImageUrl }} style={styles.banner} />
      ) : (
        <View style={styles.banner} />
      )}
      <Image source={{ uri: avatarUrl(user) }} style={styles.pfp} />
      <View style={styles.meta}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{displayName(user)}</Text>
            <Text style={styles.handle}>{handle(user)}</Text>
          </View>
          <Pressable
            onPress={() => follow.mutate({ fid: user.fid, following })}
            style={[styles.follow, following && styles.following]}
          >
            <Text style={[styles.followText, following && styles.followingText]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        </View>
        {user.profile?.bio?.text ? <Text style={styles.bio}>{user.profile.bio.text}</Text> : null}
        <Text style={styles.counts}>
          <Text style={styles.strong}>{formatCount(user.followingCount) || 0}</Text> following
          {'   '}
          <Text style={styles.strong}>{formatCount(user.followerCount) || 0}</Text> followers
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  banner: { height: 120, backgroundColor: SystemColors.secondaryBackground },
  pfp: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginTop: -36,
    marginLeft: 16,
    borderWidth: 3,
    borderColor: SystemColors.background,
    backgroundColor: SystemColors.secondaryBackground,
  },
  meta: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '600', color: SystemColors.label, letterSpacing: -0.4 },
  handle: { fontSize: 15, color: SystemColors.secondaryLabel, marginTop: 2 },
  bio: { fontSize: 16, lineHeight: 22, color: SystemColors.label },
  counts: { fontSize: 14, color: SystemColors.secondaryLabel },
  strong: { color: SystemColors.label, fontWeight: '600' },
  follow: {
    backgroundColor: SystemColors.label,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: { color: SystemColors.background, fontWeight: '600' },
  following: { backgroundColor: SystemColors.background, borderWidth: 1, borderColor: SystemColors.separator },
  followingText: { color: SystemColors.label },
});
