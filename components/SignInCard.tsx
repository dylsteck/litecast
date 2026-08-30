import { BlurView } from 'expo-blur';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SystemColors } from '../constants/Colors';
import { useSession } from '../providers/SessionProvider';

export function SignInCard({ compact = false }: { compact?: boolean }) {
  const { signInWithFarcaster, isSignedIn, user, signOut } = useSession();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try {
      const channel = await signInWithFarcaster();
      setUrl(channel.url);
      if (channel.url) {
        void WebBrowser.openBrowserAsync(channel.url);
      }
    } finally {
      setBusy(false);
    }
  };

  if (isSignedIn && user) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Signed in as {user.displayName}</Text>
        <Text style={styles.body}>
          {user.username ? `@${user.username}` : `fid ${user.fid}`}
        </Text>
        <TouchableOpacity onPress={() => void signOut()} style={styles.secondary}>
          <Text style={styles.secondaryText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Text style={styles.title}>Sign in with Farcaster</Text>
      <Text style={styles.body}>
        Scan the QR with the Farcaster app. Identity works immediately. Ranked Home, inbox, and writes use the official Farcaster API session.
      </Text>
      {url ? (
        <View style={styles.qr}>
          <QRCode value={url} size={168} />
        </View>
      ) : null}
      <BlurView intensity={80} tint="light" style={styles.ctaWrap}>
        <TouchableOpacity onPress={() => void start()} style={styles.cta} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>{url ? 'Refresh QR' : 'Continue'}</Text>}
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 20, paddingVertical: 24, gap: 10 },
  compact: { paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '500', color: SystemColors.label, letterSpacing: -0.4 },
  body: { fontSize: 15, lineHeight: 21, color: SystemColors.secondaryLabel },
  qr: { alignItems: 'center', paddingVertical: 12 },
  ctaWrap: { alignSelf: 'flex-start', borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  cta: { paddingHorizontal: 28, paddingVertical: 12, minWidth: 120, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondary: { alignSelf: 'flex-start', marginTop: 8 },
  secondaryText: { color: SystemColors.secondaryLabel, fontSize: 15 },
});
