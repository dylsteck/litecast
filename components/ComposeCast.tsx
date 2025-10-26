import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
// todo: fix cannot find module error for images
import CastIcon from '../assets/images/castIcon.png';
import { BlurView } from 'expo-blur';

const ComposeCast = ({ hash }: { hash?: string }) => {
  const DEFAULT_PLACEHOLDER = 'cast something...';
  const [text, setText] = useState<string>('');
  const [placeholder, setPlaceholder] = useState<string>(DEFAULT_PLACEHOLDER);

  const handleCast = useCallback(async () => {
    // TODO: Implement cast posting with new auth system
    console.log('Cast posting disabled:', text);
    setText('');
    setPlaceholder('posting disabled');
    setTimeout(() => setPlaceholder(DEFAULT_PLACEHOLDER), 1500);
  }, [text]);

  return (
    <KeyboardAvoidingView
    style={{ marginTop: 0 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <BlurView
            intensity={50}
            tint="light"
            style={styles.glassInputWrapper}
          >
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
          </BlurView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  glassInputWrapper: {
    margin: 10,
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(242, 242, 242, 0.8)',
  },
  composeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    paddingRight: 0,
  },
  composeInputContainer: {
    flexDirection: 'row',
    minHeight: 40,
    paddingHorizontal: 15,
    paddingVertical: 10,
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