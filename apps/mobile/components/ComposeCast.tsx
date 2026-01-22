import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';

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
            intensity={80}
            tint="systemMaterial"
            style={styles.glassInputWrapper}
          >
            <View style={styles.composeInputContainer}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                placeholderTextColor={"#666"}
                style={styles.composeInput}
              />
              <TouchableOpacity onPress={handleCast} style={styles.composeButton}>
                <BlurView
                  intensity={100}
                  tint="light"
                  style={styles.sendButton}
                >
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