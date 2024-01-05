import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';

import CastIcon from '../assets/images/castIcon.png';
import { API_URL } from '../constants/Farcaster';
import { useLogin } from '../providers/NeynarProvider';

const ComposeCast = ({ hash }: { hash?: string }) => {
  const DEFAULT_PLACEHOLDER = 'cast something...';
  const [text, setText] = useState('');
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const { farcasterUser } = useLogin();

  const handleCast = useCallback(async () => {
    if (farcasterUser) {
      try {
        const respBody = {
          parent: hash ? hash : '',
          signer_uuid: farcasterUser.signer_uuid,
          text: text,
        };
        console.log(respBody);
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
          setPlaceholder('cast posted!')
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
    <View style={styles.composeContainer}>
      <View style={styles.composeInputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          style={styles.composeInput}
        />
        <TouchableOpacity onPress={handleCast} style={styles.composeButton}>
          <Image source={CastIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  composeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    paddingRight: 0,
  },
  composeContainer: {
    backgroundColor: 'white',
    borderTopColor: '#EAEAEA',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
  },
  composeInput: {
    flex: 1,
    paddingVertical: 10,
  },
  composeInputContainer: {
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 15,
    marginLeft: 10,
    marginRight: 10,
    paddingHorizontal: 15,
  },
  icon: {
    height: 24,
    resizeMode: 'contain',
    width: 24,
  },
});

export default ComposeCast;