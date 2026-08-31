import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemColors } from '../../constants/Colors';
import {
  avatarUrl,
  displayName,
  handle,
  threadHref,
  type Cast,
  type CastEmbeds as Embeds,
} from '../../lib/farcaster';

export function CastEmbeds({ embeds }: { embeds?: Embeds }) {
  if (!embeds) return null;

  return (
    <View style={styles.wrap}>
      {(embeds.images ?? []).slice(0, 3).map((image) => (
        <Image key={image.url} source={{ uri: image.media?.staticRaster ?? image.url }} style={styles.image} />
      ))}
      {(embeds.casts ?? []).slice(0, 1).map((cast) => (
        <QuoteCast key={cast.hash} cast={cast} />
      ))}
      {(embeds.urls ?? []).slice(0, 2).map((item) => (
        <Pressable key={item.url} onPress={() => WebBrowser.openBrowserAsync(item.url)} style={styles.link}>
          <Ionicons name="link-outline" size={16} color={SystemColors.secondaryLabel} />
          <View style={styles.linkText}>
            <Text numberOfLines={1} style={styles.linkTitle}>
              {item.openGraph?.title || item.openGraph?.domain || item.url}
            </Text>
            {item.openGraph?.description ? (
              <Text numberOfLines={2} style={styles.linkBody}>
                {item.openGraph.description}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ))}
      {(embeds.videos ?? []).slice(0, 1).map((video) => (
        <Pressable key={video.url} onPress={() => WebBrowser.openBrowserAsync(video.url)} style={styles.link}>
          <Ionicons name="play-circle-outline" size={18} color={SystemColors.label} />
          <Text style={styles.linkTitle}>Watch video</Text>
        </Pressable>
      ))}
    </View>
  );
}

function QuoteCast({ cast }: { cast: Cast }) {
  return (
    <Pressable onPress={() => router.push(threadHref(cast))} style={quote.box}>
      <View style={quote.meta}>
        <Image source={{ uri: avatarUrl(cast.author) }} style={quote.pfp} />
        <Text style={quote.name}>{displayName(cast.author)}</Text>
        <Text style={quote.handle}>{handle(cast.author)}</Text>
      </View>
      {cast.text ? <Text style={quote.text}>{cast.text}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10, gap: 8 },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: SystemColors.secondaryBackground,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  linkText: { flex: 1, minWidth: 0 },
  linkTitle: { fontSize: 14, color: SystemColors.label, fontWeight: '500' },
  linkBody: { fontSize: 13, color: SystemColors.secondaryLabel, marginTop: 2 },
});

const quote = StyleSheet.create({
  box: {
    marginTop: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
    borderRadius: 12,
    padding: 12,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  pfp: { width: 18, height: 18, borderRadius: 9, backgroundColor: SystemColors.secondaryBackground },
  name: { fontSize: 13, fontWeight: '600', color: SystemColors.label },
  handle: { fontSize: 13, color: SystemColors.secondaryLabel },
  text: { fontSize: 14, lineHeight: 20, color: SystemColors.label },
});
