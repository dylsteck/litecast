import React from 'react';
import { Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Button, YStack, Text } from 'tamagui';

import { useLogin } from '../providers/NeynarProvider';

const NeynarAuth: React.FC = () => {
  const { farcasterUser, handleSignIn, loading } = useLogin();

  if (!farcasterUser) {
    return (
      <Button onPress={handleSignIn} disabled={loading} style={{backgroundColor: '#855DCD'}}>
        <Text color="white">
          {loading ? 'Loading...' : 'connect with warpcast'}
        </Text>
      </Button>
    );
  }

  if (farcasterUser.status === 'pending_approval' && farcasterUser.signer_approval_url) {
    return (
      <YStack>
        <QRCode value={farcasterUser.signer_approval_url} />
        <Text onPress={() => Linking.openURL(farcasterUser.signer_approval_url ?? '')} style={{paddingTop: 15}}>
          Click here to view the signer URL
        </Text>
      </YStack>
    );
  }

  return <Text>{`You are logged in as fid ${farcasterUser.fid}`}</Text>;
};

export default NeynarAuth;