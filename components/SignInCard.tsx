import { BlurView } from 'expo-blur';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SystemColors } from '../constants/Colors';
import { useSession } from '../providers/SessionProvider';

export function SignInCard({ compact = false, autoStart = false }: { compact?: boolean; autoStart?: boolean }) {
  const {
    signInWithCompanion,
    signInWithWallet,
    signInWithPhrase,
    cancelCompanion,
    signOut,
    isSignedIn,
    user,
    hasWallet,
  } = useSession();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<'qr' | 'wallet' | 'phrase' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [phrase, setPhrase] = useState('');

  const startQr = async () => {
    setError(null);
    setBusy('qr');
    try {
      await signInWithCompanion(({ url: next }) => {
        setUrl(next);
        setBusy(null);
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Could not start companion login');
      setBusy(null);
    }
  };

  useEffect(() => {
    if (autoStart && !isSignedIn) void startQr();
    return () => cancelCompanion();
    // Start once when the landing card mounts; stop polling if the user leaves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, isSignedIn, cancelCompanion]);

  if (isSignedIn && user) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Signed in as {user.displayName}</Text>
        <Text style={styles.body}>{user.username ? `@${user.username}` : `fid ${user.fid}`}</Text>
        <TouchableOpacity onPress={() => void signOut()} style={styles.secondary}>
          <Text style={styles.secondaryText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.body}>
        Scan with the Farcaster app to unlock For You, casts, likes, and inbox. Or sign with the wallet that holds
        your custody address.
      </Text>

      {url ? (
        <View style={styles.qr}>
          <QRCode value={url} size={168} />
        </View>
      ) : null}

      <BlurView intensity={80} tint="light" style={styles.ctaWrap}>
        <TouchableOpacity onPress={() => void startQr()} style={styles.cta} disabled={busy !== null}>
          {busy === 'qr' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>{url ? 'Refresh QR' : 'Scan with Farcaster'}</Text>
          )}
        </TouchableOpacity>
      </BlurView>

      {url ? (
        <TouchableOpacity onPress={() => void WebBrowser.openBrowserAsync(url)} style={styles.secondary}>
          <Text style={styles.secondaryText}>Open Farcaster</Text>
        </TouchableOpacity>
      ) : null}

      {hasWallet ? (
        <TouchableOpacity
          onPress={async () => {
            setError(null);
            setBusy('wallet');
            try {
              await signInWithWallet();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Wallet sign-in failed');
            } finally {
              setBusy(null);
            }
          }}
          style={styles.secondary}
          disabled={busy !== null}
        >
          {busy === 'wallet' ? (
            <ActivityIndicator color={SystemColors.secondaryLabel} />
          ) : (
            <Text style={styles.secondaryText}>Continue with wallet</Text>
          )}
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity onPress={() => setShowPhrase((value) => !value)} style={styles.secondary}>
        <Text style={styles.secondaryText}>{showPhrase ? 'Hide recovery phrase' : 'Use a recovery phrase'}</Text>
      </TouchableOpacity>

      {showPhrase ? (
        <View style={styles.phrase}>
          <TextInput
            value={phrase}
            onChangeText={setPhrase}
            placeholder="twelve or twenty four words"
            placeholderTextColor={SystemColors.tertiaryLabel}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            style={styles.input}
          />
          <TouchableOpacity
            onPress={async () => {
              setError(null);
              setBusy('phrase');
              try {
                await signInWithPhrase(phrase);
                setPhrase('');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Recovery phrase sign-in failed');
              } finally {
                setBusy(null);
              }
            }}
            style={styles.phraseCta}
            disabled={busy !== null || phrase.trim().length === 0}
          >
            {busy === 'phrase' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  cta: { paddingHorizontal: 28, paddingVertical: 12, minWidth: 160, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondary: { alignSelf: 'flex-start', minHeight: 24, justifyContent: 'center' },
  secondaryText: { color: SystemColors.secondaryLabel, fontSize: 15 },
  phrase: { gap: 10 },
  input: {
    minHeight: 88,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    color: SystemColors.label,
    backgroundColor: SystemColors.secondaryBackground,
    textAlignVertical: 'top',
  },
  phraseCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  error: { fontSize: 14, lineHeight: 20, color: '#C41E3A' },
});
