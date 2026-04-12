import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { buildSignedCastAddJson } from '@litecast/farcaster-messages';
import { usePublishCastMessage } from '@litecast/hooks';
import { useAuth } from '../hooks/useAuth';

const ComposeCast = ({
  hash,
  parentAuthorFid,
}: {
  hash?: string;
  parentAuthorFid?: number;
}) => {
  const DEFAULT_PLACEHOLDER = 'cast something...';
  const [text, setText] = useState<string>('');
  const [placeholder, setPlaceholder] = useState<string>(DEFAULT_PLACEHOLDER);
  const { canWrite, session } = useAuth();
  const publish = usePublishCastMessage();

  const handleCast = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!canWrite || !session?.signer?.fid || !session.signer.privateKey) {
      setPlaceholder('sign in & enable posting');
      setTimeout(() => setPlaceholder(DEFAULT_PLACEHOLDER), 2000);
      return;
    }
    try {
      const parent =
        hash && parentAuthorFid != null
          ? { fid: parentAuthorFid, hash }
          : undefined;
      const message = await buildSignedCastAddJson({
        fid: session.signer.fid,
        signerPrivateKeyHex: session.signer.privateKey,
        text: trimmed,
        parent,
      });
      await publish.mutateAsync(message);
      setText('');
      setPlaceholder(DEFAULT_PLACEHOLDER);
    } catch (e) {
      console.error('Cast publish error:', e);
      setPlaceholder('failed — try again');
      setTimeout(() => setPlaceholder(DEFAULT_PLACEHOLDER), 2000);
    }
  }, [text, canWrite, session, hash, parentAuthorFid, publish]);

  return (
    <KeyboardAvoidingView
      style={{ marginTop: 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {!canWrite && (
            <Text style={styles.hint}>Connect Farcaster & complete signer to post.</Text>
          )}
          <BlurView intensity={80} tint="systemMaterial" style={styles.glassInputWrapper}>
            <View style={styles.composeInputContainer}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                placeholderTextColor={'#666'}
                style={styles.composeInput}
              />
              <TouchableOpacity
                onPress={handleCast}
                style={styles.composeButton}
                disabled={publish.isPending}
              >
                <BlurView intensity={100} tint="light" style={styles.sendButton}>
                  <FontAwesome name="send" size={16} color="#000" />
                </BlurView>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  hint: {
    marginHorizontal: 16,
    marginBottom: 6,
    fontSize: 12,
    color: '#666',
  },
  glassInputWrapper: {
    margin: 12,
    marginBottom: 100,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  composeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  composeInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  composeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default ComposeCast;
