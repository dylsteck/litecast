import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useCastActions } from '../hooks/useCastActions';
import { SystemColors } from '../constants/Colors';

export function ComposeCast({ parentHash }: { parentHash?: string }) {
  const [text, setText] = useState('');
  const { compose, canWrite } = useCastActions();

  const submit = () => {
    const next = text.trim();
    if (!next || compose.isPending) return;
    compose.mutate(
      { text: next, parentHash },
      {
        onSuccess: () => setText(''),
      },
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={88}>
      <View style={styles.wrap}>
        <BlurView intensity={80} tint="systemMaterial" style={styles.glass}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={canWrite ? (parentHash ? 'write a reply…' : 'cast something…') : 'sign in to cast'}
            placeholderTextColor="#666"
            style={styles.input}
            editable={!compose.isPending}
          />
          <TouchableOpacity onPress={submit} style={styles.send} disabled={!text.trim()}>
            <FontAwesome name="send" size={15} color={text.trim() ? '#000' : SystemColors.tertiaryLabel} />
          </TouchableOpacity>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingBottom: Platform.OS === 'web' ? 16 : 88 },
  glass: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 44,
  },
  input: { flex: 1, fontSize: 16, color: SystemColors.label, paddingVertical: 10 },
  send: { padding: 8 },
});
