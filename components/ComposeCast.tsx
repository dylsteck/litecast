import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
// todo: fix cannot find module error for images
import CastIcon from '../assets/images/castIcon.png';
import { API_URL } from '../constants/Farcaster';
import { useLogin } from 'farcasterkit-react-native';
// import { useLogin } from '../providers/NeynarProvider';

const ComposeCast = ({ hash }: { hash?: string }) => {
  const DEFAULT_PLACEHOLDER = 'cast something...';
  const [text, setText] = useState<string>('');
  const [placeholder, setPlaceholder] = useState<string>(DEFAULT_PLACEHOLDER);
  const { farcasterUser } = useLogin();

  const handleCast = useCallback(async () => {
    if (farcasterUser) {
      try {
        const respBody = {
          parent: hash ? hash : '',
          signer_uuid: farcasterUser.signer_uuid,
          text: text,
        };
        const response = await fetch(`${API_URL}/neynar/cast`, {
          body: JSON.stringify(respBody),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const result = await response.json();
        if (response.ok) {
          setText('');
          setPlaceholder('cast posted!');
          setTimeout(() => setPlaceholder(DEFAULT_PLACEHOLDER), 1500);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Could not send the cast', error);
      }
    }
  }, [text, farcasterUser]);

  return (
    <KeyboardAvoidingView
    style={{ marginTop: 0 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={styles.composeInputContainer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={"#000"}
              style={styles.composeInput}
            />
            <TouchableOpacity onPress={handleCast} style={styles.composeButton}>
              <Image source={CastIcon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  composeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    paddingRight: 0,
  },
  composeInputContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    flexDirection: 'row',
    margin: 10,
    minHeight: 40,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 25,
  },
  composeInput: {
    flex: 1,
  },
  icon: {
    height: 24,
    resizeMode: 'contain',
    width: 24,
  },
});

export default ComposeCast;